const pool = require('../database/connection');
const { registrarAuditoria } = require('./auditoria.service');

const criarQualificacao = async ({
    equipamentoId,
    tipo,
    dataQualificacao,
    proximaQualificacao = null,
    responsavel,
    resultado,
    descricao,
    observacoes = null,
    usuarioLogadoId
}) => {

    if (
        !equipamentoId ||
        !tipo ||
        !dataQualificacao ||
        !responsavel ||
        !resultado ||
        !descricao
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
        throw new Error(
            'Não é possível registrar qualificação para equipamento desativado'
        );
    }

    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const resultadoQualificacao = await client.query(
            `
            INSERT INTO qualificacoes (
                equipamento_id,
                tipo,
                data_qualificacao,
                proxima_qualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                equipamento_id,
                tipo,
                data_qualificacao,
                proxima_qualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes,
                created_at
            `,
            [
                equipamentoId,
                tipo,
                dataQualificacao,
                proximaQualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes
            ]
        );

        const qualificacaoCriada = resultadoQualificacao.rows[0];

        const equipamentoDados = await client.query(
            `
    SELECT
        codigo AS equipamento_codigo,
        nome AS equipamento_nome
    FROM equipamentos
    WHERE id = $1
    `,
            [qualificacaoCriada.equipamento_id]
        );

        qualificacaoCriada.equipamento_codigo =
            equipamentoDados.rows[0].equipamento_codigo;

        qualificacaoCriada.equipamento_nome =
            equipamentoDados.rows[0].equipamento_nome;

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'CRIACAO',
            entidade: 'QUALIFICACAO',
            registroId: qualificacaoCriada.id,
            valorNovo: JSON.stringify(qualificacaoCriada),
            db: client
        });

        await client.query('COMMIT');

        return qualificacaoCriada;

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

const listarQualificacoes = async ({ equipamentoId = null } = {}) => {

    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            q.id,
            q.equipamento_id,
            e.codigo AS equipamento_codigo,
            e.nome AS equipamento_nome,
            q.tipo,
            q.data_qualificacao,
            q.proxima_qualificacao,
            q.responsavel,
            q.resultado,
            q.descricao,
            q.observacoes,
            q.created_at
        FROM qualificacoes q
        INNER JOIN equipamentos e
            ON e.id = q.equipamento_id
    `;

    if (equipamentoId) {
        valores.push(equipamentoId);
        filtros.push(`q.equipamento_id = $${valores.length}`);
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY q.data_qualificacao DESC, q.id DESC
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

const atualizarQualificacao = async ({
    qualificacaoId,
    tipo,
    dataQualificacao,
    proximaQualificacao = null,
    responsavel,
    resultado,
    descricao,
    observacoes = null,
    usuarioLogadoId
}) => {

    if (
        !qualificacaoId ||
        !tipo ||
        !dataQualificacao ||
        !responsavel ||
        !resultado ||
        !descricao
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
                data_qualificacao,
                proxima_qualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes,
                created_at
            FROM qualificacoes
            WHERE id = $1
            `,
            [qualificacaoId]
        );

        if (consultaAtual.rows.length === 0) {
            throw new Error('Qualificação não encontrada');
        }

        const qualificacaoAtual = consultaAtual.rows[0];

        const novosDados = {
            tipo,
            data_qualificacao: dataQualificacao,
            proxima_qualificacao: proximaQualificacao,
            responsavel,
            resultado,
            descricao,
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

        const compararData = (campo, valorAnterior, valorNovo) => {
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
            'tipo',
            qualificacaoAtual.tipo,
            novosDados.tipo
        );

        compararData(
            'data_qualificacao',
            qualificacaoAtual.data_qualificacao,
            novosDados.data_qualificacao
        );

        compararData(
            'proxima_qualificacao',
            qualificacaoAtual.proxima_qualificacao,
            novosDados.proxima_qualificacao
        );

        comparar(
            'responsavel',
            qualificacaoAtual.responsavel,
            novosDados.responsavel
        );

        comparar(
            'resultado',
            qualificacaoAtual.resultado,
            novosDados.resultado
        );

        comparar(
            'descricao',
            qualificacaoAtual.descricao,
            novosDados.descricao
        );

        comparar(
            'observacoes',
            qualificacaoAtual.observacoes,
            novosDados.observacoes
        );

        if (camposAlterados.length === 0) {
            throw new Error('Nenhuma alteração foi realizada');
        }

        const resultadoAtualizacao = await client.query(
            `
            UPDATE qualificacoes
            SET
                tipo = $1,
                data_qualificacao = $2,
                proxima_qualificacao = $3,
                responsavel = $4,
                resultado = $5,
                descricao = $6,
                observacoes = $7
            WHERE id = $8
            RETURNING
                id,
                equipamento_id,
                tipo,
                data_qualificacao,
                proxima_qualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes,
                created_at
            `,
            [
                tipo,
                dataQualificacao,
                proximaQualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes,
                qualificacaoId
            ]
        );

        const qualificacaoAtualizada = resultadoAtualizacao.rows[0];

        for (const alteracao of camposAlterados) {
            await registrarAuditoria({
                usuarioId: usuarioLogadoId,
                acao: 'ALTERACAO',
                entidade: 'QUALIFICACAO',
                registroId: qualificacaoId,
                campo: alteracao.campo,
                valorAnterior: alteracao.valorAnterior,
                valorNovo: alteracao.valorNovo,
                db: client
            });
        }

        await client.query('COMMIT');

        return qualificacaoAtualizada;

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
    criarQualificacao,
    listarQualificacoes,
    atualizarQualificacao
};