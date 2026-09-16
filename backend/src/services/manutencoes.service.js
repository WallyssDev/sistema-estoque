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

module.exports = {
    criarManutencao
};