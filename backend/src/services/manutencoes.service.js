const pool = require('../database/connection');
const { registrarAuditoria } = require('./auditoria.service');

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

    if (
        !equipamentoId ||
        !tipo ||
        !dataManutencao ||
        !responsavel ||
        !descricao ||
        !resultado
    ) {
        throw new Error('Os campos obrigatórios não foram preenchidos');
    }

    const equipamento = await pool.query(
        `
        SELECT id, codigo, nome, ativo
        FROM equipamentos
        WHERE id = $1
        `,
        [equipamentoId]
    );

    if (equipamento.rows.length === 0) {
        throw new Error('Equipamento não encontrado');
    }

    if (!equipamento.rows[0].ativo) {
        throw new Error('Não é possível registrar manutenção para equipamento desativado');
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
                equipamentoId,
                tipo,
                dataManutencao,
                proximaManutencao,
                responsavel,
                descricao,
                resultado,
                observacoes
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

        if (client) {
            await client.query('ROLLBACK');
        }

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

    if (equipamentoId) {
        valores.push(equipamentoId);
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

const normalizarData = (valor) => {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().split('T')[0];
    }

    return String(valor).slice(0, 10);
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
        !manutencaoId ||
        !tipo ||
        !dataManutencao ||
        !responsavel ||
        !descricao ||
        !resultado
    ) {
        throw new Error('Os campos obrigatórios não foram preenchidos');
    }

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
            [manutencaoId]
        );

        if (consultaAtual.rows.length === 0) {
            throw new Error('Manutenção não encontrada');
        }

        const manutencaoAtual = consultaAtual.rows[0];

        const novosDados = {
            tipo,
            data_manutencao: dataManutencao,
            proxima_manutencao: proximaManutencao,
            responsavel,
            descricao,
            resultado,
            observacoes
        };

        const camposAlterados = [];

        const comparar = (campo, valorAnterior, valorNovo) => {
            const anterior = valorAnterior === null
                ? null
                : String(valorAnterior);

            const novo = valorNovo === null
                ? null
                : String(valorNovo);

            if (anterior !== novo) {
                camposAlterados.push({
                    campo,
                    valorAnterior: anterior,
                    valorNovo: novo
                });
            }
        };

        comparar(
            'tipo',
            manutencaoAtual.tipo,
            novosDados.tipo
        );

        comparar(
            'data_manutencao',
            normalizarData(manutencaoAtual.data_manutencao),
            normalizarData(novosDados.data_manutencao)
        );

        comparar(
            'proxima_manutencao',
            normalizarData(manutencaoAtual.proxima_manutencao),
            normalizarData(novosDados.proxima_manutencao)
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

        comparar(
            'resultado',
            manutencaoAtual.resultado,
            novosDados.resultado
        );

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
                tipo,
                dataManutencao,
                proximaManutencao,
                responsavel,
                descricao,
                resultado,
                observacoes,
                manutencaoId
            ]
        );

        const manutencaoAtualizada = resultadoAtualizacao.rows[0];

        for (const alteracao of camposAlterados) {
            await registrarAuditoria({
                usuarioId: usuarioLogadoId,
                acao: 'ALTERACAO',
                entidade: 'MANUTENCAO',
                registroId: manutencaoId,
                campo: alteracao.campo,
                valorAnterior: alteracao.valorAnterior,
                valorNovo: alteracao.valorNovo,
                db: client
            });
        }

        await client.query('COMMIT');

        return manutencaoAtualizada;

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

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