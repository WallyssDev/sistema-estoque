import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';
import '../styles/operacional.css';

function formatarData(data) {
    if (!data) {
        return '';
    }

    return String(data).slice(0, 10);
}

function formatarDataExibicao(data) {
    if (!data) {
        return '-';
    }

    const valor = String(data).slice(0, 10);
    const partes = valor.split('-');

    if (partes.length !== 3) {
        return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function criarFormularioVazio() {
    return {
        equipamento_id: '',
        modelo: '',
        numero_patrimonio_fase: '',
        registro_anvisa_ms: '',
        unidade: '',
        sala: '',
        data_aquisicao: '',
        status_operacional: '',
        frequencia_manutencao_interna: '',
        frequencia_manutencao_externa: ''
    };
}

function Operacional() {
    const { usuario } = useAuth();

    const [operacionais, setOperacionais] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(true);

    const [erro, setErro] = useState('');
    const [erroCadastro, setErroCadastro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const [busca, setBusca] = useState('');

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(false);
    const [operacionalEditandoId, setOperacionalEditandoId] = useState(null);

    const [formulario, setFormulario] = useState(
        criarFormularioVazio()
    );

    const podeEditar =
        usuario?.perfil === 'ADMIN' ||
        usuario?.perfil === 'EDITOR';

    const carregarOperacionais = async () => {
        try {
            setErro('');

            const resposta = await api.get('/operacionais');

            setOperacionais(resposta.data.operacionais || []);
        } catch (error) {
            console.error(
                'Erro ao carregar informações operacionais:',
                error
            );

            setErro(
                error.response?.data?.mensagem ||
                'Não foi possível carregar as informações operacionais.'
            );
        } finally {
            setCarregando(false);
        }
    };

    const carregarEquipamentos = async () => {
        try {
            setCarregandoEquipamentos(true);

            const resposta = await api.get('/equipamentos');

            setEquipamentos(resposta.data || []);
        } catch (error) {
            console.error(
                'Erro ao carregar equipamentos:',
                error
            );

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível carregar os equipamentos.'
            );
        } finally {
            setCarregandoEquipamentos(false);
        }
    };

    useEffect(() => {
        carregarOperacionais();
        carregarEquipamentos();
    }, []);

    const equipamentosDisponiveis = equipamentos.filter((equipamento) => {
        const jaPossuiOperacional = operacionais.some(
            (operacional) =>
                operacional.equipamento_id === equipamento.id
        );

        return equipamento.ativo && !jaPossuiOperacional;
    });

    const operacionaisFiltrados = operacionais.filter((operacional) => {
        const termo = busca.toLowerCase().trim();

        if (!termo) {
            return true;
        }

        return (
            operacional.equipamento_codigo
                ?.toLowerCase()
                .includes(termo) ||

            operacional.equipamento_nome
                ?.toLowerCase()
                .includes(termo) ||

            operacional.modelo
                ?.toLowerCase()
                .includes(termo) ||

            operacional.numero_patrimonio_fase
                ?.toLowerCase()
                .includes(termo) ||

            operacional.registro_anvisa_ms
                ?.toLowerCase()
                .includes(termo) ||

            operacional.unidade
                ?.toLowerCase()
                .includes(termo) ||

            operacional.sala
                ?.toLowerCase()
                .includes(termo)
        );
    });

    const alterarCampo = (campo, valor) => {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor
        }));
    };

    const limparFormulario = () => {
        setFormulario(criarFormularioVazio());
    };

    const abrirFormularioCadastro = () => {
        setErroCadastro('');
        setMensagemSucesso('');
        setEditando(false);
        setOperacionalEditandoId(null);
        limparFormulario();
        setMostrarFormulario(true);
    };

    const abrirFormularioEdicao = (operacional) => {
        setErroCadastro('');
        setMensagemSucesso('');

        setEditando(true);
        setOperacionalEditandoId(operacional.id);

        setFormulario({
            equipamento_id: operacional.equipamento_id || '',
            modelo: operacional.modelo || '',
            numero_patrimonio_fase:
                operacional.numero_patrimonio_fase || '',
            registro_anvisa_ms:
                operacional.registro_anvisa_ms || '',
            unidade: operacional.unidade || '',
            sala: operacional.sala || '',
            data_aquisicao:
                formatarData(operacional.data_aquisicao),
            status_operacional:
                operacional.status_operacional || '',
            frequencia_manutencao_interna:
                operacional.frequencia_manutencao_interna || '',
            frequencia_manutencao_externa:
                operacional.frequencia_manutencao_externa || ''
        });

        setMostrarFormulario(true);
    };

    const fecharFormulario = () => {
        setMostrarFormulario(false);
        setEditando(false);
        setOperacionalEditandoId(null);
        setErroCadastro('');
        limparFormulario();
    };

    const cadastrarOperacional = async () => {
        setErroCadastro('');
        setMensagemSucesso('');

        if (!formulario.equipamento_id) {
            setErroCadastro('Selecione um equipamento.');
            return;
        }

        if (!formulario.status_operacional) {
            setErroCadastro('Selecione o status operacional.');
            return;
        }

        try {
            await api.post('/operacionais', formulario);

            await carregarOperacionais();

            setMensagemSucesso(
                'Informações operacionais cadastradas com sucesso.'
            );

            fecharFormulario();

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);
        } catch (error) {
            console.error(
                'Erro ao cadastrar informações operacionais:',
                error.response?.data
            );

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível cadastrar as informações operacionais.'
            );
        }
    };

    const atualizarOperacional = async () => {
        setErroCadastro('');
        setMensagemSucesso('');

        if (!operacionalEditandoId) {
            setErroCadastro(
                'Não foi possível identificar o registro operacional.'
            );
            return;
        }

        if (!formulario.status_operacional) {
            setErroCadastro('Selecione o status operacional.');
            return;
        }

        try {
            const dadosAtualizacao = {
                modelo: formulario.modelo,
                numero_patrimonio_fase:
                    formulario.numero_patrimonio_fase,
                registro_anvisa_ms:
                    formulario.registro_anvisa_ms,
                unidade: formulario.unidade,
                sala: formulario.sala,
                data_aquisicao:
                    formulario.data_aquisicao || null,
                status_operacional:
                    formulario.status_operacional,
                frequencia_manutencao_interna:
                    formulario.frequencia_manutencao_interna,
                frequencia_manutencao_externa:
                    formulario.frequencia_manutencao_externa
            };

            await api.put(
                `/operacionais/${operacionalEditandoId}`,
                dadosAtualizacao
            );

            await carregarOperacionais();

            setMensagemSucesso(
                'Informações operacionais atualizadas com sucesso.'
            );

            fecharFormulario();

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);
        } catch (error) {
            console.error(
                'Erro ao atualizar informações operacionais:',
                error.response?.data
            );

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível atualizar as informações operacionais.'
            );
        }
    };

    const salvarFormulario = async () => {
        if (editando) {
            await atualizarOperacional();
            return;
        }

        await cadastrarOperacional();
    };

    return (
        <div className="operacional-page">

            <div className="operacional-title">

                <div>
                    <h2>Operacional</h2>

                    <p>
                        Informações operacionais dos equipamentos.
                    </p>
                </div>

                {podeEditar && (
                    <button
                        type="button"
                        className="novo-operacional-button"
                        onClick={abrirFormularioCadastro}
                    >
                        + Novo registro
                    </button>
                )}

            </div>

            {mostrarFormulario && (
                <div className="operacional-formulario">

                    <h3>
                        {editando
                            ? 'Editar registro operacional'
                            : 'Novo registro operacional'}
                    </h3>

                    <p>
                        {editando
                            ? 'Atualize as informações operacionais do equipamento.'
                            : 'Preencha as informações operacionais do equipamento.'}
                    </p>

                    <div className="operacional-formulario-grid">

                        <div className="operacional-formulario-campo">
                            <label htmlFor="equipamento_id">
                                Equipamento
                            </label>

                            <select
                                id="equipamento_id"
                                value={formulario.equipamento_id}
                                onChange={(event) =>
                                    alterarCampo(
                                        'equipamento_id',
                                        event.target.value
                                    )
                                }
                                disabled={editando}
                            >
                                {editando ? (
                                    <option value={formulario.equipamento_id}>
                                        {operacionais.find(
                                            (item) =>
                                                item.id === operacionalEditandoId
                                        )?.equipamento_codigo
                                            ? `${operacionais.find(
                                                (item) =>
                                                    item.id === operacionalEditandoId
                                            )?.equipamento_codigo} - ${operacionais.find(
                                                (item) =>
                                                    item.id === operacionalEditandoId
                                            )?.equipamento_nome}`
                                            : 'Equipamento vinculado'}
                                    </option>
                                ) : (
                                    <>
                                        <option value="">
                                            {carregandoEquipamentos
                                                ? 'Carregando equipamentos...'
                                                : 'Selecione o equipamento'}
                                        </option>

                                        {equipamentosDisponiveis.map(
                                            (equipamento) => (
                                                <option
                                                    key={equipamento.id}
                                                    value={equipamento.id}
                                                >
                                                    {equipamento.codigo} - {equipamento.nome}
                                                </option>
                                            )
                                        )}
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="modelo">
                                Modelo
                            </label>

                            <input
                                id="modelo"
                                type="text"
                                placeholder="Ex.: AUW220D"
                                value={formulario.modelo}
                                onChange={(event) =>
                                    alterarCampo(
                                        'modelo',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="numero_patrimonio_fase">
                                Nº Patrimônio/Fase
                            </label>

                            <input
                                id="numero_patrimonio_fase"
                                type="text"
                                placeholder="Ex.: PAT-002-2026"
                                value={formulario.numero_patrimonio_fase}
                                onChange={(event) =>
                                    alterarCampo(
                                        'numero_patrimonio_fase',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="registro_anvisa_ms">
                                Registro ANVISA/MS
                            </label>

                            <input
                                id="registro_anvisa_ms"
                                type="text"
                                placeholder="Ex.: MS-123456789"
                                value={formulario.registro_anvisa_ms}
                                onChange={(event) =>
                                    alterarCampo(
                                        'registro_anvisa_ms',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="unidade">
                                Unidade
                            </label>

                            <input
                                id="unidade"
                                type="text"
                                placeholder="Ex.: Controle de Qualidade"
                                value={formulario.unidade}
                                onChange={(event) =>
                                    alterarCampo(
                                        'unidade',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="sala">
                                Sala
                            </label>

                            <input
                                id="sala"
                                type="text"
                                placeholder="Ex.: Laboratório 01"
                                value={formulario.sala}
                                onChange={(event) =>
                                    alterarCampo(
                                        'sala',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="data_aquisicao">
                                Data de aquisição
                            </label>

                            <input
                                id="data_aquisicao"
                                type="date"
                                value={formatarData(formulario.data_aquisicao)}
                                onChange={(event) =>
                                    alterarCampo(
                                        'data_aquisicao',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="status_operacional">
                                Status operacional
                            </label>

                            <select
                                id="status_operacional"
                                value={formulario.status_operacional}
                                onChange={(event) =>
                                    alterarCampo(
                                        'status_operacional',
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Selecione o status
                                </option>

                                <option value="ATIVO">
                                    Ativo
                                </option>

                                <option value="INATIVO">
                                    Inativo
                                </option>

                                <option value="EM MANUTENÇÃO">
                                    Em manutenção
                                </option>
                            </select>
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="frequencia_manutencao_interna">
                                Frequência manutenção interna
                            </label>

                            <input
                                id="frequencia_manutencao_interna"
                                type="text"
                                placeholder="Ex.: Mensal"
                                value={
                                    formulario.frequencia_manutencao_interna
                                }
                                onChange={(event) =>
                                    alterarCampo(
                                        'frequencia_manutencao_interna',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="operacional-formulario-campo">
                            <label htmlFor="frequencia_manutencao_externa">
                                Frequência manutenção externa
                            </label>

                            <input
                                id="frequencia_manutencao_externa"
                                type="text"
                                placeholder="Ex.: Anual"
                                value={
                                    formulario.frequencia_manutencao_externa
                                }
                                onChange={(event) =>
                                    alterarCampo(
                                        'frequencia_manutencao_externa',
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                    </div>

                    {erroCadastro && (
                        <div className="mensagem-erro">
                            <span>!</span>
                            <p>{erroCadastro}</p>
                        </div>
                    )}

                    <div className="operacional-formulario-acoes">

                        <button
                            type="button"
                            className="botao-cancelar"
                            onClick={fecharFormulario}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="botao-cadastrar"
                            onClick={salvarFormulario}
                        >
                            {editando
                                ? 'Salvar alterações'
                                : 'Cadastrar registro'}
                        </button>

                    </div>

                </div>
            )}

            <div className="operacional-toolbar">

                <input
                    type="text"
                    placeholder="Buscar por código, equipamento, modelo, patrimônio..."
                    value={busca}
                    onChange={(event) =>
                        setBusca(event.target.value)
                    }
                />

            </div>

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    <span>✓</span>
                    <p>{mensagemSucesso}</p>
                </div>
            )}

            {carregando && (
                <p>
                    Carregando informações operacionais...
                </p>
            )}

            {erro && (
                <div className="mensagem-erro">
                    <span>!</span>
                    <p>{erro}</p>
                </div>
            )}

            {!carregando && !erro && (
                <div className="operacional-table-container">

                    <table className="operacional-table">

                        <thead>

                            <tr>
                                <th>Código</th>
                                <th>Equipamento</th>
                                <th>Modelo</th>
                                <th>Patrimônio/Fase</th>
                                <th>ANVISA/MS</th>
                                <th>Unidade</th>
                                <th>Sala</th>
                                <th>Data de aquisição</th>
                                <th>Status</th>

                                {podeEditar && (
                                    <th>Ações</th>
                                )}
                            </tr>

                        </thead>

                        <tbody>

                            {operacionaisFiltrados.length === 0 ? (

                                <tr>
                                    <td colSpan={podeEditar ? 10 : 9}>
                                        Nenhuma informação operacional encontrada.
                                    </td>
                                </tr>

                            ) : (

                                operacionaisFiltrados.map(
                                    (operacional) => (

                                        <tr key={operacional.id}>

                                            <td>
                                                {operacional.equipamento_codigo || '-'}
                                            </td>

                                            <td>
                                                {operacional.equipamento_nome || '-'}
                                            </td>

                                            <td>
                                                {operacional.modelo || '-'}
                                            </td>

                                            <td>
                                                {operacional.numero_patrimonio_fase || '-'}
                                            </td>

                                            <td>
                                                {operacional.registro_anvisa_ms || '-'}
                                            </td>

                                            <td>
                                                {operacional.unidade || '-'}
                                            </td>

                                            <td>
                                                {operacional.sala || '-'}
                                            </td>

                                            <td>
                                                {formatarDataExibicao(
                                                    operacional.data_aquisicao
                                                )}
                                            </td>

                                            <td>
                                                {operacional.status_operacional || '-'}
                                            </td>

                                            {podeEditar && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirFormularioEdicao(
                                                                operacional
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            )}

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}

export default Operacional;