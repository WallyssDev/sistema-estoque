import { useEffect, useState } from 'react';
import api from '../services/api';

const CAMPOS_DATA = new Set([
    'data_manutencao', 'proxima_manutencao', 'data_qualificacao',
    'proxima_qualificacao', 'data_aquisicao', 'data_registro', 'data_validade'
]);

const CAMPOS = {
    EQUIPAMENTO: [
        ['codigo', 'Código'], ['nome', 'Nome'], ['fabricante', 'Fabricante'],
        ['numero_serie', 'Número de série'], ['localizacao', 'Localização'],
        ['especificacao', 'Especificação'],
        ['status_qualificacao', 'Status de qualificação'],
        ['status_manutencao', 'Status de manutenção'],
        ['conduta_incidente', 'Conduta em caso de incidente'], ['ativo', 'Ativo']
    ],
    MANUTENCAO: [
        ['id', 'ID'], ['tipo', 'Tipo'], ['data_manutencao', 'Data da manutenção'],
        ['proxima_manutencao', 'Próxima manutenção'],
        ['responsavel', 'Responsável'], ['resultado', 'Resultado'],
        ['descricao', 'Descrição'], ['observacoes', 'Observações']
    ],
    QUALIFICACAO: [
        ['id', 'ID'], ['tipo', 'Tipo'],
        ['data_qualificacao', 'Data da qualificação'],
        ['proxima_qualificacao', 'Próxima qualificação'],
        ['responsavel', 'Responsável'], ['resultado', 'Resultado'],
        ['descricao', 'Descrição'], ['observacoes', 'Observações']
    ],
    OPERACIONAL: [
        ['id', 'ID'], ['modelo', 'Modelo'],
        ['numero_patrimonio_fase', 'Número de patrimônio'],
        ['registro_anvisa_ms', 'Registro ANVISA/MS'],
        ['unidade', 'Unidade'], ['sala', 'Sala'],
        ['data_aquisicao', 'Data de aquisição'],
        ['status_operacional', 'Status operacional'],
        ['frequencia_manutencao_interna', 'Frequência de manutenção interna'],
        ['frequencia_manutencao_externa', 'Frequência de manutenção externa']
    ],
    REGULATORIO: [
        ['id', 'ID'], ['registro_anvisa_ms', 'Registro ANVISA/MS'],
        ['situacao_regulatoria', 'Situação regulatória'],
        ['data_registro', 'Data do registro'], ['data_validade', 'Data de validade'],
        ['fabricante_legal', 'Fabricante legal'],
        ['detentor_registro', 'Detentor do registro'],
        ['documento_regulatorio', 'Documento regulatório'],
        ['observacoes', 'Observações']
    ]
};

const FILTROS_INICIAIS = {
    usuario_id: '', acao: '', entidade: '', registro_id: '',
    data_inicio: '', data_fim: ''
};

const interpretarValor = (valor) => {
    if (valor === null || valor === undefined || valor === '') return null;
    if (typeof valor !== 'string') return valor;
    try { return JSON.parse(valor); } catch { return null; }
};

const formatarData = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '-';
    const texto = String(valor);
    const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    const data = new Date(texto);
    return Number.isNaN(data.getTime())
        ? texto
        : data.toLocaleDateString('pt-BR');
};

const formatarDataHora = (valor) => {
    if (!valor) return '-';
    const data = new Date(valor);
    return Number.isNaN(data.getTime())
        ? String(valor)
        : data.toLocaleString('pt-BR');
};

const formatarValorAuditoria = (campo, valor) => {
    if (valor === null || valor === undefined || valor === '') return '-';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    if (CAMPOS_DATA.has(campo)) return formatarData(valor);
    if (typeof valor === 'object') return JSON.stringify(valor);
    return String(valor);
};

const formatarResumo = (registro, valor) => {
    const objeto = interpretarValor(valor);
    if (registro.acao === 'CRIACAO' && objeto && typeof objeto === 'object') {
        return 'Registro criado';
    }
    return formatarValorAuditoria(registro.campo, valor);
};

const nomeCampo = (entidade, campo) =>
    CAMPOS[entidade]?.find(([chave]) => chave === campo)?.[1] || campo || '-';

function Auditoria() {
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [usuarios, setUsuarios] = useState([]);
    const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
    const [registroSelecionado, setRegistroSelecionado] = useState(null);
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [buscandoEquipamento, setBuscandoEquipamento] = useState(false);

    const dadosInterpretados = registroSelecionado
        ? interpretarValor(registroSelecionado.valor_novo) : null;
    const dadosSelecionados = dadosInterpretados &&
        typeof dadosInterpretados === 'object' && !Array.isArray(dadosInterpretados)
        ? dadosInterpretados : null;

    useEffect(() => {
        let ativo = true;
        const carregarAuditoria = async () => {
            setCarregando(true);
            setErro('');
            try {
                const resposta = await api.get('/auditoria', {
                    params: {
                        pagina, limite: 20,
                        ...Object.fromEntries(Object.entries(filtros).map(
                            ([chave, valor]) => [chave, valor || undefined]
                        ))
                    }
                });
                if (ativo) {
                    setRegistros(resposta.data.auditoria || []);
                    setTotalPaginas(Math.max(1, Number(resposta.data.totalPaginas) || 1));
                }
            } catch (error) {
                if (ativo) {
                    console.error('Erro ao carregar auditoria:', error);
                    setErro(error.response?.data?.mensagem ||
                        'Não foi possível carregar a auditoria.');
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        };
        carregarAuditoria();
        return () => { ativo = false; };
    }, [pagina, filtros]);

    useEffect(() => {
        let ativo = true;
        const carregarUsuarios = async () => {
            try {
                const resposta = await api.get('/auditoria/usuarios');
                if (ativo) setUsuarios(resposta.data.usuarios || []);
            } catch (error) {
                console.error('Erro ao carregar usuários da auditoria:', error);
            }
        };
        carregarUsuarios();
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        let ativo = true;
        setEquipamentoSelecionado(null);
        setBuscandoEquipamento(false);
        if (!registroSelecionado) return undefined;

        const carregarEquipamento = async () => {
            const dados = interpretarValor(registroSelecionado.valor_novo);
            let equipamentoId = dados && typeof dados === 'object'
                ? dados.equipamento_id : null;

            if (registroSelecionado.entidade === 'EQUIPAMENTO') {
                equipamentoId = registroSelecionado.registro_id || dados?.id;
            }

            // Em alterações de manutenção, valor_novo costuma ser apenas
            // o valor do campo. Nesse caso, localizamos a manutenção pelo ID.
            if (!equipamentoId && registroSelecionado.entidade === 'MANUTENCAO') {
                try {
                    setBuscandoEquipamento(true);
                    const resposta = await api.get('/manutencoes');
                    const manutencoes = resposta.data.manutencoes || [];
                    const manutencao = manutencoes.find((item) =>
                        Number(item.id) === Number(registroSelecionado.registro_id)
                    );
                    equipamentoId = manutencao?.equipamento_id;
                } catch (error) {
                    console.error('Erro ao consultar manutenção:', error);
                }
            }


            if (registroSelecionado.entidade === 'QUALIFICACAO') {
                const resposta = await api.get('/qualificacoes');

                const qualificacao = resposta.data.qualificacoes.find(
                    (item) =>
                        Number(item.id) ===
                        Number(registroSelecionado.registro_id)
                );

                if (!qualificacao) {
                    console.warn(
                        'Qualificação não encontrada:',
                        registroSelecionado.registro_id
                    );
                    return;
                }

                equipamentoId = qualificacao.equipamento_id;
            }


            if (registroSelecionado.entidade === 'OPERACIONAL') {
                const resposta = await api.get('/operacionais');

                const operacional = resposta.data.operacionais.find(
                    (item) =>
                        Number(item.id) ===
                        Number(registroSelecionado.registro_id)
                );

                if (!operacional) {
                    console.warn(
                        'Registro operacional não encontrado:',
                        registroSelecionado.registro_id
                    );
                    return;
                }

                equipamentoId = operacional.equipamento_id;
            }


            if (registroSelecionado.entidade === 'REGULATORIO') {
                const resposta = await api.get('/regulatorios');

                const regulatorio = resposta.data.regulatorios.find(
                    (item) =>
                        Number(item.id) ===
                        Number(registroSelecionado.registro_id)
                );

                if (!regulatorio) {
                    console.warn(
                        'Registro regulatório não encontrado:',
                        registroSelecionado.registro_id
                    );
                    return;
                }

                equipamentoId = regulatorio.equipamento_id;
            }

            if (!equipamentoId || !ativo) {
                if (ativo) setBuscandoEquipamento(false);
                return;
            }

            try {
                setBuscandoEquipamento(true);
                const resposta = await api.get(`/equipamentos/${equipamentoId}`);
                if (ativo) setEquipamentoSelecionado(resposta.data);
            } catch (error) {
                console.error('Erro ao buscar equipamento:', error);
            } finally {
                if (ativo) setBuscandoEquipamento(false);
            }
        };
        carregarEquipamento();
        return () => { ativo = false; };
    }, [registroSelecionado]);

    const atualizarFiltro = (campo, valor) => {
        setPagina(1);
        setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    };

    const nomeEquipamentoHistorico = dadosSelecionados?.equipamento_codigo &&
        dadosSelecionados?.equipamento_nome
        ? `${dadosSelecionados.equipamento_codigo} - ${dadosSelecionados.equipamento_nome}`
        : null;
    const nomeEquipamentoAtual = equipamentoSelecionado?.codigo &&
        equipamentoSelecionado?.nome
        ? `${equipamentoSelecionado.codigo} - ${equipamentoSelecionado.nome}`
        : null;
    const identificacaoEquipamento = nomeEquipamentoHistorico ||
        (buscandoEquipamento ? 'Consultando equipamento...' :
            nomeEquipamentoAtual ? `${nomeEquipamentoAtual} (cadastro atual)` :
                dadosSelecionados?.equipamento_id
                    ? `ID ${dadosSelecionados.equipamento_id}` : 'Não disponível');

    return (
        <div>
            <h2>Histórico</h2>
            <p>Histórico de alterações do sistema.</p>

            <div className="filtros-auditoria">
                <div className="filtro">
                    <label htmlFor="filtro-usuario">Usuário</label>
                    <select id="filtro-usuario" value={filtros.usuario_id}
                        onChange={(e) => atualizarFiltro('usuario_id', e.target.value)}>
                        <option value="">Todos</option>
                        {usuarios.map((usuario) => (
                            <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro">
                    <label htmlFor="filtro-acao">Ação</label>
                    <select id="filtro-acao" value={filtros.acao}
                        onChange={(e) => atualizarFiltro('acao', e.target.value)}>
                        <option value="">Todas</option>
                        <option value="CRIACAO">Criação</option>
                        <option value="ALTERACAO">Alteração</option>
                    </select>
                </div>
                <div className="filtro">
                    <label htmlFor="filtro-entidade">Entidade</label>
                    <select id="filtro-entidade" value={filtros.entidade}
                        onChange={(e) => atualizarFiltro('entidade', e.target.value)}>
                        <option value="">Todas</option>
                        <option value="EQUIPAMENTO">Equipamento</option>
                        <option value="MANUTENCAO">Manutenção</option>
                        <option value="QUALIFICACAO">Qualificação</option>
                        <option value="OPERACIONAL">Operacional</option>
                        <option value="REGULATORIO">Regulatório</option>
                    </select>
                </div>
                <div className="filtro">
                    <label htmlFor="filtro-registro">Registro</label>
                    <input id="filtro-registro" type="number" min="1"
                        value={filtros.registro_id} placeholder="ID do registro"
                        onChange={(e) => atualizarFiltro('registro_id', e.target.value)} />
                </div>
                <div className="filtro">
                    <label htmlFor="filtro-data-inicio">Data inicial</label>
                    <input id="filtro-data-inicio" type="date" value={filtros.data_inicio}
                        onChange={(e) => atualizarFiltro('data_inicio', e.target.value)} />
                </div>
                <div className="filtro">
                    <label htmlFor="filtro-data-fim">Data final</label>
                    <input id="filtro-data-fim" type="date" value={filtros.data_fim}
                        onChange={(e) => atualizarFiltro('data_fim', e.target.value)} />
                </div>
                <button type="button" className="botao-limpar-filtros"
                    onClick={() => { setPagina(1); setFiltros({ ...FILTROS_INICIAIS }); }}>
                    Limpar filtros
                </button>
            </div>

            {carregando && <p>Carregando registros de auditoria...</p>}
            {erro && <p role="alert">{erro}</p>}
            {!carregando && !erro && (
                <div className="auditoria-tabela-container">
                    <table className="auditoria-tabela">
                        <thead>
                            <tr>
                                <th>Data/Hora</th><th>Usuário</th><th>Ação</th>
                                <th>Entidade</th><th>Registro</th><th>Campo</th>
                                <th>Valor anterior</th><th>Valor novo</th><th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.length === 0 ? (
                                <tr><td colSpan={9}>Nenhum registro encontrado.</td></tr>
                            ) : registros.map((registro) => (
                                <tr key={registro.id}>
                                    <td>{formatarDataHora(registro.data_hora)}</td>
                                    <td>{registro.usuario_nome}</td>
                                    <td>{registro.acao}</td>
                                    <td>{registro.entidade}</td>
                                    <td>{registro.registro_id ?? '-'}</td>
                                    <td>{nomeCampo(registro.entidade, registro.campo)}</td>
                                    <td>{formatarResumo(registro, registro.valor_anterior)}</td>
                                    <td>{formatarResumo(registro, registro.valor_novo)}</td>
                                    <td><button className="auditoria-botao-detalhes" type="button"
                                        onClick={() => setRegistroSelecionado(registro)}>
                                        Ver detalhes
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!carregando && !erro && (
                <div className="paginacao">
                    <button type="button" disabled={pagina <= 1}
                        onClick={() => setPagina((atual) => Math.max(1, atual - 1))}>
                        ← Anterior
                    </button>
                    <span>Página {pagina} de {totalPaginas}</span>
                    <button type="button" disabled={pagina >= totalPaginas}
                        onClick={() => setPagina((atual) => atual + 1)}>
                        Próxima →
                    </button>
                </div>
            )}

            {registroSelecionado && (
                <div className="modal-overlay">
                    <div className="modal" role="dialog" aria-modal="true"
                        aria-label="Detalhes da auditoria">
                        <h3>Detalhes da auditoria</h3>
                        <p><strong>Data/Hora:</strong>{' '}
                            {formatarDataHora(registroSelecionado.data_hora)}</p>
                        <p><strong>Usuário:</strong> {registroSelecionado.usuario_nome}</p>
                        <p><strong>Ação:</strong> {registroSelecionado.acao}</p>
                        <p><strong>Entidade:</strong> {registroSelecionado.entidade}</p>
                        <p><strong>Registro:</strong> {registroSelecionado.registro_id ?? '-'}</p>
                        <p><strong>Campo:</strong>{' '}
                            {nomeCampo(registroSelecionado.entidade, registroSelecionado.campo)}</p>
                        <p><strong>Valor anterior:</strong>{' '}
                            {registroSelecionado.acao === 'CRIACAO' ? '-' :
                                formatarValorAuditoria(registroSelecionado.campo,
                                    registroSelecionado.valor_anterior)}</p>
                        <p><strong>Valor novo:</strong>{' '}
                            {registroSelecionado.acao === 'CRIACAO' && dadosSelecionados
                                ? 'Registro criado'
                                : formatarValorAuditoria(registroSelecionado.campo,
                                    registroSelecionado.valor_novo)}</p>

                        {registroSelecionado.entidade !== 'EQUIPAMENTO' &&
                            CAMPOS[registroSelecionado.entidade] && (
                                <p><strong>Equipamento:</strong> {identificacaoEquipamento}</p>
                            )}

                        {dadosSelecionados && CAMPOS[registroSelecionado.entidade] && (
                            <div>
                                <strong>Dados {registroSelecionado.entidade === 'EQUIPAMENTO'
                                    ? 'do equipamento'
                                    : registroSelecionado.entidade === 'MANUTENCAO'
                                        ? 'da manutenção'
                                        : registroSelecionado.entidade === 'QUALIFICACAO'
                                            ? 'da qualificação'
                                            : registroSelecionado.entidade === 'OPERACIONAL'
                                                ? 'operacionais' : 'regulatórios'}:</strong>
                                {CAMPOS[registroSelecionado.entidade].map(([campo, rotulo]) => (
                                    <p key={campo}><strong>{rotulo}:</strong>{' '}
                                        {formatarValorAuditoria(campo, dadosSelecionados[campo])}</p>
                                ))}
                            </div>
                        )}
                        <button type="button"
                            onClick={() => setRegistroSelecionado(null)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Auditoria;
