const {
    listarAuditoria,
    listarUsuariosAuditoria
} = require('../services/auditoria.service');


const dataISOValida = (valor) => {
    if (valor === undefined || valor === null || valor === '') {
        return true;
    }

    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        return false;
    }

    const data = new Date(`${valor}T00:00:00.000Z`);

    return (
        !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor
    );
};


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


        if (!dataISOValida(data_inicio) || !dataISOValida(data_fim)) {
            return res.status(400).json({
                mensagem: 'As datas devem estar no formato AAAA-MM-DD e ser datas válidas.'
            });
        }

        if (data_inicio && data_fim && data_inicio > data_fim) {
            return res.status(400).json({
                mensagem: 'A data inicial não pode ser posterior à data final.'
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

const consultarUsuariosAuditoria = async (req, res) => {

    try {

        const usuarios = await listarUsuariosAuditoria();

        return res.status(200).json({
            usuarios
        });

    } catch (error) {

        console.error(
            'Erro ao consultar usuários da auditoria:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    consultarAuditoria,
    consultarUsuariosAuditoria
};