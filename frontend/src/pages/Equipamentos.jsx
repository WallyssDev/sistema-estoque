import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/equipamentos.css';

const formularioInicial = {
    codigo: '',
    nome: '',
    fabricante: '',
    numero_serie: '',
    localizacao: '',
    status_qualificacao: '',
    status_manutencao: ''
};

function Equipamentos() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const abrirDetalhesEquipamento = (id) => {
        navigate(`/equipamentos/${id}`);
    };

    const [equipamentos, setEquipamentos] = useState([]);
    const [equipamentosInativos, setEquipamentosInativos] = useState([]);
    const [mostrarInativos, setMostrarInativos] = useState(false);
    const [carregandoInativos, setCarregandoInativos] = useState(false);
    const [reativandoId, setReativandoId] = useState(null);
    const [equipamentoParaAlterarStatus, setEquipamentoParaAlterarStatus] = useState(null);
    const [processandoStatus, setProcessandoStatus] = useState(false);
    const [resultadoStatus, setResultadoStatus] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [busca, setBusca] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const timerMensagemSucesso = useRef(null);
    const timerMensagemErro = useRef(null);
    const [erroCadastro, setErroCadastro] = useState('');
    const [equipamentoEditando, setEquipamentoEditando] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [formulario, setFormulario] = useState(formularioInicial);

    const podeEditar = usuario?.perfil === 'ADMIN' || usuario?.perfil === 'EDITOR';
    const podeReativar = usuario?.perfil === 'ADMIN';

    const mostrarMensagemSucesso = (mensagem) => {
        if (timerMensagemSucesso.current) {
            window.clearTimeout(timerMensagemSucesso.current);
        }
        if (timerMensagemErro.current) {
            window.clearTimeout(timerMensagemErro.current);
            timerMensagemErro.current = null;
        }
        setMensagemErro('');
        setMensagemSucesso(mensagem);
        timerMensagemSucesso.current = window.setTimeout(() => {
            setMensagemSucesso('');
            timerMensagemSucesso.current = null;
        }, 3000);
    };

    const mostrarMensagemErro = (mensagem) => {
        if (timerMensagemErro.current) {
            window.clearTimeout(timerMensagemErro.current);
        }
        if (timerMensagemSucesso.current) {
            window.clearTimeout(timerMensagemSucesso.current);
            timerMensagemSucesso.current = null;
        }
        setMensagemSucesso('');
        setMensagemErro(mensagem);
        timerMensagemErro.current = window.setTimeout(() => {
            setMensagemErro('');
            timerMensagemErro.current = null;
        }, 3000);
    };

    useEffect(() => () => {
        if (timerMensagemSucesso.current) window.clearTimeout(timerMensagemSucesso.current);
        if (timerMensagemErro.current) window.clearTimeout(timerMensagemErro.current);
    }, []);

    const carregarEquipamentos = async () => {
        try {
            setErro('');
            const resposta = await api.get('/equipamentos');
            setEquipamentos(Array.isArray(resposta.data) ? resposta.data : []);
        } catch (error) {
            console.error('Erro ao carregar equipamentos:', error);
            setErro('Não foi possível carregar os equipamentos.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarEquipamentos();
        // A carga inicial deve ocorrer apenas quando a página for montada.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const equipamentosFiltrados = equipamentos.filter((equipamento) => {
        const termo = busca.toLowerCase().trim();
        return (
            equipamento.codigo?.toLowerCase().includes(termo) ||
            equipamento.nome?.toLowerCase().includes(termo) ||
            equipamento.fabricante?.toLowerCase().includes(termo) ||
            equipamento.numero_serie?.toLowerCase().includes(termo) ||
            equipamento.localizacao?.toLowerCase().includes(termo)
        );
    });

    const carregarEquipamentosInativos = async () => {
        setCarregandoInativos(true);
        setErro('');

        try {
            const resposta = await api.get('/equipamentos/inativos');
            setEquipamentosInativos(Array.isArray(resposta.data) ? resposta.data : []);
        } catch (error) {
            console.error('Erro ao carregar equipamentos inativos:', error);
            setErro(
                error.response?.data?.mensagem ||
                'Não foi possível carregar os equipamentos inativos.'
            );
        } finally {
            setCarregandoInativos(false);
        }
    };

    const alternarListaInativos = async () => {
        const exibir = !mostrarInativos;
        setMostrarInativos(exibir);
        setBusca('');
        setErro('');

        if (exibir) {
            await carregarEquipamentosInativos();
        }
    };

    const solicitarAlteracaoStatus = (equipamento, acao) => {
        setMensagemSucesso('');
        setMensagemErro('');
        setResultadoStatus(null);
        setEquipamentoParaAlterarStatus({ equipamento, acao });
    };

    const cancelarAlteracaoStatus = () => {
        if (processandoStatus) return;
        setEquipamentoParaAlterarStatus(null);
    };

    const confirmarAlteracaoStatus = async () => {
        if (!equipamentoParaAlterarStatus || processandoStatus) return;

        const { equipamento, acao } = equipamentoParaAlterarStatus;
        if (acao === 'reativar' && !podeReativar) return;
        if (acao === 'desativar' && !podeReativar) return;

        setProcessandoStatus(true);
        setReativandoId(equipamento.id);

        try {
            if (acao === 'reativar') {
                await api.patch(`/equipamentos/${equipamento.id}/reativar`);
            } else {
                await api.delete(`/equipamentos/${equipamento.id}`);
            }

            await carregarEquipamentos();
            await carregarEquipamentosInativos();

            setEquipamentoParaAlterarStatus(null);
            setResultadoStatus({
                tipo: 'sucesso',
                titulo: acao === 'reativar' ? 'Equipamento reativado' : 'Equipamento desativado',
                mensagem: acao === 'reativar'
                    ? `O equipamento "${equipamento.nome}" foi reativado com sucesso.`
                    : `O equipamento "${equipamento.nome}" foi desativado com sucesso.`
            });
        } catch (error) {
            console.error(`Erro ao ${acao} equipamento:`, error.response?.data || error);
            setEquipamentoParaAlterarStatus(null);
            setResultadoStatus({
                tipo: 'erro',
                titulo: 'Não foi possível concluir',
                mensagem: error.response?.data?.mensagem ||
                    `Não foi possível ${acao} o equipamento. Tente novamente.`
            });
        } finally {
            setProcessandoStatus(false);
            setReativandoId(null);
        }
    };

    const abrirNovoEquipamento = () => {
        setEquipamentoEditando(null);
        setFormulario({ ...formularioInicial });
        setErroCadastro('');
        setMensagemSucesso('');
        setMostrarFormulario(true);
    };

    const editarEquipamento = (equipamento) => {
        setEquipamentoEditando(equipamento);
        setFormulario({
            codigo: equipamento.codigo || '',
            nome: equipamento.nome || '',
            fabricante: equipamento.fabricante || '',
            numero_serie: equipamento.numero_serie || '',
            localizacao: equipamento.localizacao || '',
            status_qualificacao: equipamento.status_qualificacao || '',
            status_manutencao: equipamento.status_manutencao || ''
        });
        setErroCadastro('');
        setMensagemSucesso('');
        setMostrarFormulario(true);
    };

    const cancelarFormulario = () => {
        setMostrarFormulario(false);
        setEquipamentoEditando(null);
        setFormulario({ ...formularioInicial });
        setErroCadastro('');
    };

    const salvarEquipamento = async () => {
        if (salvando) return;

        setSalvando(true);
        setErroCadastro('');
        setMensagemSucesso('');

        try {
            if (equipamentoEditando) {
                await api.put(`/equipamentos/${equipamentoEditando.id}`, formulario);
            } else {
                await api.post('/equipamentos', formulario);
            }

            await carregarEquipamentos();
            mostrarMensagemSucesso(
                equipamentoEditando
                    ? 'Equipamento atualizado com sucesso.'
                    : 'Equipamento cadastrado com sucesso.'
            );
            setMostrarFormulario(false);
            setEquipamentoEditando(null);
            setFormulario({ ...formularioInicial });

        } catch (error) {
            console.error('Erro ao salvar equipamento:', error.response?.data || error);
            setErroCadastro(
                error.response?.data?.mensagem ||
                error.response?.data?.erro ||
                (equipamentoEditando
                    ? 'Não foi possível atualizar o equipamento.'
                    : 'Não foi possível cadastrar o equipamento.')
            );
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="equipamentos-page">
            <div className="equipamentos-title">
                <div>
                    <h2>Equipamentos</h2>
                    <p>Lista-mestra de equipamentos</p>
                </div>

                <div className="equipamentos-title-acoes" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="novo-equipamento-button"
                        onClick={alternarListaInativos}
                    >
                        {mostrarInativos ? 'Ver equipamentos ativos' : 'Ver equipamentos inativos'}
                    </button>

                    {podeEditar && !mostrarInativos && (
                        <button
                            type="button"
                            className="novo-equipamento-button"
                            onClick={abrirNovoEquipamento}
                        >
                            + Novo equipamento
                        </button>
                    )}
                </div>
            </div>


            {mostrarFormulario && (
                <div className="equipamentos-formulario">
                    <h3>{equipamentoEditando ? 'Editar equipamento' : 'Novo equipamento'}</h3>
                    <p>
                        {equipamentoEditando
                            ? 'Altere as informações necessárias e salve as alterações.'
                            : 'Preencha as informações do equipamento.'}
                    </p>

                    <div className="formulario-campo">
                        <label htmlFor="codigo">Código</label>
                        <input
                            id="codigo"
                            type="text"
                            placeholder="Ex.: EQ-005"
                            value={formulario.codigo}
                            onChange={(event) => setFormulario({ ...formulario, codigo: event.target.value })}
                        />
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="nome">Nome do equipamento</label>
                        <input
                            id="nome"
                            type="text"
                            placeholder="Ex.: Balança Analítica"
                            value={formulario.nome}
                            onChange={(event) => setFormulario({ ...formulario, nome: event.target.value })}
                        />
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="fabricante">Fabricante</label>
                        <input
                            id="fabricante"
                            type="text"
                            placeholder="Ex.: Shimadzu"
                            value={formulario.fabricante}
                            onChange={(event) => setFormulario({ ...formulario, fabricante: event.target.value })}
                        />
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="numero_serie">Número de série</label>
                        <input
                            id="numero_serie"
                            type="text"
                            placeholder="Ex.: BA0052026"
                            value={formulario.numero_serie}
                            onChange={(event) => setFormulario({ ...formulario, numero_serie: event.target.value })}
                        />
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="localizacao">Localização</label>
                        <input
                            id="localizacao"
                            type="text"
                            placeholder="Ex.: Laboratório de Controle de Qualidade"
                            value={formulario.localizacao}
                            onChange={(event) => setFormulario({ ...formulario, localizacao: event.target.value })}
                        />
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="status_qualificacao">Status de qualificação</label>
                        <select
                            id="status_qualificacao"
                            value={formulario.status_qualificacao}
                            onChange={(event) => setFormulario({ ...formulario, status_qualificacao: event.target.value })}
                        >
                            <option value="">Selecione o status</option>
                            <option value="QUALIFICADO">Qualificado</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="VENCIDO">Vencido</option>
                        </select>
                    </div>

                    <div className="formulario-campo">
                        <label htmlFor="status_manutencao">Status de manutenção</label>
                        <select
                            id="status_manutencao"
                            value={formulario.status_manutencao}
                            onChange={(event) => setFormulario({ ...formulario, status_manutencao: event.target.value })}
                        >
                            <option value="">Selecione o status</option>
                            <option value="EM DIA">Em dia</option>
                            <option value="EM MANUTENÇÃO">Em manutenção</option>
                            <option value="VENCIDA">Vencida</option>
                        </select>
                    </div>

                    {erroCadastro && (
                        <div className="mensagem-erro">
                            <span>!</span>
                            <p>{erroCadastro}</p>
                        </div>
                    )}

                    <div className="formulario-acoes">
                        <button
                            type="button"
                            className="botao-cancelar"
                            onClick={cancelarFormulario}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="botao-cadastrar"
                            onClick={salvarEquipamento}
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : equipamentoEditando
                                    ? 'Salvar alterações'
                                    : 'Cadastrar equipamento'}
                        </button>
                    </div>
                </div>
            )}

            <div className="equipamentos-toolbar">
                <input
                    type="text"
                    placeholder="Buscar por código, equipamento, fabricante..."
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                />
            </div>

            {erro && <p>{erro}</p>}
            {!mostrarInativos && carregando && <p>Carregando equipamentos...</p>}
            {mostrarInativos && carregandoInativos && <p>Carregando equipamentos inativos...</p>}

            {((!mostrarInativos && !carregando) || (mostrarInativos && !carregandoInativos)) && !erro && (
                <div className="equipamentos-table-container">
                    <table className="equipamentos-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Equipamento</th>
                                <th>Fabricante</th>
                                <th>Nº Série</th>
                                <th>Localização</th>
                                <th>Qualificação</th>
                                <th>Manutenção</th>
                                {mostrarInativos ? (podeReativar && <th>Ações</th>) : (podeEditar && <th>Ações</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {(mostrarInativos
                                ? equipamentosInativos.filter((equipamento) => {
                                    const termo = busca.toLowerCase().trim();
                                    return (
                                        equipamento.codigo?.toLowerCase().includes(termo) ||
                                        equipamento.nome?.toLowerCase().includes(termo) ||
                                        equipamento.fabricante?.toLowerCase().includes(termo) ||
                                        equipamento.numero_serie?.toLowerCase().includes(termo) ||
                                        equipamento.localizacao?.toLowerCase().includes(termo)
                                    );
                                })
                                : equipamentosFiltrados
                            ).length === 0 ? (
                                <tr>
                                    <td colSpan={mostrarInativos ? (podeReativar ? 8 : 7) : (podeEditar ? 8 : 7)}>
                                        {mostrarInativos ? 'Nenhum equipamento inativo encontrado.' : 'Nenhum equipamento encontrado.'}
                                    </td>
                                </tr>
                            ) : (
                                (mostrarInativos
                                    ? equipamentosInativos.filter((equipamento) => {
                                        const termo = busca.toLowerCase().trim();
                                        return (
                                            equipamento.codigo?.toLowerCase().includes(termo) ||
                                            equipamento.nome?.toLowerCase().includes(termo) ||
                                            equipamento.fabricante?.toLowerCase().includes(termo) ||
                                            equipamento.numero_serie?.toLowerCase().includes(termo) ||
                                            equipamento.localizacao?.toLowerCase().includes(termo)
                                        );
                                    })
                                    : equipamentosFiltrados
                                ).map((equipamento) => (
                                    <tr
                                        key={equipamento.id}
                                        onClick={() => {
                                            if (!mostrarInativos) {
                                                abrirDetalhesEquipamento(equipamento.id);
                                            }
                                        }}
                                        style={{ cursor: mostrarInativos ? 'default' : 'pointer' }}
                                    >
                                        <td>
                                            {mostrarInativos ? (
                                                equipamento.codigo
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        abrirDetalhesEquipamento(equipamento.id);
                                                    }}
                                                    style={{
                                                        padding: 0,
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'inherit',
                                                        font: 'inherit',
                                                        textAlign: 'left',
                                                        cursor: 'pointer'
                                                    }}
                                                    aria-label={`Ver detalhes do equipamento ${equipamento.codigo}`}
                                                >
                                                    {equipamento.codigo}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            {mostrarInativos ? (
                                                equipamento.nome
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        abrirDetalhesEquipamento(equipamento.id);
                                                    }}
                                                    style={{
                                                        padding: 0,
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: 'inherit',
                                                        font: 'inherit',
                                                        textAlign: 'left',
                                                        cursor: 'pointer'
                                                    }}
                                                    aria-label={`Ver detalhes do equipamento ${equipamento.nome}`}
                                                >
                                                    {equipamento.nome}
                                                </button>
                                            )}
                                        </td>
                                        <td>{equipamento.fabricante}</td>
                                        <td>{equipamento.numero_serie || '-'}</td>
                                        <td>{equipamento.localizacao || '-'}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${equipamento.status_qualificacao === 'QUALIFICADO'
                                                    ? 'status-success'
                                                    : 'status-warning'
                                                    }`}
                                            >
                                                {equipamento.status_qualificacao || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${equipamento.status_manutencao === 'EM DIA'
                                                    ? 'status-success'
                                                    : 'status-warning'
                                                    }`}
                                            >
                                                {equipamento.status_manutencao || '-'}
                                            </span>
                                        </td>
                                        {mostrarInativos ? (
                                            podeReativar && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="botao-cadastrar"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            solicitarAlteracaoStatus(equipamento, 'reativar');
                                                        }}
                                                        disabled={reativandoId === equipamento.id}
                                                    >
                                                        {reativandoId === equipamento.id ? 'Reativando...' : 'Reativar'}
                                                    </button>
                                                </td>
                                            )
                                        ) : (
                                            podeEditar && (
                                                <td className="equipamentos-acoes-tabela">
                                                    <button
                                                        type="button"
                                                        className="botao-editar-equipamento"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            editarEquipamento(equipamento);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    {podeReativar && (
                                                        <button
                                                            type="button"
                                                            className="botao-desativar-equipamento"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                solicitarAlteracaoStatus(equipamento, 'desativar');
                                                            }}
                                                        >
                                                            Desativar
                                                        </button>
                                                    )}
                                                </td>
                                            )
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {equipamentoParaAlterarStatus && (
                <div className="equipamentos-modal-overlay" role="presentation">
                    <section
                        className="equipamentos-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="equipamentos-modal-titulo"
                        aria-describedby="equipamentos-modal-descricao"
                    >
                        <div className="equipamentos-modal-icone" aria-hidden="true">!</div>
                        <h3 id="equipamentos-modal-titulo">
                            {equipamentoParaAlterarStatus.acao === 'reativar'
                                ? 'Reativar equipamento'
                                : 'Desativar equipamento'}
                        </h3>
                        <p id="equipamentos-modal-descricao">
                            Tem certeza que deseja {equipamentoParaAlterarStatus.acao === 'reativar' ? 'reativar' : 'desativar'} o equipamento
                            {' '}
                            <strong>"{equipamentoParaAlterarStatus.equipamento.nome}"</strong>
                            {' '}({equipamentoParaAlterarStatus.equipamento.codigo})?
                        </p>
                        <div className="equipamentos-modal-acoes">
                            <button
                                type="button"
                                className="equipamentos-modal-cancelar"
                                onClick={cancelarAlteracaoStatus}
                                disabled={processandoStatus}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className={equipamentoParaAlterarStatus.acao === 'reativar'
                                    ? 'equipamentos-modal-confirmar'
                                    : 'equipamentos-modal-confirmar perigo'}
                                onClick={confirmarAlteracaoStatus}
                                disabled={processandoStatus}
                            >
                                {processandoStatus
                                    ? 'Aguarde...'
                                    : equipamentoParaAlterarStatus.acao === 'reativar'
                                        ? 'Reativar'
                                        : 'Desativar'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {resultadoStatus && (
                <div className="equipamentos-modal-overlay" role="presentation">
                    <section
                        className="equipamentos-modal equipamentos-modal-resultado"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="equipamentos-resultado-titulo"
                        aria-describedby="equipamentos-resultado-descricao"
                    >
                        <div className={`equipamentos-modal-icone ${resultadoStatus.tipo === 'sucesso' ? 'sucesso' : 'erro'}`} aria-hidden="true">
                            {resultadoStatus.tipo === 'sucesso' ? '✓' : '!'}
                        </div>
                        <h3 id="equipamentos-resultado-titulo">{resultadoStatus.titulo}</h3>
                        <p id="equipamentos-resultado-descricao">{resultadoStatus.mensagem}</p>
                        <div className="equipamentos-modal-acoes">
                            <button
                                type="button"
                                className="equipamentos-modal-confirmar"
                                onClick={() => setResultadoStatus(null)}
                                autoFocus
                            >
                                Entendi
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Equipamentos;
