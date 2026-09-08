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

const listarAuditoria = async ({
    pagina = 1,
    limite = 20,
    usuarioId = null,
    acao = null,
    entidade = null,
    registroId = null,
    dataInicio = null,
    dataFim = null
} = {}) => {

    const offset = (pagina - 1) * limite;

    const filtros = [];
    const valores = [];

    if (usuarioId) {
        valores.push(usuarioId);
        filtros.push(`a.usuario_id = $${valores.length}`);
    }

    if (acao) {
        valores.push(acao);
        filtros.push(`a.acao = $${valores.length}`);
    }

    if (entidade) {
        valores.push(entidade);
        filtros.push(`a.entidade = $${valores.length}`);
    }

    if (registroId) {
        valores.push(registroId);
        filtros.push(`a.registro_id = $${valores.length}`);
    }

    if (dataInicio) {
        valores.push(dataInicio);
        filtros.push(`a.data_hora >= $${valores.length}::date`);
    }

    if (dataFim) {
        valores.push(dataFim);
        filtros.push(`a.data_hora < ($${valores.length}::date + INTERVAL '1 day')`);
    }

    const where = filtros.length > 0
        ? `WHERE ${filtros.join(' AND ')}`
        : '';

    const consulta = `
        SELECT
            a.id,
            a.usuario_id,
            u.nome AS usuario_nome,
            a.acao,
            a.entidade,
            a.registro_id,
            a.campo,
            a.valor_anterior,
            a.valor_novo,
            a.data_hora
        FROM auditoria a
        INNER JOIN usuarios u
            ON u.id = a.usuario_id
        ${where}
        ORDER BY a.data_hora DESC, a.id DESC
        LIMIT $${valores.length + 1}
        OFFSET $${valores.length + 2}
    `;

    valores.push(limite, offset);

    const resultado = await pool.query(consulta, valores);

    const consultaTotal = `
        SELECT COUNT(*) AS total
        FROM auditoria a
        ${where}
    `;

    const resultadoTotal = await pool.query(
        consultaTotal,
        valores.slice(0, valores.length - 2)
    );

    const total = Number(resultadoTotal.rows[0].total);

    return {
        auditoria: resultado.rows,
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
    };
};

module.exports = {
    registrarAuditoria,
    listarAuditoria
};