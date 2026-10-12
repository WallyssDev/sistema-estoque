
const pool = require('../database/connection');
const { registrarAuditoria } = require('./auditoria.service');

const validarDataISO = (valor, obrigatoria = false) => {
    if (valor === null || valor === undefined || valor === '') {
        return !obrigatoria;
    }

    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        return false;
    }

    const data = new Date(`${valor}T00:00:00.000Z`);

    return (
        !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor
    );
};

const validarEquipamentoId = (equipamentoId) => {
    if (
        equipamentoId === null ||
        equipamentoId === undefined ||
        String(equipamentoId).trim() === '' ||
        !Number.isInteger(Number(equipamentoId)) ||
        Number(equipamentoId) <= 0
    ) {
        throw new Error('Selecione um equipamento válido');
    }
};

const validarDadosManutencao = ({
    tipo,
    dataManutencao,
    proximaManutencao,
    responsavel,
    descricao,
    resultado
}) => {
    const tiposPermitidos = [
        'PREVENTIVA',
        'CORRETIVA',
        'CALIBRACAO',
        'OUTRA'
    ];

    const resultadosPermitidos = [
        'APROVADO',
        'REPROVADO',
        'APROVADO_COM_RESTRICAO'
    ];

    if (!tiposPermitidos.includes(tipo)) {
        throw new Error('Tipo de manutenção inválido');
    }

    if (!validarDataISO(dataManutencao, true)) {
        throw new Error('Informe uma data de manutenção válida');
    }

    if (!validarDataISO(proximaManutencao)) {
        throw new Error(
            'Informe uma data válida para a próxima manutenção'
        );
    }

    if (
        proximaManutencao &&
        proximaManutencao < dataManutencao
    ) {
        throw new Error(
            'A próxima manutenção não pode ser anterior à data da manutenção realizada'
        );
    }

    if (
        typeof responsavel !== 'string' ||
        !responsavel.trim()
    ) {
        throw new Error('Informe o responsável pela manutenção');
    }

    if (responsavel.trim().length > 150) {
        throw new Error(
            'O nome do responsável deve ter no máximo 150 caracteres'
        );
    }

    if (
        typeof descricao !== 'string' ||
        !descricao.trim()
    ) {
        throw new Error('Informe a descrição da manutenção');
    }

    if (!resultadosPermitidos.includes(resultado)) {
        throw new Error('Resultado da manutenção inválido');
    }
};

const desfazerTransacao = async (client) => {
    if (!client) {
        return;
    }

    try {
        await client.query('ROLLBACK');
    } catch (erroRollback) {
        console.error(
            'Erro ao desfazer transação de manutenção:',
            erroRollback
        );
    }
};

const normalizarData = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor).slice(0, 10);
};

const criarManutencao = async ({
    equipamentoId,
    tipo,
    dataManutencao,
    proximaManutencao = null,
    responsavel,
    descricao,
    resultado,
    observacoes = null,
    usuarioLogadoId
}) => {
    validarEquipamentoId(equipamentoId);

    const proximaData = proximaManutencao || null;
    const observacoesNormalizadas = observacoes?.trim?.() || null;

    validarDadosManutencao({
        tipo,
        dataManutencao,
        proximaManutencao: proximaData,
        responsavel,
        descricao,
        resultado
    });

    const equipamento = await pool.query(
        `
        SELECT id, codigo, nome, ativo
        FROM equipamentos
        WHERE id = $1
        `,
        [Number(equipamentoId)]
    );

    if (equipamento.rows.length === 0) {
        throw new Error('Equipamento não encontrado');
    }

    if (!equipamento.rows[0].ativo) {
        throw new Error(
            'Não é possível registrar manutenção para equipamento desativado'
        );
    }

    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const resultadoManutencao = await client.query(
            `
            INSERT INTO manutencoes (
                equipamento_id,
                tipo,
                data_manutencao,
                proxima_manutencao,
                responsavel,
                descricao,
                resultado,
                observacoes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                equipamento_id,
                tipo,
                data_manutencao,
                proxima_manutencao,
                responsavel,
                descricao,
                resultado,
                observacoes,
                created_at
            `,
            [
                Number(equipamentoId),
                tipo,
                dataManutencao,
                proximaData,
                responsavel.trim(),
                descricao.trim(),
                resultado,
                observacoesNormalizadas
            ]
        );

        const manutencaoCriada = resultadoManutencao.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'CRIACAO',
            entidade: 'MANUTENCAO',
            registroId: manutencaoCriada.id,
            valorNovo: JSON.stringify(manutencaoCriada),
            db: client
        });

        await client.query('COMMIT');

        return manutencaoCriada;
    } catch (error) {
        await desfazerTransacao(client);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

const listarManutencoes = async ({ equipamentoId = null } = {}) => {
    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            m.id,
            m.equipamento_id,
            e.codigo AS equipamento_codigo,
            e.nome AS equipamento_nome,
            m.tipo,
            m.data_manutencao,
            m.proxima_manutencao,
            m.responsavel,
            m.descricao,
            m.resultado,
            m.observacoes,
            m.created_at
        FROM manutencoes m
        INNER JOIN equipamentos e
            ON e.id = m.equipamento_id
    `;

    if (equipamentoId !== null && equipamentoId !== undefined && equipamentoId !== '') {
        validarEquipamentoId(equipamentoId);

        valores.push(Number(equipamentoId));
        filtros.push(`m.equipamento_id = $${valores.length}`);
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY m.data_manutencao DESC, m.id DESC
    `;

    const resultado = await pool.query(consulta, valores);

    return resultado.rows;
};

const atualizarManutencao = async ({
    manutencaoId,
    tipo,
    dataManutencao,
    proximaManutencao = null,
    responsavel,
    descricao,
    resultado,
    observacoes = null,
    usuarioLogadoId
}) => {
    if (
        manutencaoId === null ||
        manutencaoId === undefined ||
        String(manutencaoId).trim() === '' ||
        !Number.isInteger(Number(manutencaoId)) ||
        Number(manutencaoId) <= 0
    ) {
        throw new Error('Manutenção não encontrada');
    }

    const proximaData = proximaManutencao || null;
    const observacoesNormalizadas = observacoes?.trim?.() || null;

    validarDadosManutencao({
        tipo,
        dataManutencao,
        proximaManutencao: proximaData,
        responsavel,
        descricao,
        resultado
    });

    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const consultaAtual = await client.query(
            `
            SELECT
                id,
                equipamento_id,
                tipo,
                data_manutencao,
                proxima_manutencao,
                responsavel,
                descricao,
                resultado,
                observacoes,
                created_at
            FROM manutencoes
            WHERE id = $1
            `,
            [Number(manutencaoId)]
        );

        if (consultaAtual.rows.length === 0) {
            throw new Error('Manutenção não encontrada');
        }

        const manutencaoAtual = consultaAtual.rows[0];

        const novosDados = {
            tipo,
            data_manutencao: dataManutencao,
            proxima_manutencao: proximaData,
            responsavel: responsavel.trim(),
            descricao: descricao.trim(),
            resultado,
            observacoes: observacoesNormalizadas
        };

        const camposAlterados = [];

        const comparar = (campo, valorAnterior, valorNovo) => {
            let anterior = valorAnterior;
            let novo = valorNovo;

            if (campo === 'data_manutencao' || campo === 'proxima_manutencao') {
                anterior = normalizarData(anterior);
                novo = normalizarData(novo);
            } else {
                anterior = anterior == null ? null : String(anterior);
                novo = novo == null ? null : String(novo);
            }

            if (anterior !== novo) {
                camposAlterados.push({
                    campo,
                    valorAnterior: anterior,
                    valorNovo: novo
                });
            }
        };

        comparar('tipo', manutencaoAtual.tipo, novosDados.tipo);
        comparar(
            'data_manutencao',
            manutencaoAtual.data_manutencao,
            novosDados.data_manutencao
        );
        comparar(
            'proxima_manutencao',
            manutencaoAtual.proxima_manutencao,
            novosDados.proxima_manutencao
        );
        comparar(
            'responsavel',
            manutencaoAtual.responsavel,
            novosDados.responsavel
        );
        comparar(
            'descricao',
            manutencaoAtual.descricao,
            novosDados.descricao
        );
        comparar('resultado', manutencaoAtual.resultado, novosDados.resultado);
        comparar(
            'observacoes',
            manutencaoAtual.observacoes,
            novosDados.observacoes
        );

        if (camposAlterados.length === 0) {
            throw new Error('Nenhuma alteração foi realizada');
        }

        const resultadoAtualizacao = await client.query(
            `
            UPDATE manutencoes
            SET
                tipo = $1,
                data_manutencao = $2,
                proxima_manutencao = $3,
                responsavel = $4,
                descricao = $5,
                resultado = $6,
                observacoes = $7
            WHERE id = $8
            RETURNING
                id,
                equipamento_id,
                tipo,
                data_manutencao,
                proxima_manutencao,
                responsavel,
                descricao,
                resultado,
                observacoes,
                created_at
            `,
            [
                novosDados.tipo,
                novosDados.data_manutencao,
                novosDados.proxima_manutencao,
                novosDados.responsavel,
                novosDados.descricao,
                novosDados.resultado,
                novosDados.observacoes,
                Number(manutencaoId)
            ]
        );

        const manutencaoAtualizada = resultadoAtualizacao.rows[0];

        for (const alteracao of camposAlterados) {
            await registrarAuditoria({
                usuarioId: usuarioLogadoId,
                acao: 'ALTERACAO',
                entidade: 'MANUTENCAO',
                registroId: Number(manutencaoId),
                campo: alteracao.campo,
                valorAnterior: alteracao.valorAnterior,
                valorNovo: alteracao.valorNovo,
                db: client
            });
        }

        await client.query('COMMIT');

        return manutencaoAtualizada;
    } catch (error) {
        await desfazerTransacao(client);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    criarManutencao,
    listarManutencoes,
    atualizarManutencao
};
