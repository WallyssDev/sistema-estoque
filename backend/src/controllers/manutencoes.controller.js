const manutencoesService = require('../services/manutencoes.service');

const criarManutencao = async (req, res) => {
    try {
        const {
            equipamento_id,
            tipo,
            data_manutencao,
            proxima_manutencao,
            responsavel,
            descricao,
            resultado,
            observacoes
        } = req.body;

        const manutencao = await manutencoesService.criarManutencao({
            equipamentoId: equipamento_id,
            tipo,
            dataManutencao: data_manutencao,
            proximaManutencao: proxima_manutencao,
            responsavel,
            descricao,
            resultado,
            observacoes,
            usuarioLogadoId: req.usuario.id
        });

        return res.status(201).json({
            mensagem: 'Manutenção cadastrada com sucesso',
            manutencao
        });

    } catch (error) {
        console.error('Erro ao criar manutenção:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

module.exports = {
    criarManutencao
};