import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

function Equipamentos() {

    const { usuario } = useAuth();

    const [equipamentos, setEquipamentos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');

    const [busca, setBusca] = useState('');

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const [erroCadastro, setErroCadastro] = useState('');

    const [formulario, setFormulario] = useState({
        codigo: '',
        nome: '',
        fabricante: '',
        numero_serie: '',
        localizacao: '',
        status_qualificacao: '',
        status_manutencao: ''
    });


    useEffect(() => {

        const carregarEquipamentos = async () => {

            try {

                const resposta = await api.get('/equipamentos');

                setEquipamentos(resposta.data);

            } catch (error) {

                console.error('Erro ao carregar equipamentos:', error);

                setErro('Não foi possível carregar os equipamentos.');

            } finally {

                setCarregando(false);

            }

        };

        carregarEquipamentos();

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

    const cadastrarEquipamento = async () => {
        try {
            const resposta = await api.post('/equipamentos', formulario);

            console.log('Equipamento cadastrado:', resposta.data);

            const listaAtualizada = await api.get('/equipamentos');

            setEquipamentos(listaAtualizada.data);

            setMensagemSucesso('Equipamento cadastrado com sucesso.');

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);

            setFormulario({
                codigo: '',
                nome: '',
                fabricante: '',
                numero_serie: '',
                localizacao: '',
                status_qualificacao: '',
                status_manutencao: ''
            });

            setMostrarFormulario(false);

        } catch (error) {
            setMensagemSucesso('');

            console.error('Erro ao cadastrar equipamento:', error.response?.data);

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível cadastrar o equipamento.'
            );

            setTimeout(() => {
                setErroCadastro('');
            }, 3000);
        }
    };

    return (
        <div className="equipamentos-page">

            <div className="equipamentos-title">
                <div>
                    <h2>Equipamentos</h2>
                    <p>Lista-mestra de equipamentos</p>
                </div>

                {(usuario?.perfil === 'ADMIN' || usuario?.perfil === 'EDITOR') && (
                    <button
                        className="novo-equipamento-button"
                        onClick={() => setMostrarFormulario(true)}
                    >
                        + Novo equipamento
                    </button>
                )}

            </div>

            {mostrarFormulario && (
                <div className="equipamentos-formulario">

                    <h3>Novo equipamento</h3>

                    <p>
                        Preencha as informações do equipamento.
                    </p>

                    <div className="formulario-campo">

                        <label htmlFor="codigo">
                            Código
                        </label>

                        <input
                            id="codigo"
                            type="text"
                            placeholder="Ex.: EQ-005"
                            value={formulario.codigo}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    codigo: event.target.value
                                })
                            }
                        />

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="nome">
                            Nome do equipamento
                        </label>

                        <input
                            id="nome"
                            type="text"
                            placeholder="Ex.: Balança Analítica"
                            value={formulario.nome}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    nome: event.target.value
                                })
                            }
                        />

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="fabricante">
                            Fabricante
                        </label>

                        <input
                            id="fabricante"
                            type="text"
                            placeholder="Ex.: Shimadzu"
                            value={formulario.fabricante}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    fabricante: event.target.value
                                })
                            }
                        />

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="numero_serie">
                            Número de série
                        </label>

                        <input
                            id="numero_serie"
                            type="text"
                            placeholder="Ex.: BA0052026"
                            value={formulario.numero_serie}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    numero_serie: event.target.value
                                })
                            }
                        />

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="localizacao">
                            Localização
                        </label>

                        <input
                            id="localizacao"
                            type="text"
                            placeholder="Ex.: Laboratório de Controle de Qualidade"
                            value={formulario.localizacao}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    localizacao: event.target.value
                                })
                            }
                        />

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="status_qualificacao">
                            Status de qualificação
                        </label>

                        <select
                            id="status_qualificacao"
                            value={formulario.status_qualificacao}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    status_qualificacao: event.target.value
                                })
                            }
                        >
                            <option value="">
                                Selecione o status
                            </option>

                            <option value="QUALIFICADO">
                                Qualificado
                            </option>

                            <option value="PENDENTE">
                                Pendente
                            </option>

                            <option value="VENCIDO">
                                Vencido
                            </option>
                        </select>

                    </div>

                    <div className="formulario-campo">

                        <label htmlFor="status_manutencao">
                            Status de manutenção
                        </label>

                        <select
                            id="status_manutencao"
                            value={formulario.status_manutencao}
                            onChange={(event) =>
                                setFormulario({
                                    ...formulario,
                                    status_manutencao: event.target.value
                                })
                            }
                        >
                            <option value="">
                                Selecione o status
                            </option>

                            <option value="EM DIA">
                                Em dia
                            </option>

                            <option value="EM MANUTENÇÃO">
                                Em manutenção
                            </option>

                            <option value="VENCIDA">
                                Vencida
                            </option>
                        </select>

                    </div>

                    <div className="formulario-acoes">
                        <button
                            type="button"
                            className="botao-cancelar"
                            onClick={() => setMostrarFormulario(false)}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="botao-cadastrar"
                            onClick={cadastrarEquipamento}
                        >
                            Cadastrar equipamento
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

            {mensagemSucesso && (
                <div className="mensagem-sucesso">
                    <span>✓</span>
                    <p>{mensagemSucesso}</p>
                </div>
            )}

            {carregando && (
                <p>Carregando equipamentos...</p>
            )}

            {erro && (
                <p>{erro}</p>
            )}

            {erroCadastro && (
                <div className="mensagem-erro">
                    <span>!</span>
                    <p>{erroCadastro}</p>
                </div>
            )}

            {!carregando && !erro && (
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
                            </tr>
                        </thead>

                        <tbody>

                            {equipamentosFiltrados.length === 0 ? (

                                <tr>
                                    <td colSpan="7">
                                        Nenhum equipamento encontrado.
                                    </td>
                                </tr>

                            ) : (

                                equipamentosFiltrados.map((equipamento) => (

                                    <tr key={equipamento.id}>

                                        <td>
                                            {equipamento.codigo}
                                        </td>

                                        <td>
                                            {equipamento.nome}
                                        </td>

                                        <td>
                                            {equipamento.fabricante}
                                        </td>

                                        <td>
                                            {equipamento.numero_serie || '-'}
                                        </td>

                                        <td>
                                            {equipamento.localizacao || '-'}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${equipamento.status_qualificacao === 'QUALIFICADO'
                                                    ? 'status-success'
                                                    : 'status-warning'
                                                    }`}
                                            >
                                                {equipamento.status_qualificacao}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${equipamento.status_manutencao === 'EM DIA'
                                                    ? 'status-success'
                                                    : 'status-warning'
                                                    }`}
                                            >
                                                {equipamento.status_manutencao}
                                            </span>
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}

export default Equipamentos;