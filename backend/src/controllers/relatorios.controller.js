const relatoriosService = require('../services/relatorios.service');

const listarEquipamentos = async (req, res) => {
    try {
        const {
            codigo,
            nome,
            fabricante,
            localizacao,
            status_qualificacao,
            status_manutencao,
            ativo
        } = req.query;

        const equipamentos = await relatoriosService.listarEquipamentos({
            codigo,
            nome,
            fabricante,
            localizacao,
            statusQualificacao: status_qualificacao,
            statusManutencao: status_manutencao,
            ativo
        });

        return res.status(200).json({
            equipamentos
        });

    } catch (error) {
        console.error('Erro ao gerar relatório de equipamentos:', error);

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatório de equipamentos'
        });
    }
};


const listarManutencoes = async (req, res) => {
    try {
        const {
            codigo,
            nome,
            tipo,
            responsavel,
            resultado,
            data_manutencao,
            proxima_manutencao,
            status
        } = req.query;

        const manutencoes = await relatoriosService.listarManutencoes({
            codigo,
            nome,
            tipo,
            responsavel,
            resultado,
            dataManutencao: data_manutencao,
            proximaManutencao: proxima_manutencao,
            status
        });

        return res.status(200).json({
            manutencoes
        });

    } catch (error) {
        console.error(
            'Erro ao gerar relatório de manutenções:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatório de manutenções'
        });
    }
};


module.exports = {
    listarEquipamentos,
    listarManutencoes
};