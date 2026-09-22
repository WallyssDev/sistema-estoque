const operacionaisService = require('../services/operacionais.service');

const criarOperacional = async (req, res) => {
    try {
        const {
            equipamento_id,
            modelo,
            numero_patrimonio_fase,
            registro_anvisa_ms,
            unidade,
            sala,
            data_aquisicao,
            status_operacional,
            frequencia_manutencao_interna,
            frequencia_manutencao_externa
        } = req.body;

        const operacional = await operacionaisService.criarOperacional({
            equipamentoId: equipamento_id,
            modelo,
            numeroPatrimonioFase: numero_patrimonio_fase,
            registroAnvisaMs: registro_anvisa_ms,
            unidade,
            sala,
            dataAquisicao: data_aquisicao,
            statusOperacional: status_operacional,
            frequenciaManutencaoInterna:
                frequencia_manutencao_interna,
            frequenciaManutencaoExterna:
                frequencia_manutencao_externa,
            usuarioLogadoId: req.usuario.id
        });

        return res.status(201).json({
            mensagem: 'Informações operacionais cadastradas com sucesso',
            operacional
        });

    } catch (error) {
        console.error('Erro ao criar informações operacionais:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};


const listarOperacionais = async (req, res) => {
    try {
        const { equipamento_id } = req.query;

        const operacionais =
            await operacionaisService.listarOperacionais({
                equipamentoId: equipamento_id
            });

        return res.status(200).json({
            operacionais
        });

    } catch (error) {
        console.error(
            'Erro ao listar informações operacionais:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao listar informações operacionais'
        });
    }
};


const atualizarOperacional = async (req, res) => {
    try {
        const {
            modelo,
            numero_patrimonio_fase,
            registro_anvisa_ms,
            unidade,
            sala,
            data_aquisicao,
            status_operacional,
            frequencia_manutencao_interna,
            frequencia_manutencao_externa
        } = req.body;

        const operacional =
            await operacionaisService.atualizarOperacional({
                operacionalId: req.params.id,
                modelo,
                numeroPatrimonioFase: numero_patrimonio_fase,
                registroAnvisaMs: registro_anvisa_ms,
                unidade,
                sala,
                dataAquisicao: data_aquisicao,
                statusOperacional: status_operacional,
                frequenciaManutencaoInterna:
                    frequencia_manutencao_interna,
                frequenciaManutencaoExterna:
                    frequencia_manutencao_externa,
                usuarioLogadoId: req.usuario.id
            });

        return res.status(200).json({
            mensagem: 'Informações operacionais atualizadas com sucesso',
            operacional
        });

    } catch (error) {
        console.error(
            'Erro ao atualizar informações operacionais:',
            error
        );

        return res.status(400).json({
            mensagem: error.message
        });
    }
};


module.exports = {
    criarOperacional,
    listarOperacionais,
    atualizarOperacional
};