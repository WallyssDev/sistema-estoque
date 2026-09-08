const { listarAuditoria } = require('../services/auditoria.service');

const consultarAuditoria = async (req, res) => {

    try {

        const {
            pagina = 1,
            limite = 20,
            usuario_id,
            acao,
            entidade,
            registro_id,
            data_inicio,
            data_fim
        } = req.query;

        const paginaNumero = Number(pagina);
        const limiteNumero = Number(limite);

        if (
            !Number.isInteger(paginaNumero) ||
            paginaNumero < 1
        ) {
            return res.status(400).json({
                mensagem: 'Página inválida'
            });
        }

        if (
            !Number.isInteger(limiteNumero) ||
            limiteNumero < 1 ||
            limiteNumero > 100
        ) {
            return res.status(400).json({
                mensagem: 'O limite deve ser um número entre 1 e 100'
            });
        }

        const resultado = await listarAuditoria({
            pagina: paginaNumero,
            limite: limiteNumero,
            usuarioId: usuario_id || null,
            acao: acao || null,
            entidade: entidade || null,
            registroId: registro_id || null,
            dataInicio: data_inicio || null,
            dataFim: data_fim || null
        });

        return res.status(200).json(resultado);

    } catch (error) {

        console.error('Erro ao consultar auditoria:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    consultarAuditoria
};