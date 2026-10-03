const pool = require('../database/connection');

const obterIndicadores = async () => {
    const resultado = await pool.query(`
    SELECT
      COUNT(*)::int AS total_equipamentos,
      COUNT(*) FILTER (
        WHERE status_qualificacao = 'QUALIFICADO'
      )::int AS equipamentos_qualificados,
      COUNT(*) FILTER (
        WHERE status_manutencao = 'EM DIA'
      )::int AS manutencoes_em_dia,
      COUNT(*) FILTER (
        WHERE status_manutencao = 'EM MANUTENÇÃO'
      )::int AS equipamentos_em_manutencao
    FROM equipamentos
    WHERE ativo = true
  `);

    return resultado.rows[0];
};

const obterAlertasManutencao = async () => {
    const resultado = await pool.query(`
    SELECT
      m.id,
      m.equipamento_id,
      e.codigo AS equipamento_codigo,
      e.nome AS equipamento_nome,
      m.tipo,
      m.data_manutencao,
      m.proxima_manutencao,
      m.responsavel,
      m.resultado
    FROM manutencoes m
    INNER JOIN equipamentos e
      ON e.id = m.equipamento_id
    WHERE e.ativo = true
      AND m.proxima_manutencao IS NOT NULL
      AND m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days'
    ORDER BY m.proxima_manutencao ASC
  `);

    const manutencoesVencidas = [];
    const manutencoesProximas = [];

    resultado.rows.forEach((manutencao) => {
        const dataProxima = new Date(manutencao.proxima_manutencao);
        const hoje = new Date();

        dataProxima.setHours(0, 0, 0, 0);
        hoje.setHours(0, 0, 0, 0);

        if (dataProxima < hoje) {
            manutencoesVencidas.push(manutencao);
        } else {
            manutencoesProximas.push(manutencao);
        }
    });

    return {
        manutencoesVencidas,
        manutencoesProximas
    };
};

const obterAlertasQualificacao = async () => {
    const resultado = await pool.query(`
    SELECT
      q.id,
      q.equipamento_id,
      e.codigo AS equipamento_codigo,
      e.nome AS equipamento_nome,
      q.tipo,
      q.data_qualificacao,
      q.proxima_qualificacao,
      q.responsavel,
      q.resultado
    FROM qualificacoes q
    INNER JOIN equipamentos e
      ON e.id = q.equipamento_id
    WHERE e.ativo = true
      AND q.proxima_qualificacao IS NOT NULL
      AND q.proxima_qualificacao <= CURRENT_DATE + INTERVAL '7 days'
    ORDER BY q.proxima_qualificacao ASC
  `);

    const qualificacoesVencidas = [];
    const qualificacoesProximas = [];

    resultado.rows.forEach((qualificacao) => {
        const dataProxima = new Date(qualificacao.proxima_qualificacao);
        const hoje = new Date();

        dataProxima.setHours(0, 0, 0, 0);
        hoje.setHours(0, 0, 0, 0);

        if (dataProxima < hoje) {
            qualificacoesVencidas.push(qualificacao);
        } else {
            qualificacoesProximas.push(qualificacao);
        }
    });

    return {
        qualificacoesVencidas,
        qualificacoesProximas
    };
};

const obterAlertasRegulatorios = async () => {
    const resultado = await pool.query(`
    SELECT
      r.id,
      r.equipamento_id,
      e.codigo AS equipamento_codigo,
      e.nome AS equipamento_nome,
      r.registro_anvisa_ms,
      r.situacao_regulatoria,
      r.data_registro,
      r.data_validade,
      r.fabricante_legal,
      r.detentor_registro
    FROM regulatorios r
    INNER JOIN equipamentos e
      ON e.id = r.equipamento_id
    WHERE e.ativo = true
      AND r.data_validade IS NOT NULL
      AND r.data_validade <= CURRENT_DATE + INTERVAL '7 days'
    ORDER BY r.data_validade ASC
  `);

    const regulatoriosVencidos = [];
    const regulatoriosProximos = [];

    resultado.rows.forEach((regulatorio) => {
        const dataValidade = new Date(regulatorio.data_validade);
        const hoje = new Date();

        dataValidade.setHours(0, 0, 0, 0);
        hoje.setHours(0, 0, 0, 0);

        if (dataValidade < hoje) {
            regulatoriosVencidos.push(regulatorio);
        } else {
            regulatoriosProximos.push(regulatorio);
        }
    });

    return {
        regulatoriosVencidos,
        regulatoriosProximos
    };
};

const obterAtividadesRecentes = async () => {
    const resultado = await pool.query(`
    SELECT
      a.id,
      a.data_hora,
      u.nome AS usuario_nome,
      a.acao,
      a.entidade,
      a.registro_id,
      a.campo
    FROM auditoria a
    LEFT JOIN usuarios u
      ON u.id = a.usuario_id
    ORDER BY a.data_hora DESC
    LIMIT 10
  `);

    return resultado.rows;
};

const obterEquipamentos = async () => {
    const resultado = await pool.query(`
    SELECT
      id,
      codigo,
      nome,
      fabricante,
      status_qualificacao,
      status_manutencao
    FROM equipamentos
    WHERE ativo = true
    ORDER BY codigo
  `);

    return resultado.rows;
};

const obterDashboard = async () => {
    const [
        indicadores,
        alertasManutencao,
        alertasQualificacao,
        alertasRegulatorios,
        atividadesRecentes,
        equipamentos
    ] = await Promise.all([
        obterIndicadores(),
        obterAlertasManutencao(),
        obterAlertasQualificacao(),
        obterAlertasRegulatorios(),
        obterAtividadesRecentes(),
        obterEquipamentos()
    ]);

    return {
        indicadores,
        alertas: {
            ...alertasManutencao,
            ...alertasQualificacao,
            ...alertasRegulatorios
        },
        atividadesRecentes,
        equipamentos
    };
};

module.exports = {
    obterIndicadores,
    obterAlertasManutencao,
    obterAlertasQualificacao,
    obterAlertasRegulatorios,
    obterAtividadesRecentes,
    obterDashboard,
    obterEquipamentos
};
