const regulatoriosService = require('../services/regulatorios.service');

const criarRegulatorio = async (req, res) => {
    try {
        const {
            equipamento_id,
            registro_anvisa_ms,
            situacao_regulatoria,
            data_registro,
            data_validade,
            fabricante_legal,
            detentor_registro,
            documento_regulatorio,
            observacoes
        } = req.body;

        const regulatorio =
            await regulatoriosService.criarRegulatorio({
                equipamentoId: equipamento_id,
                registroAnvisaMs: registro_anvisa_ms,
                situacaoRegulatoria: situacao_regulatoria,
                dataRegistro: data_registro,
                dataValidade: data_validade,
                fabricanteLegal: fabricante_legal,
                detentorRegistro: detentor_registro,
                documentoRegulatorio: documento_regulatorio,
                observacoes,
                usuarioLogadoId: req.usuario.id
            });

        return res.status(201).json({
            mensagem: 'Informações regulatórias cadastradas com sucesso',
            regulatorio
        });

    } catch (error) {

        console.error(
            'Erro ao criar informações regulatórias:',
            error
        );

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

const listarRegulatorios = async (req, res) => {
    try {

        const { equipamento_id } = req.query;

        const regulatorios =
            await regulatoriosService.listarRegulatorios({
                equipamentoId: equipamento_id
            });

        return res.status(200).json({
            regulatorios
        });

    } catch (error) {

        console.error(
            'Erro ao listar informações regulatórias:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao listar informações regulatórias'
        });
    }
};

const atualizarRegulatorio = async (req, res) => {
    try {

        const {
            registro_anvisa_ms,
            situacao_regulatoria,
            data_registro,
            data_validade,
            fabricante_legal,
            detentor_registro,
            documento_regulatorio,
            observacoes
        } = req.body;

        const regulatorio =
            await regulatoriosService.atualizarRegulatorio({
                regulatorioId: req.params.id,
                registroAnvisaMs: registro_anvisa_ms,
                situacaoRegulatoria: situacao_regulatoria,
                dataRegistro: data_registro,
                dataValidade: data_validade,
                fabricanteLegal: fabricante_legal,
                detentorRegistro: detentor_registro,
                documentoRegulatorio: documento_regulatorio,
                observacoes,
                usuarioLogadoId: req.usuario.id
            });

        return res.status(200).json({
            mensagem: 'Informações regulatórias atualizadas com sucesso',
            regulatorio
        });

    } catch (error) {

        console.error(
            'Erro ao atualizar informações regulatórias:',
            error
        );

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

module.exports = {
    criarRegulatorio,
    listarRegulatorios,
    atualizarRegulatorio
};