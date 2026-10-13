import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/manutencoes.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Manutencoes() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const abrirEquipamento = (manutencao) => {
        const equipamentoId =
            manutencao.equipamento_id ??
            manutencao.equipamentoId ??
            equipamentos.find(
                (equipamento) =>
                    equipamento.codigo === manutencao.equipamento_codigo
            )?.id;

        if (equipamentoId) {
            navigate(`/equipamentos/${equipamentoId}`);
        }
    };

    const obterClasseResultado = (resultado) => {
        const valor = String(resultado || '').toUpperCase();

        if (valor === 'APROVADO') return 'resultado-badge resultado-aprovado';
        if (valor === 'APROVADO_COM_RESTRICAO') {
            return 'resultado-badge resultado-restricao';
        }
        if (valor === 'REPROVADO') return 'resultado-badge resultado-reprovado';

        return 'resultado-badge resultado-padrao';
    };

    const formatarResultado = (resultado) => {
        const resultados = {
            APROVADO: 'Aprovado',
            APROVADO_COM_RESTRICAO: 'Aprovado com restrição',
            REPROVADO: 'Reprovado',
        };

        return resultados[resultado] || resultado || '-';
    };

    const [manutencoes, setManutencoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [equipamentos, setEquipamentos] = useState([]);
    const [formulario, setFormulario] = useState({
        equipamentoId: '',
        tipo: '',
        dataManutencao: '',
        responsavel: '',
        descricao: '',
        resultado: '',
        proximaManutencao: '',
        observacoes: ''
    });
    const [erroCadastro, setErroCadastro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const formatarData = (data) => {
        if (!data) {
            return '-';
        }

        return new Date(data).toLocaleDateString('pt-BR');
    };

    const cadastrarManutencao = async () => {
        setErroCadastro('');
        setMensagemSucesso('');

        if (
            !formulario.equipamentoId ||
            !formulario.tipo ||
            !formulario.dataManutencao ||
            !formulario.responsavel.trim() ||
            !formulario.descricao.trim() ||
            !formulario.resultado
        ) {
            setErroCadastro(
                'Preencha todos os campos obrigatórios.'
            );

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);

            return;
        }

        try {
            console.log('Dados da manutenção:', formulario);

            const resposta = await api.post('/manutencoes', {
                equipamento_id: formulario.equipamentoId,
                tipo: formulario.tipo,
                data_manutencao: formulario.dataManutencao,
                proxima_manutencao: formulario.proximaManutencao,
                responsavel: formulario.responsavel,
                descricao: formulario.descricao,
                resultado: formulario.resultado,
                observacoes: formulario.observacoes
            });

            console.log('Manutenção cadastrada:', resposta.data);

            const listaAtualizada = await api.get('/manutencoes');

            setManutencoes(listaAtualizada.data.manutencoes);

            setFormulario({
                equipamentoId: '',
                tipo: '',
                dataManutencao: '',
                responsavel: '',
                descricao: '',
                resultado: '',
                proximaManutencao: '',
                observacoes: ''
            });

            setMostrarFormulario(false);

            setMensagemSucesso(
                'Manutenção cadastrada com sucesso.'
            );

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);

        } catch (error) {
            console.error(
                'Erro ao cadastrar manutenção:',
                error.response?.data
            );

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível cadastrar a manutenção.'
            );
        }
    };

    useEffect(() => {
        const carregarManutencoes = async () => {
            try {
                const resposta = await api.get('/manutencoes');

                setManutencoes(resposta.data.manutencoes);
            } catch (error) {
                console.error(
                    'Erro ao carregar manutenções:',
                    error.response?.data
                );

                setErro(
                    error.response?.data?.mensagem ||
                    'Não foi possível carregar as manutenções.'
                );
            } finally {
                setCarregando(false);
            }
        };

        const carregarEquipamentos = async () => {
            try {
                const resposta = await api.get('/equipamentos');

                console.log('Equipamentos para manutenção:', resposta.data);

                setEquipamentos(resposta.data);
            } catch (error) {
                console.error(
                    'Erro ao carregar equipamentos:',
                    error.response?.data
                );
            }
        };

        carregarManutencoes();
        carregarEquipamentos();
    }, []);

    return (
        <div className="manutencoes-page">
            <div className="manutencoes-title">
                <div>
                    <h2>Manutenções</h2>
                    <p>Gerenciamento das manutenções dos equipamentos.</p>
                </div>

                {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'EDITOR') && (
                    <button
                        className="nova-manutencao-button"
                        onClick={() => setMostrarFormulario(true)}
                    >
                        + Nova manutenção
                    </button>
                )}
            </div>

            {mostrarFormulario && (
                <div className="manutencoes-formulario">
                    <h3>Nova manutenção</h3>
                    <p>Cadastre uma nova manutenção para um equipamento.</p>

                    {erroCadastro && (
                        <div className="mensagem-erro">
                            <span>!</span>
                            <p>{erroCadastro}</p>
                        </div>
                    )}

                    <div className="formulario-campo">
                        <label>Equipamento</label>
                        <select
                            value={formulario.equipamentoId}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    equipamentoId: evento.target.value
                                })
                            }
                        >
                            <option value="">Selecione o equipamento</option>

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
                        <label>Tipo de manutenção</label>
                        <select
                            value={formulario.tipo}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    tipo: evento.target.value
                                })
                            }
                        >
                            <option value="">Selecione o tipo</option>
                            <option value="PREVENTIVA">Preventiva</option>
                            <option value="CORRETIVA">Corretiva</option>
                        </select>
                    </div>

                    <div className="formulario-campo">
                        <label>Data da manutenção</label>
                        <input
                            type="date"
                            value={formulario.dataManutencao}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    dataManutencao: evento.target.value
                                })
                            }
                        />
                    </div>

                    <div className="formulario-campo">
                        <label>Responsável</label>
                        <input
                            type="text"
                            value={formulario.responsavel}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    responsavel: evento.target.value
                                })
                            }
                            placeholder="Nome do responsável"
                        />
                    </div>

                    <div className="formulario-campo">
                        <label>Descrição</label>
                        <input
                            type="text"
                            value={formulario.descricao}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    descricao: evento.target.value
                                })
                            }
                            placeholder="Descreva a manutenção realizada"
                        />
                    </div>

                    <div className="formulario-campo">
                        <label>Resultado</label>
                        <select
                            value={formulario.resultado}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    resultado: evento.target.value
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
                        <label>Próxima manutenção</label>
                        <input
                            type="date"
                            value={formulario.proximaManutencao}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    proximaManutencao: evento.target.value
                                })
                            }
                        />
                    </div>

                    <div className="formulario-campo">
                        <label>Observações</label>
                        <input
                            type="text"
                            value={formulario.observacoes}
                            onChange={(evento) =>
                                setFormulario({
                                    ...formulario,
                                    observacoes: evento.target.value
                                })
                            }
                            placeholder="Observações adicionais"
                        />
                    </div>

                    <div className="formulario-acoes">
                        <button
                            className="botao-cancelar"
                            onClick={() => setMostrarFormulario(false)}
                        >
                            Cancelar
                        </button>

                        <button
                            className="botao-cadastrar"
                            onClick={cadastrarManutencao}
                        >
                            Cadastrar manutenção
                        </button>
                    </div>
                </div>
            )}

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    <span>✓</span>
                    <p>{mensagemSucesso}</p>
                </div>
            )}

            {carregando && (
                <p>Carregando manutenções...</p>
            )}

            {erro && (
                <p>{erro}</p>
            )}

            {!carregando && !erro && (
                <div className="manutencoes-table-container">
                    <table className="manutencoes-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Equipamento</th>
                                <th>Tipo</th>
                                <th>Data</th>
                                <th>Responsável</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {manutencoes.map((manutencao) => {
                                const equipamentoId =
                                    manutencao.equipamento_id ??
                                    manutencao.equipamentoId ??
                                    equipamentos.find(
                                        (equipamento) =>
                                            equipamento.codigo === manutencao.equipamento_codigo
                                    )?.id;

                                return (
                                    <tr
                                        key={manutencao.id}
                                        className={equipamentoId ? 'manutencao-linha-clicavel' : ''}
                                        onClick={() => abrirEquipamento(manutencao)}
                                        onKeyDown={(evento) => {
                                            if (
                                                equipamentoId &&
                                                (evento.key === 'Enter' || evento.key === ' ')
                                            ) {
                                                evento.preventDefault();
                                                abrirEquipamento(manutencao);
                                            }
                                        }}
                                        tabIndex={equipamentoId ? 0 : undefined}
                                        role={equipamentoId ? 'link' : undefined}
                                        aria-label={
                                            equipamentoId
                                                ? `Abrir equipamento ${manutencao.equipamento_codigo} - ${manutencao.equipamento_nome}`
                                                : undefined
                                        }
                                    >
                                        <td>
                                            <button
                                                type="button"
                                                className="manutencao-equipamento-link"
                                                onClick={(evento) => {
                                                    evento.stopPropagation();
                                                    abrirEquipamento(manutencao);
                                                }}
                                                disabled={!equipamentoId}
                                                title="Abrir detalhes do equipamento"
                                            >
                                                {manutencao.equipamento_codigo || '-'}
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="manutencao-equipamento-link"
                                                onClick={(evento) => {
                                                    evento.stopPropagation();
                                                    abrirEquipamento(manutencao);
                                                }}
                                                disabled={!equipamentoId}
                                                title="Abrir detalhes do equipamento"
                                            >
                                                {manutencao.equipamento_nome || '-'}
                                            </button>
                                        </td>

                                        <td>
                                            <span className="manutencao-tipo">
                                                {manutencao.tipo || '-'}
                                            </span>
                                        </td>

                                        <td>{formatarData(manutencao.data_manutencao)}</td>

                                        <td>{manutencao.responsavel || '-'}</td>

                                        <td>
                                            <span className={obterClasseResultado(manutencao.resultado)}>
                                                {formatarResultado(manutencao.resultado)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Manutencoes;