import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const formatarData = (data) => {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });
};

const formatarStatus = (status) => {

    if (!status) {
        return '-';
    }

    const statusFormatados = {
        APROVADO_COM_RESTRICAO: 'APROVADO COM RESTRIÇÃO',
        EM_DIA: 'EM DIA',
        VENCIDO: 'VENCIDO',
        VENCIDA: 'VENCIDA',
        PROXIMO: 'PRÓXIMO',
        PRÓXIMA: 'PRÓXIMA',
        QUALIFICADO: 'QUALIFICADO',
        REPROVADO: 'REPROVADO',
        ATIVO: 'ATIVO',
        INATIVO: 'INATIVO',
        VIGENTE: 'VIGENTE',
        EXPIRADO: 'EXPIRADO'
    };

    return statusFormatados[status] || status.replaceAll('_', ' ');
};

const obterStatusPrazo = (data) => {

    if (!data) {
        return null;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataPrazo = new Date(data);
    dataPrazo.setUTCHours(0, 0, 0, 0);

    const diferenca =
        Math.ceil(
            (dataPrazo - hoje) / (1000 * 60 * 60 * 24)
        );

    if (diferenca < 0) {
        return {
            texto: 'VENCIDA',
            classe: 'prazo-vencido'
        };
    }

    if (diferenca <= 7) {
        return {
            texto: 'PRÓXIMA',
            classe: 'prazo-atencao'
        };
    }

    return {
        texto: 'EM DIA',
        classe: 'prazo-em-dia'
    };
};

function EquipamentoDetalhes() {

    const { id } = useParams();

    const [equipamento, setEquipamento] = useState(null);
    const [qualificacoes, setQualificacoes] = useState([]);
    const [manutencoes, setManutencoes] = useState([]);
    const [operacional, setOperacional] = useState(null);
    const [regulatorio, setRegulatorio] = useState(null);

    useEffect(() => {

        const carregarEquipamento = async () => {

            try {

                const resposta = await api.get(`/equipamentos/${id}`);

                setEquipamento(resposta.data);

            } catch (erro) {

                console.error('Erro ao carregar equipamento:', erro);

            }

        };

        carregarEquipamento();

    }, [id]);

    useEffect(() => {

        const carregarQualificacoes = async () => {

            try {

                const resposta = await api.get('/qualificacoes', {
                    params: {
                        equipamento_id: id
                    }
                });

                setQualificacoes(resposta.data.qualificacoes || []);

            } catch (erro) {

                console.error('Erro ao carregar qualificações:', erro);

            }

        };

        carregarQualificacoes();

    }, [id]);

    useEffect(() => {

        const carregarManutencoes = async () => {

            try {

                const resposta = await api.get('/manutencoes', {
                    params: {
                        equipamento_id: id
                    }
                });

                setManutencoes(resposta.data.manutencoes || []);

            } catch (erro) {

                console.error('Erro ao carregar manutenções:', erro);

            }

        };

        carregarManutencoes();

    }, [id]);

    useEffect(() => {

        const carregarOperacional = async () => {

            try {

                const resposta = await api.get('/operacionais', {
                    params: {
                        equipamento_id: id
                    }
                });

                setOperacional(resposta.data.operacionais?.[0] || null);

            } catch (erro) {

                console.error(
                    'Erro ao carregar informações operacionais:',
                    erro
                );

            }

        };

        carregarOperacional();

    }, [id]);

    useEffect(() => {

        const carregarRegulatorio = async () => {

            try {

                const resposta = await api.get('/regulatorios', {
                    params: {
                        equipamento_id: id
                    }
                });

                setRegulatorio(resposta.data.regulatorios?.[0] || null);

            } catch (erro) {

                console.error(
                    'Erro ao carregar informações regulatórias:',
                    erro
                );

            }

        };

        carregarRegulatorio();

    }, [id]);

    return (
        <div className="equipamento-detalhes">

            <button
                type="button"
                className="equipamento-voltar"
                onClick={() => window.history.back()}
            >
                ← Voltar para Equipamentos
            </button>

            {equipamento && (
                <>

                    <div className="equipamento-header">

                        <div>

                            <span className="equipamento-header-codigo">
                                {equipamento.codigo}
                            </span>

                            <h1>{equipamento.nome}</h1>

                            <p>
                                {equipamento.fabricante || '-'}
                            </p>

                        </div>

                        <div className="equipamento-header-status">

                            <span
                                className={`status-badge ${equipamento.status_qualificacao === 'QUALIFICADO'
                                    ? 'status-badge-sucesso'
                                    : equipamento.status_qualificacao === 'REPROVADO'
                                        ? 'status-badge-erro'
                                        : 'status-badge-atencao'
                                    }`}
                            >
                                {formatarStatus(
                                    equipamento.status_qualificacao
                                )}
                            </span>

                            <span
                                className={`status-badge ${equipamento.status_manutencao === 'EM DIA'
                                    ? 'status-badge-sucesso'
                                    : equipamento.status_manutencao === 'VENCIDO'
                                        ? 'status-badge-erro'
                                        : 'status-badge-atencao'
                                    }`}
                            >
                                {formatarStatus(
                                    equipamento.status_manutencao
                                )}
                            </span>

                        </div>

                    </div>

                    <section className="equipamento-secao equipamento-identificacao">

                        <div className="equipamento-secao-titulo">

                            <h2>Identificação do Equipamento</h2>

                            <p>
                                Informações principais do equipamento
                            </p>

                        </div>

                        <div className="equipamento-identificacao-grid">

                            <div className="equipamento-info-item">

                                <span>Código</span>

                                <strong>
                                    {equipamento.codigo}
                                </strong>

                            </div>

                            <div className="equipamento-info-item">

                                <span>Nome</span>

                                <strong>
                                    {equipamento.nome}
                                </strong>

                            </div>

                            <div className="equipamento-info-item">

                                <span>Fabricante</span>

                                <strong>
                                    {equipamento.fabricante || '-'}
                                </strong>

                            </div>

                            <div className="equipamento-info-item">

                                <span>Nº de Série</span>

                                <strong>
                                    {equipamento.numero_serie || '-'}
                                </strong>

                            </div>

                            <div className="equipamento-info-item">

                                <span>Localização</span>

                                <strong>
                                    {equipamento.localizacao || '-'}
                                </strong>

                            </div>

                            <div className="equipamento-info-item">

                                <span>Especificação</span>

                                <strong>
                                    {equipamento.especificacao || '-'}
                                </strong>

                            </div>

                            <div className="equipamento-info-item equipamento-info-item-largo">

                                <span>Conduta de Incidente</span>

                                <strong>
                                    {equipamento.conduta_incidente || '-'}
                                </strong>

                            </div>

                        </div>

                    </section>

                    {qualificacoes.length > 0 && (

                        <section className="equipamento-secao equipamento-qualificacoes">

                            <div className="equipamento-secao-titulo">

                                <h2>Qualificações</h2>

                                <p>
                                    Histórico de qualificações do equipamento
                                </p>

                            </div>

                            <div className="equipamento-qualificacoes-grid">

                                {qualificacoes.map((qualificacao) => (

                                    <div
                                        className="equipamento-qualificacao-card"
                                        key={qualificacao.id}
                                    >

                                        <div className="equipamento-qualificacao-cabecalho">

                                            <div>

                                                <span className="equipamento-info-label">
                                                    Tipo
                                                </span>

                                                <h3>
                                                    {qualificacao.tipo || '-'}
                                                </h3>

                                            </div>

                                            <span
                                                className={`qualificacao-resultado ${qualificacao.resultado === 'APROVADO'
                                                    ? 'status-badge-sucesso'
                                                    : qualificacao.resultado === 'REPROVADO'
                                                        ? 'status-badge-erro'
                                                        : 'status-badge-atencao'
                                                    }`}
                                            >
                                                {formatarStatus(
                                                    qualificacao.resultado
                                                )}
                                            </span>

                                        </div>

                                        <div className="equipamento-qualificacao-grid">

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Data da Qualificação
                                                </span>

                                                <strong>
                                                    {formatarData(
                                                        qualificacao.data_qualificacao
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Próxima Qualificação
                                                </span>

                                                <strong>
                                                    {formatarData(
                                                        qualificacao.proxima_qualificacao
                                                    )}
                                                </strong>

                                                {obterStatusPrazo(qualificacao.proxima_qualificacao) && (
                                                    <span
                                                        className={`prazo-status ${obterStatusPrazo(
                                                            qualificacao.proxima_qualificacao
                                                        ).classe
                                                            }`}
                                                    >
                                                        {
                                                            obterStatusPrazo(
                                                                qualificacao.proxima_qualificacao
                                                            ).texto
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Responsável
                                                </span>

                                                <strong>
                                                    {qualificacao.responsavel || '-'}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Resultado
                                                </span>

                                                <strong>
                                                    {formatarStatus(
                                                        qualificacao.resultado
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item equipamento-info-item-largo">

                                                <span>
                                                    Descrição
                                                </span>

                                                <strong>
                                                    {qualificacao.descricao || '-'}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item equipamento-info-item-largo">

                                                <span>
                                                    Observações
                                                </span>

                                                <strong>
                                                    {qualificacao.observacoes || '-'}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </section>

                    )}

                    {manutencoes.length > 0 && (

                        <section className="equipamento-secao equipamento-manutencoes">

                            <div className="equipamento-secao-titulo">

                                <h2>Manutenções</h2>

                                <p>
                                    Histórico de manutenções do equipamento
                                </p>

                            </div>

                            <div className="equipamento-manutencoes-grid">

                                {manutencoes.map((manutencao) => (

                                    <div
                                        className="equipamento-manutencao-card"
                                        key={manutencao.id}
                                    >

                                        <div className="equipamento-manutencao-cabecalho">

                                            <div>

                                                <span className="equipamento-info-label">
                                                    Tipo
                                                </span>

                                                <h3>
                                                    {manutencao.tipo || '-'}
                                                </h3>

                                            </div>

                                            <span
                                                className={`manutencao-resultado ${manutencao.resultado === 'APROVADO'
                                                    ? 'status-badge-sucesso'
                                                    : manutencao.resultado === 'REPROVADO'
                                                        ? 'status-badge-erro'
                                                        : 'status-badge-atencao'
                                                    }`}
                                            >
                                                {formatarStatus(
                                                    manutencao.resultado
                                                )}
                                            </span>

                                        </div>

                                        <div className="equipamento-manutencao-grid">

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Data da Manutenção
                                                </span>

                                                <strong>
                                                    {formatarData(
                                                        manutencao.data_manutencao
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Próxima Manutenção
                                                </span>

                                                <strong>
                                                    {formatarData(
                                                        manutencao.proxima_manutencao
                                                    )}
                                                </strong>

                                                {obterStatusPrazo(manutencao.proxima_manutencao) && (
                                                    <span
                                                        className={`prazo-status ${obterStatusPrazo(
                                                            manutencao.proxima_manutencao
                                                        ).classe
                                                            }`}
                                                    >
                                                        {
                                                            obterStatusPrazo(
                                                                manutencao.proxima_manutencao
                                                            ).texto
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Responsável
                                                </span>

                                                <strong>
                                                    {manutencao.responsavel || '-'}
                                                </strong>

                                            </div>

                                            <div className="equipamento-info-item">

                                                <span>
                                                    Resultado
                                                </span>

                                                <strong>
                                                    {formatarStatus(
                                                        manutencao.resultado
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </section>

                    )}

                    <div className="equipamento-operacional-regulatorio">

                        {operacional && (

                            <section className="equipamento-secao equipamento-operacional">

                                <div className="equipamento-secao-titulo">

                                    <h2>Informações Operacionais</h2>

                                    <p>
                                        Dados operacionais do equipamento
                                    </p>

                                </div>

                                <div className="equipamento-operacional-grid">

                                    <div className="equipamento-info-item">

                                        <span>Modelo</span>

                                        <strong>
                                            {operacional.modelo || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Nº Patrimônio/Fase
                                        </span>

                                        <strong>
                                            {operacional.numero_patrimonio_fase || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Registro ANVISA/MS
                                        </span>

                                        <strong>
                                            {operacional.registro_anvisa_ms || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>Unidade</span>

                                        <strong>
                                            {operacional.unidade || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>Sala</span>

                                        <strong>
                                            {operacional.sala || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Data de Aquisição
                                        </span>

                                        <strong>
                                            {formatarData(
                                                operacional.data_aquisicao
                                            )}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Status Operacional
                                        </span>

                                        <strong>
                                            {formatarStatus(
                                                operacional.status_operacional
                                            )}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Manutenção Interna
                                        </span>

                                        <strong>
                                            {operacional.frequencia_manutencao_interna || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Manutenção Externa
                                        </span>

                                        <strong>
                                            {operacional.frequencia_manutencao_externa || '-'}
                                        </strong>

                                    </div>

                                </div>

                            </section>

                        )}

                        {regulatorio && (

                            <section className="equipamento-secao equipamento-regulatorio">

                                <div className="equipamento-secao-titulo">

                                    <h2>Informações Regulatórias</h2>

                                    <p>
                                        Dados regulatórios e registro sanitário
                                    </p>

                                </div>

                                <div className="equipamento-regulatorio-grid">

                                    <div className="equipamento-info-item">

                                        <span>
                                            Registro ANVISA/MS
                                        </span>

                                        <strong>
                                            {regulatorio.registro_anvisa_ms || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Situação Regulatória
                                        </span>

                                        <strong>
                                            {formatarStatus(
                                                regulatorio.situacao_regulatoria
                                            )}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Data do Registro
                                        </span>

                                        <strong>
                                            {formatarData(
                                                regulatorio.data_registro
                                            )}
                                        </strong>

                                    </div>
                                    <div className="equipamento-info-item">

                                        <span>
                                            Data de Validade
                                        </span>

                                        <strong>
                                            {formatarData(
                                                regulatorio.data_validade
                                            )}
                                        </strong>

                                        {obterStatusPrazo(regulatorio.data_validade) && (
                                            <span
                                                className={`prazo-status ${obterStatusPrazo(
                                                    regulatorio.data_validade
                                                ).classe
                                                    }`}
                                            >
                                                {
                                                    obterStatusPrazo(
                                                        regulatorio.data_validade
                                                    ).texto
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Fabricante Legal
                                        </span>

                                        <strong>
                                            {regulatorio.fabricante_legal || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item">

                                        <span>
                                            Detentor do Registro
                                        </span>

                                        <strong>
                                            {regulatorio.detentor_registro || '-'}
                                        </strong>

                                    </div>

                                    <div className="equipamento-info-item equipamento-info-item-largo">

                                        <span>
                                            Observações
                                        </span>

                                        <strong>
                                            {regulatorio.observacoes || '-'}
                                        </strong>

                                    </div>

                                </div>

                            </section>

                        )}

                    </div>

                </>
            )}

        </div>
    );
}

export default EquipamentoDetalhes;