import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/regulatorio.css';

const FORMULARIO_INICIAL = {
    equipamento_id: '',
    registro_anvisa_ms: '',
    situacao_regulatoria: '',
    data_registro: '',
    data_validade: '',
    fabricante_legal: '',
    detentor_registro: '',
    documento_regulatorio: '',
    observacoes: ''
};

const formatarData = (data) => {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });
};

const formatarDataParaInput = (data) => {
    if (!data) {
        return '';
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return '';
    }

    return dataObj.toISOString().split('T')[0];
};

function Regulatorio() {
    const { usuario } = useAuth();

    const [regulatorios, setRegulatorios] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [busca, setBusca] = useState('');

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [formulario, setFormulario] = useState(
        FORMULARIO_INICIAL
    );

    const [editandoId, setEditandoId] = useState(null);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [erroCadastro, setErroCadastro] = useState('');

    const podeEditar =
        usuario?.perfil === 'ADMIN' ||
        usuario?.perfil === 'EDITOR';

    const carregarRegulatorios = async () => {
        try {
            const resposta = await api.get('/regulatorios');

            setRegulatorios(
                resposta.data.regulatorios || []
            );
        } catch (error) {
            console.error(
                'Erro ao carregar informações regulatórias:',
                error
            );

            setErro(
                'Não foi possível carregar as informações regulatórias.'
            );
        }
    };

    const carregarEquipamentos = async () => {
        try {
            const resposta = await api.get('/equipamentos');

            setEquipamentos(
                Array.isArray(resposta.data)
                    ? resposta.data
                    : []
            );
        } catch (error) {
            console.error(
                'Erro ao carregar equipamentos:',
                error
            );

            setErroCadastro(
                'Não foi possível carregar os equipamentos.'
            );
        }
    };

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);

            await Promise.all([
                carregarRegulatorios(),
                carregarEquipamentos()
            ]);

            setCarregando(false);
        };

        carregarDados();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [name]: value
        }));
    };

    const limparFormulario = () => {
        setFormulario(FORMULARIO_INICIAL);
        setEditandoId(null);
        setErroCadastro('');
    };

    const abrirFormulario = async () => {
        setMensagemSucesso('');
        setErroCadastro('');
        setEditandoId(null);

        limparFormulario();

        await carregarEquipamentos();

        setMostrarFormulario(true);
    };

    const cancelarFormulario = () => {
        limparFormulario();
        setMostrarFormulario(false);
    };

    const editarRegulatorio = (regulatorio) => {
        setMensagemSucesso('');
        setErroCadastro('');

        setEditandoId(regulatorio.id);

        setFormulario({
            equipamento_id: String(regulatorio.equipamento_id || ''),
            registro_anvisa_ms: regulatorio.registro_anvisa_ms || '',
            situacao_regulatoria:
                regulatorio.situacao_regulatoria || '',
            data_registro:
                formatarDataParaInput(regulatorio.data_registro),
            data_validade:
                formatarDataParaInput(regulatorio.data_validade),
            fabricante_legal:
                regulatorio.fabricante_legal || '',
            detentor_registro:
                regulatorio.detentor_registro || '',
            documento_regulatorio:
                regulatorio.documento_regulatorio || '',
            observacoes:
                regulatorio.observacoes || ''
        });

        setMostrarFormulario(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const salvarRegulatorio = async (event) => {
        event.preventDefault();

        setMensagemSucesso('');
        setErroCadastro('');

        try {
            if (editandoId) {
                await api.put(
                    `/regulatorios/${editandoId}`,
                    formulario
                );

                await carregarRegulatorios();

                setMensagemSucesso(
                    'Informações regulatórias atualizadas com sucesso.'
                );
            } else {
                await api.post(
                    '/regulatorios',
                    formulario
                );

                await carregarRegulatorios();

                setMensagemSucesso(
                    'Informações regulatórias cadastradas com sucesso.'
                );
            }

            limparFormulario();
            setMostrarFormulario(false);

            setTimeout(() => {
                setMensagemSucesso('');
            }, 3000);
        } catch (error) {
            console.error(
                'Erro ao salvar informações regulatórias:',
                error.response?.data || error
            );

            setErroCadastro(
                error.response?.data?.mensagem ||
                'Não foi possível salvar as informações regulatórias.'
            );

            setTimeout(() => {
                setErroCadastro('');
            }, 4000);
        }
    };

    const regulatoriosFiltrados = regulatorios.filter(
        (regulatorio) => {
            const termo = busca
                .toLowerCase()
                .trim();

            if (!termo) {
                return true;
            }

            return (
                regulatorio.equipamento_codigo
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.equipamento_nome
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.registro_anvisa_ms
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.situacao_regulatoria
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.fabricante_legal
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.detentor_registro
                    ?.toLowerCase()
                    .includes(termo) ||

                regulatorio.documento_regulatorio
                    ?.toLowerCase()
                    .includes(termo)
            );
        }
    );

    return (
        <div className="regulatorio-page">

            <div className="regulatorio-title">
                <div>
                    <h2>Regulatório</h2>

                    <p>
                        Informações regulatórias dos equipamentos.
                    </p>
                </div>

                {podeEditar && (
                    <button
                        type="button"
                        className="regulatorio-botao-novo"
                        onClick={abrirFormulario}
                    >
                        + Novo registro
                    </button>
                )}
            </div>

            {mensagemSucesso && (
                <div className="regulatorio-mensagem sucesso">
                    ✓ {mensagemSucesso}
                </div>
            )}

            {erro && (
                <div className="regulatorio-mensagem erro">
                    {erro}
                </div>
            )}

            {erroCadastro && (
                <div className="regulatorio-mensagem erro">
                    {erroCadastro}
                </div>
            )}

            {mostrarFormulario && podeEditar && (
                <section className="regulatorio-formulario">

                    <div className="regulatorio-formulario-titulo">
                        <div>
                            <h3>
                                {editandoId
                                    ? 'Editar registro regulatório'
                                    : 'Novo registro regulatório'}
                            </h3>

                            <p>
                                {editandoId
                                    ? 'Atualize as informações regulatórias do equipamento.'
                                    : 'Preencha as informações regulatórias do equipamento.'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={salvarRegulatorio}>

                        <div className="regulatorio-form-grid">

                            <div className="regulatorio-campo">
                                <label htmlFor="equipamento_id">
                                    Equipamento
                                </label>

                                <select
                                    id="equipamento_id"
                                    name="equipamento_id"
                                    value={formulario.equipamento_id}
                                    onChange={handleChange}
                                    required
                                    disabled={Boolean(editandoId)}
                                >
                                    <option value="">
                                        Selecione o equipamento
                                    </option>

                                    {equipamentos
                                        .filter(
                                            (equipamento) =>
                                                equipamento.ativo !== false
                                        )
                                        .map((equipamento) => (
                                            <option
                                                key={equipamento.id}
                                                value={equipamento.id}
                                            >
                                                {equipamento.codigo} - {equipamento.nome}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="registro_anvisa_ms">
                                    Registro ANVISA/MS
                                </label>

                                <input
                                    id="registro_anvisa_ms"
                                    name="registro_anvisa_ms"
                                    type="text"
                                    value={formulario.registro_anvisa_ms}
                                    onChange={handleChange}
                                    placeholder="Ex.: MS-123456789"
                                />
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="situacao_regulatoria">
                                    Situação regulatória
                                </label>

                                <select
                                    id="situacao_regulatoria"
                                    name="situacao_regulatoria"
                                    value={formulario.situacao_regulatoria}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Selecione a situação
                                    </option>

                                    <option value="VIGENTE">
                                        Vigente
                                    </option>

                                    <option value="VENCIDO">
                                        Vencido
                                    </option>

                                    <option value="PENDENTE">
                                        Pendente
                                    </option>

                                    <option value="ISENTO">
                                        Isento
                                    </option>
                                </select>
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="data_registro">
                                    Data do registro
                                </label>

                                <input
                                    id="data_registro"
                                    name="data_registro"
                                    type="date"
                                    value={formulario.data_registro}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="data_validade">
                                    Data de validade
                                </label>

                                <input
                                    id="data_validade"
                                    name="data_validade"
                                    type="date"
                                    value={formulario.data_validade}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="fabricante_legal">
                                    Fabricante legal
                                </label>

                                <input
                                    id="fabricante_legal"
                                    name="fabricante_legal"
                                    type="text"
                                    value={formulario.fabricante_legal}
                                    onChange={handleChange}
                                    placeholder="Ex.: Shimadzu Corporation"
                                />
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="detentor_registro">
                                    Detentor do registro
                                </label>

                                <input
                                    id="detentor_registro"
                                    name="detentor_registro"
                                    type="text"
                                    value={formulario.detentor_registro}
                                    onChange={handleChange}
                                    placeholder="Ex.: Empresa Detentora"
                                />
                            </div>

                            <div className="regulatorio-campo">
                                <label htmlFor="documento_regulatorio">
                                    Documento regulatório
                                </label>

                                <input
                                    id="documento_regulatorio"
                                    name="documento_regulatorio"
                                    type="text"
                                    value={formulario.documento_regulatorio}
                                    onChange={handleChange}
                                    placeholder="Ex.: REG-001-2026"
                                />
                            </div>

                            <div className="regulatorio-campo regulatorio-campo-completo">
                                <label htmlFor="observacoes">
                                    Observações
                                </label>

                                <textarea
                                    id="observacoes"
                                    name="observacoes"
                                    value={formulario.observacoes}
                                    onChange={handleChange}
                                    placeholder="Digite observações adicionais..."
                                    rows="4"
                                />
                            </div>

                        </div>

                        <div className="regulatorio-form-acoes">

                            <button
                                type="button"
                                className="regulatorio-botao-cancelar"
                                onClick={cancelarFormulario}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="regulatorio-botao-salvar"
                            >
                                {editandoId
                                    ? 'Salvar alterações'
                                    : 'Cadastrar registro'}
                            </button>

                        </div>

                    </form>

                </section>
            )}

            <div className="regulatorio-busca">

                <input
                    type="text"
                    value={busca}
                    onChange={(event) =>
                        setBusca(event.target.value)
                    }
                    placeholder="Buscar por código, equipamento, ANVISA, situação..."
                />

            </div>

            {carregando ? (
                <p className="regulatorio-carregando">
                    Carregando informações regulatórias...
                </p>
            ) : (
                <div className="regulatorio-tabela-container">

                    <table className="regulatorio-tabela">

                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Equipamento</th>
                                <th>Registro ANVISA/MS</th>
                                <th>Situação</th>
                                <th>Data do registro</th>
                                <th>Data de validade</th>
                                <th>Fabricante legal</th>
                                <th>Detentor do registro</th>
                                <th>Documento</th>

                                {podeEditar && (
                                    <th>Ações</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>

                            {regulatoriosFiltrados.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={podeEditar ? 10 : 9}
                                        className="regulatorio-sem-registros"
                                    >
                                        Nenhuma informação regulatória encontrada.
                                    </td>
                                </tr>
                            ) : (
                                regulatoriosFiltrados.map(
                                    (regulatorio) => (
                                        <tr key={regulatorio.id}>

                                            <td>
                                                {regulatorio.equipamento_codigo}
                                            </td>

                                            <td>
                                                {regulatorio.equipamento_nome}
                                            </td>

                                            <td>
                                                {regulatorio.registro_anvisa_ms || '-'}
                                            </td>

                                            <td>
                                                {regulatorio.situacao_regulatoria || '-'}
                                            </td>

                                            <td>
                                                {formatarData(
                                                    regulatorio.data_registro
                                                )}
                                            </td>

                                            <td>
                                                {formatarData(
                                                    regulatorio.data_validade
                                                )}
                                            </td>

                                            <td>
                                                {regulatorio.fabricante_legal || '-'}
                                            </td>

                                            <td>
                                                {regulatorio.detentor_registro || '-'}
                                            </td>

                                            <td>
                                                {regulatorio.documento_regulatorio || '-'}
                                            </td>

                                            {podeEditar && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="regulatorio-botao-editar"
                                                        onClick={() =>
                                                            editarRegulatorio(
                                                                regulatorio
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

export default Regulatorio;