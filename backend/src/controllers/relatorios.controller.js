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



const listarQualificacoes = async (req, res) => {
    try {
        const {
            codigo,
            nome,
            tipo,
            responsavel,
            resultado,
            data_qualificacao,
            proxima_qualificacao,
            status
        } = req.query;

        const qualificacoes =
            await relatoriosService.listarQualificacoes({
                codigo,
                nome,
                tipo,
                responsavel,
                resultado,
                dataQualificacao: data_qualificacao,
                proximaQualificacao: proxima_qualificacao,
                status
            });

        return res.status(200).json({
            qualificacoes
        });

    } catch (error) {
        console.error(
            'Erro ao gerar relatório de qualificações:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatório de qualificações'
        });
    }
};


const listarOperacionais = async (req, res) => {
    try {
        const {
            codigo,
            nome,
            modelo,
            numero_patrimonio_fase,
            registro_anvisa_ms,
            unidade,
            sala,
            data_aquisicao,
            status_operacional,
            frequencia_manutencao_interna,
            frequencia_manutencao_externa
        } = req.query;

        const operacionais =
            await relatoriosService.listarOperacionais({
                codigo,
                nome,
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
                    frequencia_manutencao_externa
            });

        return res.status(200).json({
            operacionais
        });

    } catch (error) {
        console.error(
            'Erro ao gerar relatório operacional:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatório operacional'
        });
    }
};


const listarRegulatorios = async (req, res) => {
    try {
        const {
            codigo,
            nome,
            registro_anvisa_ms,
            situacao_regulatoria,
            data_registro,
            data_validade,
            fabricante_legal,
            detentor_registro,
            status_validade
        } = req.query;

        const regulatorios =
            await relatoriosService.listarRegulatorios({
                codigo,
                nome,
                registroAnvisaMs: registro_anvisa_ms,
                situacaoRegulatoria: situacao_regulatoria,
                dataRegistro: data_registro,
                dataValidade: data_validade,
                fabricanteLegal: fabricante_legal,
                detentorRegistro: detentor_registro,
                statusValidade: status_validade
            });

        return res.status(200).json({
            regulatorios
        });

    } catch (error) {
        console.error(
            'Erro ao gerar relatório regulatório:',
            error
        );

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatório regulatório'
        });
    }
};



module.exports = {
    listarEquipamentos,
    listarManutencoes,
    listarQualificacoes,
    listarOperacionais,
    listarRegulatorios
};
