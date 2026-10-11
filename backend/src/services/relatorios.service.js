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


const listarQualificacoes = async ({
    codigo = null,
    nome = null,
    tipo = null,
    responsavel = null,
    resultado = null,
    dataQualificacao = null,
    proximaQualificacao = null,
    status = null
} = {}) => {
    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            q.id,
            q.equipamento_id,
            e.codigo,
            e.nome,
            q.tipo,
            q.data_qualificacao,
            q.proxima_qualificacao,
            q.responsavel,
            q.resultado,
            q.descricao,
            q.observacoes,
            q.created_at,

            CASE
                WHEN q.proxima_qualificacao IS NULL
                    THEN 'SEM AGENDAMENTO'

                WHEN q.proxima_qualificacao < CURRENT_DATE
                    THEN 'VENCIDA'

                WHEN q.proxima_qualificacao <= CURRENT_DATE + INTERVAL '7 days'
                    THEN 'PRÓXIMA'

                ELSE 'EM DIA'
            END AS status

        FROM qualificacoes q

        INNER JOIN equipamentos e
            ON e.id = q.equipamento_id
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
        filtros.push(`q.tipo = $${valores.length}`);
    }

    if (responsavel) {
        valores.push(`%${responsavel}%`);
        filtros.push(`q.responsavel ILIKE $${valores.length}`);
    }

    if (resultado) {
        valores.push(resultado);
        filtros.push(`q.resultado = $${valores.length}`);
    }

    if (dataQualificacao) {
        valores.push(dataQualificacao);
        filtros.push(`q.data_qualificacao = $${valores.length}`);
    }

    if (proximaQualificacao) {
        valores.push(proximaQualificacao);
        filtros.push(`q.proxima_qualificacao = $${valores.length}`);
    }

    if (status) {
        valores.push(status);
        filtros.push(`
            CASE
                WHEN q.proxima_qualificacao IS NULL
                    THEN 'SEM AGENDAMENTO'

                WHEN q.proxima_qualificacao < CURRENT_DATE
                    THEN 'VENCIDA'

                WHEN q.proxima_qualificacao <= CURRENT_DATE + INTERVAL '7 days'
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
            q.proxima_qualificacao ASC NULLS LAST,
            e.codigo ASC,
            q.id ASC
    `;

    const resultadoConsulta = await pool.query(consulta, valores);

    return resultadoConsulta.rows;
};




const listarOperacionais = async ({
    codigo = null,
    nome = null,
    modelo = null,
    numeroPatrimonioFase = null,
    registroAnvisaMs = null,
    unidade = null,
    sala = null,
    dataAquisicao = null,
    statusOperacional = null,
    frequenciaManutencaoInterna = null,
    frequenciaManutencaoExterna = null
} = {}) => {
    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            o.id,
            o.equipamento_id,
            e.codigo,
            e.nome,
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

    if (codigo) {
        valores.push(`%${codigo}%`);
        filtros.push(`e.codigo ILIKE $${valores.length}`);
    }

    if (nome) {
        valores.push(`%${nome}%`);
        filtros.push(`e.nome ILIKE $${valores.length}`);
    }

    if (modelo) {
        valores.push(`%${modelo}%`);
        filtros.push(`o.modelo ILIKE $${valores.length}`);
    }

    if (numeroPatrimonioFase) {
        valores.push(`%${numeroPatrimonioFase}%`);
        filtros.push(
            `o.numero_patrimonio_fase ILIKE $${valores.length}`
        );
    }

    if (registroAnvisaMs) {
        valores.push(`%${registroAnvisaMs}%`);
        filtros.push(
            `o.registro_anvisa_ms ILIKE $${valores.length}`
        );
    }

    if (unidade) {
        valores.push(`%${unidade}%`);
        filtros.push(`o.unidade ILIKE $${valores.length}`);
    }

    if (sala) {
        valores.push(`%${sala}%`);
        filtros.push(`o.sala ILIKE $${valores.length}`);
    }

    if (dataAquisicao) {
        valores.push(dataAquisicao);
        filtros.push(`o.data_aquisicao = $${valores.length}`);
    }

    if (statusOperacional) {
        valores.push(statusOperacional);
        filtros.push(
            `o.status_operacional = $${valores.length}`
        );
    }

    if (frequenciaManutencaoInterna) {
        valores.push(`%${frequenciaManutencaoInterna}%`);
        filtros.push(
            `o.frequencia_manutencao_interna ILIKE $${valores.length}`
        );
    }

    if (frequenciaManutencaoExterna) {
        valores.push(`%${frequenciaManutencaoExterna}%`);
        filtros.push(
            `o.frequencia_manutencao_externa ILIKE $${valores.length}`
        );
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY e.codigo ASC, o.id ASC
    `;

    const resultado = await pool.query(consulta, valores);

    return resultado.rows;
};


const listarRegulatorios = async ({
    codigo = null,
    nome = null,
    registroAnvisaMs = null,
    situacaoRegulatoria = null,
    dataRegistro = null,
    dataValidade = null,
    fabricanteLegal = null,
    detentorRegistro = null,
    statusValidade = null
} = {}) => {
    const valores = [];
    const filtros = [];

    const expressaoStatus = `
        CASE
            WHEN r.data_validade IS NULL
                THEN 'SEM VALIDADE'

            WHEN r.data_validade < CURRENT_DATE
                THEN 'VENCIDO'

            WHEN r.data_validade <= CURRENT_DATE + 30
                THEN 'VENCE EM 30 DIAS'

            ELSE 'VIGENTE'
        END
    `;

    let consulta = `
        SELECT
            r.id,
            r.equipamento_id,
            e.codigo,
            e.nome,
            r.registro_anvisa_ms,
            r.situacao_regulatoria,
            r.data_registro,
            r.data_validade,
            r.fabricante_legal,
            r.detentor_registro,
            r.documento_regulatorio,
            r.observacoes,
            r.created_at,
            ${expressaoStatus} AS status_validade
        FROM regulatorios r
        INNER JOIN equipamentos e
            ON e.id = r.equipamento_id
    `;

    if (codigo) {
        valores.push(`%${codigo}%`);
        filtros.push(`e.codigo ILIKE $${valores.length}`);
    }

    if (nome) {
        valores.push(`%${nome}%`);
        filtros.push(`e.nome ILIKE $${valores.length}`);
    }

    if (registroAnvisaMs) {
        valores.push(`%${registroAnvisaMs}%`);
        filtros.push(
            `r.registro_anvisa_ms ILIKE $${valores.length}`
        );
    }

    if (situacaoRegulatoria) {
        valores.push(situacaoRegulatoria);
        filtros.push(
            `r.situacao_regulatoria = $${valores.length}`
        );
    }

    if (dataRegistro) {
        valores.push(dataRegistro);
        filtros.push(`r.data_registro = $${valores.length}`);
    }

    if (dataValidade) {
        valores.push(dataValidade);
        filtros.push(`r.data_validade = $${valores.length}`);
    }

    if (fabricanteLegal) {
        valores.push(`%${fabricanteLegal}%`);
        filtros.push(
            `r.fabricante_legal ILIKE $${valores.length}`
        );
    }

    if (detentorRegistro) {
        valores.push(`%${detentorRegistro}%`);
        filtros.push(
            `r.detentor_registro ILIKE $${valores.length}`
        );
    }

    if (statusValidade) {
        valores.push(statusValidade);
        filtros.push(
            `${expressaoStatus} = $${valores.length}`
        );
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY
            r.data_validade ASC NULLS LAST,
            e.codigo ASC,
            r.id ASC
    `;

    const resultado = await pool.query(consulta, valores);

    return resultado.rows;
};


module.exports = {
    listarEquipamentos,
    listarManutencoes,
    listarQualificacoes,
    listarOperacionais,
    listarRegulatorios
};
