const qualificacoesService = require('../services/qualificacoes.service');

const criarQualificacao = async (req, res) => {
    try {
        const {
            equipamento_id,
            tipo,
            data_qualificacao,
            proxima_qualificacao,
            responsavel,
            resultado,
            descricao,
            observacoes
        } = req.body;

        const qualificacao = await qualificacoesService.criarQualificacao({
            equipamentoId: equipamento_id,
            tipo,
            dataQualificacao: data_qualificacao,
            proximaQualificacao: proxima_qualificacao,
            responsavel,
            resultado,
            descricao,
            observacoes,
            usuarioLogadoId: req.usuario.id
        });

        return res.status(201).json({
            mensagem: 'Qualificação cadastrada com sucesso',
            qualificacao
        });

    } catch (error) {
        console.error('Erro ao criar qualificação:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

const listarQualificacoes = async (req, res) => {
    try {
        const { equipamento_id } = req.query;

        const qualificacoes = await qualificacoesService.listarQualificacoes({
            equipamentoId: equipamento_id
        });

        return res.status(200).json({
            qualificacoes
        });

    } catch (error) {
        console.error('Erro ao listar qualificações:', error);

        return res.status(500).json({
            mensagem: 'Erro ao listar qualificações'
        });
    }
};

const atualizarQualificacao = async (req, res) => {
    try {
        const {
            tipo,
            data_qualificacao,
            proxima_qualificacao,
            responsavel,
            resultado,
            descricao,
            observacoes
        } = req.body;

        const qualificacao =
            await qualificacoesService.atualizarQualificacao({
                qualificacaoId: req.params.id,
                tipo,
                dataQualificacao: data_qualificacao,
                proximaQualificacao: proxima_qualificacao,
                responsavel,
                resultado,
                descricao,
                observacoes,
                usuarioLogadoId: req.usuario.id
            });

        return res.status(200).json({
            mensagem: 'Qualificação atualizada com sucesso',
            qualificacao
        });

    } catch (error) {
        console.error('Erro ao atualizar qualificação:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

module.exports = {
    criarQualificacao,
    listarQualificacoes,
    atualizarQualificacao
};