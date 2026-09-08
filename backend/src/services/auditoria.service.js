const pool = require('../database/connection');

const registrarAuditoria = async ({
    usuarioId,
    acao,
    entidade,
    registroId = null,
    campo = null,
    valorAnterior = null,
    valorNovo = null,
    db = pool
}) => {
    const resultado = await db.query(
        `
        INSERT INTO auditoria (
            usuario_id,
            acao,
            entidade,
            registro_id,
            campo,
            valor_anterior,
            valor_novo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            usuario_id,
            acao,
            entidade,
            registro_id,
            campo,
            valor_anterior,
            valor_novo,
            data_hora
        `,
        [
            usuarioId,
            acao,
            entidade,
            registroId,
            campo,
            valorAnterior,
            valorNovo
        ]
    );

    return resultado.rows[0];
};

module.exports = {
    registrarAuditoria
};