const pool = require('../database/connection');
const { registrarAuditoria } = require('./auditoria.service');

const criarOperacional = async ({
    equipamentoId,
    modelo = null,
    numeroPatrimonioFase = null,
    registroAnvisaMs = null,
    unidade = null,
    sala = null,
    dataAquisicao = null,
    statusOperacional,
    frequenciaManutencaoInterna = null,
    frequenciaManutencaoExterna = null,
    usuarioLogadoId
}) => {

    if (!equipamentoId || !statusOperacional) {
        throw new Error(
            'Equipamento e status operacional são obrigatórios'
        );
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
        throw new Error(
            'Não é possível cadastrar informações operacionais para equipamento desativado'
        );
    }

    const operacionalExistente = await pool.query(
        `
        SELECT id
        FROM operacionais
        WHERE equipamento_id = $1
        `,
        [equipamentoId]
    );

    if (operacionalExistente.rows.length > 0) {
        throw new Error(
            'Já existem informações operacionais cadastradas para este equipamento'
        );
    }

    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
            `
            INSERT INTO operacionais (
                equipamento_id,
                modelo,
                numero_patrimonio_fase,
                registro_anvisa_ms,
                unidade,
                sala,
                data_aquisicao,
                status_operacional,
                frequencia_manutencao_interna,
                frequencia_manutencao_externa
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10
            )
            RETURNING
                id,
                equipamento_id,
                modelo,
                numero_patrimonio_fase,
                registro_anvisa_ms,
                unidade,
                sala,
                data_aquisicao,
                status_operacional,
                frequencia_manutencao_interna,
                frequencia_manutencao_externa,
                created_at
            `,
            [
                equipamentoId,
                modelo,
                numeroPatrimonioFase,
                registroAnvisaMs,
                unidade,
                sala,
                dataAquisicao,
                statusOperacional,
                frequenciaManutencaoInterna,
                frequenciaManutencaoExterna
            ]
        );

        const operacionalCriado = resultado.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'CRIACAO',
            entidade: 'OPERACIONAL',
            registroId: operacionalCriado.id,
            valorNovo: JSON.stringify(operacionalCriado),
            db: client
        });

        await client.query('COMMIT');

        return operacionalCriado;

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


const listarOperacionais = async ({
    equipamentoId = null
} = {}) => {

    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            o.id,
            o.equipamento_id,
            e.codigo AS equipamento_codigo,
            e.nome AS equipamento_nome,
            o.modelo,
            o.numero_patrimonio_fase,
            o.registro_anvisa_ms,
            o.unidade,
            o.sala,
            o.data_aquisicao,
            o.status_operacional,
            o.frequencia_manutencao_interna,
            o.frequencia_manutencao_externa,
            o.created_at
        FROM operacionais o
        INNER JOIN equipamentos e
            ON e.id = o.equipamento_id
    `;

    if (equipamentoId) {
        valores.push(equipamentoId);
        filtros.push(`o.equipamento_id = $${valores.length}`);
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY o.id DESC
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


const atualizarOperacional = async ({
    operacionalId,
    modelo = null,
    numeroPatrimonioFase = null,
    registroAnvisaMs = null,
    unidade = null,
    sala = null,
    dataAquisicao = null,
    statusOperacional,
    frequenciaManutencaoInterna = null,
    frequenciaManutencaoExterna = null,
    usuarioLogadoId
}) => {

    if (!operacionalId || !statusOperacional) {
        throw new Error(
            'Registro operacional e status operacional são obrigatórios'
        );
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
                modelo,
                numero_patrimonio_fase,
                registro_anvisa_ms,
                unidade,
                sala,
                data_aquisicao,
                status_operacional,
                frequencia_manutencao_interna,
                frequencia_manutencao_externa,
                created_at
            FROM operacionais
            WHERE id = $1
            `,
            [operacionalId]
        );

        if (consultaAtual.rows.length === 0) {
            throw new Error('Informações operacionais não encontradas');
        }

        const operacionalAtual = consultaAtual.rows[0];

        const novosDados = {
            modelo,
            numero_patrimonio_fase: numeroPatrimonioFase,
            registro_anvisa_ms: registroAnvisaMs,
            unidade,
            sala,
            data_aquisicao: dataAquisicao,
            status_operacional: statusOperacional,
            frequencia_manutencao_interna: frequenciaManutencaoInterna,
            frequencia_manutencao_externa: frequenciaManutencaoExterna
        };

        const camposAlterados = [];

        const comparar = (
            campo,
            valorAnterior,
            valorNovo
        ) => {

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

        const compararData = (
            campo,
            valorAnterior,
            valorNovo
        ) => {

            const anterior = normalizarData(valorAnterior);
            const novo = normalizarData(valorNovo);

            if (anterior !== novo) {
                camposAlterados.push({
                    campo,
                    valorAnterior: anterior,
                    valorNovo: novo
                });
            }
        };

        comparar(
            'modelo',
            operacionalAtual.modelo,
            novosDados.modelo
        );

        comparar(
            'numero_patrimonio_fase',
            operacionalAtual.numero_patrimonio_fase,
            novosDados.numero_patrimonio_fase
        );

        comparar(
            'registro_anvisa_ms',
            operacionalAtual.registro_anvisa_ms,
            novosDados.registro_anvisa_ms
        );

        comparar(
            'unidade',
            operacionalAtual.unidade,
            novosDados.unidade
        );

        comparar(
            'sala',
            operacionalAtual.sala,
            novosDados.sala
        );

        compararData(
            'data_aquisicao',
            operacionalAtual.data_aquisicao,
            novosDados.data_aquisicao
        );

        comparar(
            'status_operacional',
            operacionalAtual.status_operacional,
            novosDados.status_operacional
        );

        comparar(
            'frequencia_manutencao_interna',
            operacionalAtual.frequencia_manutencao_interna,
            novosDados.frequencia_manutencao_interna
        );

        comparar(
            'frequencia_manutencao_externa',
            operacionalAtual.frequencia_manutencao_externa,
            novosDados.frequencia_manutencao_externa
        );

        if (camposAlterados.length === 0) {
            throw new Error('Nenhuma alteração foi realizada');
        }

        const resultadoAtualizacao = await client.query(
            `
            UPDATE operacionais
            SET
                modelo = $1,
                numero_patrimonio_fase = $2,
                registro_anvisa_ms = $3,
                unidade = $4,
                sala = $5,
                data_aquisicao = $6,
                status_operacional = $7,
                frequencia_manutencao_interna = $8,
                frequencia_manutencao_externa = $9
            WHERE id = $10
            RETURNING
                id,
                equipamento_id,
                modelo,
                numero_patrimonio_fase,
                registro_anvisa_ms,
                unidade,
                sala,
                data_aquisicao,
                status_operacional,
                frequencia_manutencao_interna,
                frequencia_manutencao_externa,
                created_at
            `,
            [
                modelo,
                numeroPatrimonioFase,
                registroAnvisaMs,
                unidade,
                sala,
                dataAquisicao,
                statusOperacional,
                frequenciaManutencaoInterna,
                frequenciaManutencaoExterna,
                operacionalId
            ]
        );

        const operacionalAtualizado =
            resultadoAtualizacao.rows[0];

        for (const alteracao of camposAlterados) {

            await registrarAuditoria({
                usuarioId: usuarioLogadoId,
                acao: 'ALTERACAO',
                entidade: 'OPERACIONAL',
                registroId: operacionalId,
                campo: alteracao.campo,
                valorAnterior: alteracao.valorAnterior,
                valorNovo: alteracao.valorNovo,
                db: client
            });
        }

        await client.query('COMMIT');

        return operacionalAtualizado;

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
    criarOperacional,
    listarOperacionais,
    atualizarOperacional
};