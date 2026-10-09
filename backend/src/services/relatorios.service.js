const pool = require('../database/connection');

const listarEquipamentos = async ({
    codigo = null,
    nome = null,
    fabricante = null,
    localizacao = null,
    statusQualificacao = null,
    statusManutencao = null,
    ativo = null
} = {}) => {
    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            e.id,
            e.codigo,
            e.nome,
            e.fabricante,
            e.numero_serie,
            e.localizacao,
            e.status_qualificacao,
            e.status_manutencao,
            e.ativo,
            e.created_at,
            e.updated_at
        FROM equipamentos e
    `;

    if (codigo) {
        valores.push(`%${codigo}%`);
        filtros.push(`e.codigo ILIKE $${valores.length}`);
    }

    if (nome) {
        valores.push(`%${nome}%`);
        filtros.push(`e.nome ILIKE $${valores.length}`);
    }

    if (fabricante) {
        valores.push(`%${fabricante}%`);
        filtros.push(`e.fabricante ILIKE $${valores.length}`);
    }

    if (localizacao) {
        valores.push(`%${localizacao}%`);
        filtros.push(`e.localizacao ILIKE $${valores.length}`);
    }

    if (statusQualificacao) {
        valores.push(statusQualificacao);
        filtros.push(`e.status_qualificacao = $${valores.length}`);
    }

    if (statusManutencao) {
        valores.push(statusManutencao);
        filtros.push(`e.status_manutencao = $${valores.length}`);
    }

    if (ativo !== null && ativo !== undefined && ativo !== '') {
        valores.push(ativo === true || ativo === 'true');
        filtros.push(`e.ativo = $${valores.length}`);
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY e.codigo ASC, e.id ASC
    `;

    const resultado = await pool.query(consulta, valores);

    return resultado.rows;
};


const listarManutencoes = async ({
    codigo = null,
    nome = null,
    tipo = null,
    responsavel = null,
    resultado = null,
    dataManutencao = null,
    proximaManutencao = null,
    status = null
} = {}) => {
    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            m.id,
            m.equipamento_id,
            e.codigo,
            e.nome,
            m.tipo,
            m.data_manutencao,
            m.proxima_manutencao,
            m.responsavel,
            m.descricao,
            m.resultado,
            m.observacoes,
            m.created_at,

            CASE
                WHEN m.proxima_manutencao < CURRENT_DATE
                    THEN 'VENCIDA'

                WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days'
                    THEN 'PRÓXIMA'

                ELSE 'EM DIA'
            END AS status

        FROM manutencoes m

        INNER JOIN equipamentos e
            ON e.id = m.equipamento_id
    `;

    if (codigo) {
        valores.push(`%${codigo}%`);
        filtros.push(`e.codigo ILIKE $${valores.length}`);
    }

    if (nome) {
        valores.push(`%${nome}%`);
        filtros.push(`e.nome ILIKE $${valores.length}`);
    }

    if (tipo) {
        valores.push(tipo);
        filtros.push(`m.tipo = $${valores.length}`);
    }

    if (responsavel) {
        valores.push(`%${responsavel}%`);
        filtros.push(`m.responsavel ILIKE $${valores.length}`);
    }

    if (resultado) {
        valores.push(resultado);
        filtros.push(`m.resultado = $${valores.length}`);
    }

    if (dataManutencao) {
        valores.push(dataManutencao);
        filtros.push(`m.data_manutencao = $${valores.length}`);
    }

    if (proximaManutencao) {
        valores.push(proximaManutencao);
        filtros.push(`m.proxima_manutencao = $${valores.length}`);
    }

    if (status) {
        valores.push(status);
        filtros.push(`
            CASE
                WHEN m.proxima_manutencao < CURRENT_DATE
                    THEN 'VENCIDA'

                WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days'
                    THEN 'PRÓXIMA'

                ELSE 'EM DIA'
            END = $${valores.length}
        `);
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY
            m.proxima_manutencao ASC NULLS LAST,
            e.codigo ASC,
            m.id ASC
    `;

    const resultadoConsulta = await pool.query(consulta, valores);

    return resultadoConsulta.rows;
};


module.exports = {
    listarEquipamentos,
    listarManutencoes
};