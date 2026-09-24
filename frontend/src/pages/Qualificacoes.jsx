import { useEffect, useState } from 'react';

import api from '../services/api';

import '../styles/qualificacoes.css';

import { useAuth } from '../context/AuthContext';

function Qualificacoes() {
    const { usuario } = useAuth();

    const [qualificacoes, setQualificacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [equipamentos, setEquipamentos] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [qualificacaoEditando, setQualificacaoEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        equipamentoId: '',
        tipo: '',
        dataQualificacao: '',
        responsavel: '',
        resultado: '',
        descricao: '',
        proximaQualificacao: '',
        observacoes: ''
    });

    const [erroCadastro, setErroCadastro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    useEffect(() => {
        const carregarQualificacoes = async () => {
            try {
                const resposta = await api.get('/qualificacoes');

                setQualificacoes(resposta.data.qualificacoes);
            } catch (error) {
                console.error('Erro ao buscar qualificações:', error);

                setErro('Não foi possível carregar as qualificações.');
            } finally {
                setCarregando(false);
            }
        };

        carregarQualificacoes();
    }, []);

    useEffect(() => {
        const carregarEquipamentos = async () => {
            try {
                const resposta = await api.get('/equipamentos');

                setEquipamentos(resposta.data);
            } catch (error) {
                console.error('Erro ao buscar equipamentos:', error);
            }
        };

        carregarEquipamentos();
    }, []);

    const formatarDataParaInput = (data) => {
        if (!data) {
            return '';
        }

        return new Date(data).toISOString().split('T')[0];
    };

    const formatarData = (data) => {
        if (!data) {
            return '-';
        }

        return new Date(data).toLocaleDateString('pt-BR');
    };

    const iniciarEdicao = (qualificacao) => {
        setQualificacaoEditando(qualificacao);

        setFormulario({
            equipamentoId: qualificacao.equipamento_id,
            tipo: qualificacao.tipo,
            dataQualificacao: formatarDataParaInput(qualificacao.data_qualificacao),
            responsavel: qualificacao.responsavel,
            resultado: qualificacao.resultado,
            descricao: qualificacao.descricao,
            proximaQualificacao: formatarDataParaInput(qualificacao.proxima_qualificacao),
            observacoes: qualificacao.observacoes || ''
        });

        setMostrarFormulario(true);
    };

    const cadastrarQualificacao = async () => {
        if (
            !formulario.equipamentoId ||
            !formulario.tipo ||
            !formulario.dataQualificacao ||
            !formulario.responsavel.trim() ||
            !formulario.resultado ||
            !formulario.descricao.trim()
        ) {
            setErroCadastro('Preencha todos os campos obrigatórios.');

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);

            return;
        }

        try {
            const resposta = await api.post('/qualificacoes', {
                equipamento_id: formulario.equipamentoId,
                tipo: formulario.tipo,
                data_qualificacao: formulario.dataQualificacao,
                proxima_qualificacao: formulario.proximaQualificacao || null,
                responsavel: formulario.responsavel,
                resultado: formulario.resultado,
                descricao: formulario.descricao,
                observacoes: formulario.observacoes || null
            });

            console.log('Qualificação criada:', resposta.data);

            setQualificacoes((qualificacoesAtuais) => [
                resposta.data.qualificacao,
                ...qualificacoesAtuais
            ]);

            setFormulario({
                equipamentoId: '',
                tipo: '',
                dataQualificacao: '',
                responsavel: '',
                resultado: '',
                descricao: '',
                proximaQualificacao: '',
                observacoes: ''
            });

            setMostrarFormulario(false);

            setMensagemSucesso('Qualificação cadastrada com sucesso.');

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);

        } catch (error) {
            console.error('Erro ao cadastrar qualificação:', error);

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível cadastrar a qualificação.'
            );

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);
        }
    };

    const atualizarQualificacao = async () => {
        if (
            !formulario.equipamentoId ||
            !formulario.tipo ||
            !formulario.dataQualificacao ||
            !formulario.responsavel.trim() ||
            !formulario.resultado ||
            !formulario.descricao.trim()
        ) {
            setErroCadastro('Preencha todos os campos obrigatórios.');

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);

            return;
        }

        try {
            await api.put(`/qualificacoes/${qualificacaoEditando.id}`, {
                equipamento_id: formulario.equipamentoId,
                tipo: formulario.tipo,
                data_qualificacao: formulario.dataQualificacao,
                proxima_qualificacao: formulario.proximaQualificacao || null,
                responsavel: formulario.responsavel,
                resultado: formulario.resultado,
                descricao: formulario.descricao,
                observacoes: formulario.observacoes || null
            });

            const resposta = await api.get('/qualificacoes');

            setQualificacoes(resposta.data.qualificacoes);

            setFormulario({
                equipamentoId: '',
                tipo: '',
                dataQualificacao: '',
                responsavel: '',
                resultado: '',
                descricao: '',
                proximaQualificacao: '',
                observacoes: ''
            });

            setQualificacaoEditando(null);
            setMostrarFormulario(false);

            setMensagemSucesso('Qualificação atualizada com sucesso.');

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);

        } catch (error) {
            console.error('Erro ao atualizar qualificação:', error);

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível atualizar a qualificação.'
            );

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);
        }
    };

    return (
        <div className="qualificacoes-page">
            <div className="qualificacoes-title">
                <div>
                    <h2>Qualificações</h2>
                    <p>Gerenciamento das qualificações.</p>
                </div>

                {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'EDITOR') && (
                    <button
                        className="nova-qualificacao-button"
                        onClick={() => {
                            setQualificacaoEditando(null);

                            setFormulario({
                                equipamentoId: '',
                                tipo: '',
                                dataQualificacao: '',
                                responsavel: '',
                                resultado: '',
                                descricao: '',
                                proximaQualificacao: '',
                                observacoes: ''
                            });

                            setMostrarFormulario(true);
                        }}
                    >
                        + Nova qualificação
                    </button>
                )}
            </div>

            {carregando && <p>Carregando qualificações...</p>}

            {erro && <p>{erro}</p>}

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    {mensagemSucesso}
                </div>
            )}

            {erroCadastro && (
                <div className="mensagem-erro">
                    {erroCadastro}
                </div>
            )}

            {!carregando && !erro && (
                <div>
                    {mostrarFormulario && (
                        <div className="qualificacoes-formulario">
                            <h3>
                                {qualificacaoEditando
                                    ? 'Editar qualificação'
                                    : 'Nova qualificação'}
                            </h3>

                            <p>
                                {qualificacaoEditando
                                    ? 'Atualize as informações da qualificação.'
                                    : 'Cadastre uma nova qualificação para um equipamento.'}
                            </p>

                            <div className="formulario-campo">
                                <label>Equipamento *</label>

                                <select
                                    value={formulario.equipamentoId}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            equipamentoId: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Selecione um equipamento</option>

                                    {equipamentos.map((equipamento) => (
                                        <option
                                            key={equipamento.id}
                                            value={equipamento.id}
                                        >
                                            {equipamento.codigo} - {equipamento.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="formulario-campo">
                                <label>Tipo de qualificação *</label>

                                <select
                                    value={formulario.tipo}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            tipo: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="INSTALACAO">Instalação</option>
                                    <option value="OPERACAO">Operação</option>
                                    <option value="DESEMPENHO">Desempenho</option>
                                    <option value="REQUALIFICACAO">Requalificação</option>
                                    <option value="OUTRA">Outra</option>
                                </select>
                            </div>

                            <div className="formulario-campo">
                                <label>Data da qualificação *</label>

                                <input
                                    type="date"
                                    value={formulario.dataQualificacao}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            dataQualificacao: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="formulario-campo">
                                <label>Responsável *</label>

                                <input
                                    type="text"
                                    value={formulario.responsavel}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            responsavel: e.target.value
                                        })
                                    }
                                    placeholder="Nome do responsável"
                                />
                            </div>

                            <div className="formulario-campo">
                                <label>Resultado *</label>

                                <select
                                    value={formulario.resultado}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            resultado: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Selecione o resultado</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="APROVADO_COM_RESTRICAO">
                                        Aprovado com restrição
                                    </option>
                                    <option value="REPROVADO">Reprovado</option>
                                </select>
                            </div>

                            <div className="formulario-campo">
                                <label>Descrição *</label>

                                <textarea
                                    value={formulario.descricao}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            descricao: e.target.value
                                        })
                                    }
                                    placeholder="Descreva a qualificação realizada"
                                    rows="4"
                                />
                            </div>

                            <div className="formulario-campo">
                                <label>Próxima qualificação</label>

                                <input
                                    type="date"
                                    value={formulario.proximaQualificacao}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            proximaQualificacao: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="formulario-campo">
                                <label>Observações</label>

                                <textarea
                                    value={formulario.observacoes}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            observacoes: e.target.value
                                        })
                                    }
                                    placeholder="Observações adicionais"
                                    rows="3"
                                />
                            </div>

                            <div className="formulario-acoes">
                                <button
                                    type="button"
                                    className="botao-cancelar"
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setQualificacaoEditando(null);
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="botao-cadastrar"
                                    onClick={
                                        qualificacaoEditando
                                            ? atualizarQualificacao
                                            : cadastrarQualificacao
                                    }
                                >
                                    {qualificacaoEditando
                                        ? 'Salvar alterações'
                                        : 'Cadastrar qualificação'}
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="qualificacoes-resumo">
                        Total de qualificações cadastradas: {qualificacoes.length}
                    </p>

                    <div className="qualificacoes-table-container">
                        <table className="qualificacoes-table">
                            <thead>
                                <tr>
                                    <th>Equipamento</th>
                                    <th>Tipo</th>
                                    <th>Data</th>
                                    <th>Responsável</th>
                                    <th>Resultado</th>
                                    <th>Próxima qualificação</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {qualificacoes.map((qualificacao) => (
                                    <tr key={qualificacao.id}>
                                        <td>
                                            {qualificacao.equipamento_codigo} -{' '}
                                            {qualificacao.equipamento_nome}
                                        </td>

                                        <td>{qualificacao.tipo}</td>

                                        <td>
                                            {formatarData(
                                                qualificacao.data_qualificacao
                                            )}
                                        </td>

                                        <td>{qualificacao.responsavel}</td>

                                        <td>{qualificacao.resultado}</td>

                                        <td>
                                            {formatarData(
                                                qualificacao.proxima_qualificacao
                                            )}
                                        </td>

                                        <td>
                                            {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'EDITOR') && (
                                                <button
                                                    type="button"
                                                    onClick={() => iniciarEdicao(qualificacao)}
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Qualificacoes;