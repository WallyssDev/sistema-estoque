import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import '../styles/usuarios.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const timerMensagemSucesso = useRef(null);
    const timerMensagemErro = useRef(null);

    const mostrarMensagemSucesso = (mensagem) => {
        if (timerMensagemSucesso.current) {
            clearTimeout(timerMensagemSucesso.current);
        }

        setMensagemSucesso(mensagem);

        timerMensagemSucesso.current = setTimeout(() => {
            setMensagemSucesso('');
            timerMensagemSucesso.current = null;
        }, 3000);
    };

    const mostrarMensagemErro = (mensagem) => {
        if (timerMensagemErro.current) {
            clearTimeout(timerMensagemErro.current);
        }

        setMensagemErro(mensagem);

        timerMensagemErro.current = setTimeout(() => {
            setMensagemErro('');
            timerMensagemErro.current = null;
        }, 3000);
    };

    const [formularioAberto, setFormularioAberto] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('LEITOR');

    const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
    const [usuarioSenha, setUsuarioSenha] = useState(null);
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [modalStatusAberto, setModalStatusAberto] = useState(false);
    const [usuarioStatus, setUsuarioStatus] = useState(null);

    const carregarUsuarios = async () => {
        try {
            setCarregando(true);
            setMensagemErro('');

            const resposta = await api.get('/usuarios');

            setUsuarios(resposta.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);

            mostrarMensagemErro(
                error.response?.data?.mensagem ||
                'Não foi possível carregar os usuários.'
            );
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    useEffect(() => {
        return () => {
            if (timerMensagemSucesso.current) {
                clearTimeout(timerMensagemSucesso.current);
            }

            if (timerMensagemErro.current) {
                clearTimeout(timerMensagemErro.current);
            }
        };
    }, []);

    const limparFormulario = () => {
        setNome('');
        setEmail('');
        setSenha('');
        setPerfil('LEITOR');
        setUsuarioEditandoId(null);
        setModoEdicao(false);
    };

    const abrirFormulario = () => {
        setMensagemErro('');
        setMensagemSucesso('');

        fecharAlteracaoSenha();
        limparFormulario();

        setFormularioAberto(true);
    };

    const fecharFormulario = () => {
        limparFormulario();
        setFormularioAberto(false);
    };

    const abrirEdicao = (usuario) => {
        setMensagemErro('');
        setMensagemSucesso('');

        fecharAlteracaoSenha();

        setNome(usuario.nome);
        setEmail(usuario.email);
        setPerfil(usuario.perfil);

        setSenha('');

        setUsuarioEditandoId(usuario.id);
        setModoEdicao(true);
        setFormularioAberto(true);
    };

    const handleCriarUsuario = async () => {
        await api.post('/usuarios', {
            nome,
            email,
            senha,
            perfil
        });

        mostrarMensagemSucesso('Usuário criado com sucesso.');

        fecharFormulario();

        await carregarUsuarios();
    };

    const handleAtualizarUsuario = async () => {
        await api.put(`/usuarios/${usuarioEditandoId}`, {
            nome,
            email,
            perfil
        });

        mostrarMensagemSucesso('Usuário atualizado com sucesso.');

        fecharFormulario();

        await carregarUsuarios();
    };

    const abrirAlteracaoSenha = (usuario) => {
        setMensagemErro('');
        setMensagemSucesso('');

        fecharFormulario();

        setUsuarioSenha(usuario);
        setNovaSenha('');
        setConfirmarSenha('');

        setAlterarSenhaAberto(true);
    };
    const fecharAlteracaoSenha = () => {
        setUsuarioSenha(null);
        setNovaSenha('');
        setConfirmarSenha('');
        setAlterarSenhaAberto(false);
    };

    const handleAlterarSenha = async (event) => {
        event.preventDefault();

        setMensagemErro('');
        setMensagemSucesso('');

        if (novaSenha.length < 8) {
            setMensagemErro(
                'A nova senha deve possuir pelo menos 8 caracteres.'
            );

            return;
        }

        if (novaSenha !== confirmarSenha) {
            setMensagemErro(
                'A nova senha e a confirmação não coincidem.'
            );

            return;
        }

        try {
            await api.patch(
                `/usuarios/${usuarioSenha.id}/senha`,
                {
                    novaSenha
                }
            );

            mostrarMensagemSucesso(
                'Senha alterada com sucesso.'
            );

            fecharAlteracaoSenha();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);

            mostrarMensagemErro(
                error.response?.data?.mensagem ||
                'Não foi possível salvar o usuário.'
            );
        }
    };

    const abrirModalStatus = (usuario) => {
        setMensagemErro('');
        setMensagemSucesso('');

        setUsuarioStatus(usuario);
        setModalStatusAberto(true);
    };

    const fecharModalStatus = () => {
        setUsuarioStatus(null);
        setModalStatusAberto(false);
    };

    const confirmarAlteracaoStatus = async () => {
        if (!usuarioStatus) {
            return;
        }

        try {
            setMensagemErro('');
            setMensagemSucesso('');

            const endpoint = usuarioStatus.ativo
                ? `/usuarios/${usuarioStatus.id}/desativar`
                : `/usuarios/${usuarioStatus.id}/reativar`;

            const resposta = await api.patch(endpoint);

            mostrarMensagemSucesso(
                resposta.data.mensagem ||
                (
                    usuarioStatus.ativo
                        ? 'Usuário desativado com sucesso.'
                        : 'Usuário reativado com sucesso.'
                )
            );

            fecharModalStatus();

            await carregarUsuarios();
        } catch (error) {
            console.error(
                'Erro ao alterar status do usuário:',
                error
            );

            mostrarMensagemErro(
                error.response?.data?.mensagem ||
                'Não foi possível alterar o status do usuário.'
            );

            fecharModalStatus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setMensagemErro('');
            setMensagemSucesso('');

            if (modoEdicao) {
                await handleAtualizarUsuario();
            } else {
                await handleCriarUsuario();
            }
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);

            mostrarMensagemErro(
                error.response?.data?.mensagem ||
                'Não foi possível salvar o usuário.'
            );
        }
    };

    const formatarData = (data) => {
        if (!data) {
            return '-';
        }

        return new Date(data).toLocaleString('pt-BR');
    };

    return (
        <div className="usuarios-page">

            <div className="usuarios-header">
                <div>
                    <h2>Usuários</h2>

                    <p>
                        Gerencie os usuários e permissões do sistema.
                    </p>
                </div>

                <button
                    type="button"
                    className="usuarios-botao-novo"
                    onClick={abrirFormulario}
                >
                    + Novo usuário
                </button>
            </div>

            {mensagemSucesso && (
                <div className="usuarios-mensagem usuarios-mensagem-sucesso">
                    {mensagemSucesso}
                </div>
            )}

            {mensagemErro && (
                <div className="usuarios-mensagem usuarios-mensagem-erro">
                    {mensagemErro}
                </div>
            )}

            {formularioAberto && (
                <form
                    className="usuarios-formulario"
                    onSubmit={handleSubmit}
                >
                    <div className="usuarios-formulario-header">
                        <h3>
                            {modoEdicao
                                ? 'Editar usuário'
                                : 'Novo usuário'}
                        </h3>
                    </div>

                    <div className="usuarios-formulario-grid">

                        <div className="usuarios-campo">
                            <label htmlFor="nome">
                                Nome
                            </label>

                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(event) =>
                                    setNome(event.target.value)
                                }
                                placeholder="Digite o nome"
                                required
                            />
                        </div>

                        <div className="usuarios-campo">
                            <label htmlFor="email">
                                E-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Digite o e-mail"
                                required
                            />
                        </div>

                        {!modoEdicao && (
                            <div className="usuarios-campo">
                                <label htmlFor="senha">
                                    Senha
                                </label>

                                <input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(event) =>
                                        setSenha(event.target.value)
                                    }
                                    placeholder="Mínimo de 8 caracteres"
                                    minLength="8"
                                    required
                                />
                            </div>
                        )}

                        <div className="usuarios-campo">
                            <label htmlFor="perfil">
                                Perfil
                            </label>

                            <select
                                id="perfil"
                                value={perfil}
                                onChange={(event) =>
                                    setPerfil(event.target.value)
                                }
                            >
                                <option value="ADMIN">
                                    ADMIN
                                </option>

                                <option value="EDITOR">
                                    EDITOR
                                </option>

                                <option value="LEITOR">
                                    LEITOR
                                </option>
                            </select>
                        </div>

                    </div>

                    <div className="usuarios-formulario-acoes">

                        <button
                            type="button"
                            className="usuarios-botao-cancelar"
                            onClick={fecharFormulario}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="usuarios-botao-salvar"
                        >
                            {modoEdicao
                                ? 'Salvar alterações'
                                : 'Salvar usuário'}
                        </button>

                    </div>
                </form>
            )}

            {alterarSenhaAberto && usuarioSenha && (
                <form
                    className="usuarios-formulario usuarios-formulario-senha"
                    onSubmit={handleAlterarSenha}
                >
                    <div className="usuarios-formulario-header">
                        <h3>Alterar senha</h3>

                        <p>
                            Usuário: <strong>{usuarioSenha.nome}</strong>
                        </p>
                    </div>

                    <div className="usuarios-formulario-grid">

                        <div className="usuarios-campo">
                            <label htmlFor="novaSenha">
                                Nova senha
                            </label>

                            <input
                                id="novaSenha"
                                type="password"
                                value={novaSenha}
                                onChange={(event) =>
                                    setNovaSenha(event.target.value)
                                }
                                placeholder="Mínimo de 8 caracteres"
                                minLength="8"
                                required
                            />
                        </div>

                        <div className="usuarios-campo">
                            <label htmlFor="confirmarSenha">
                                Confirmar nova senha
                            </label>

                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(event) =>
                                    setConfirmarSenha(event.target.value)
                                }
                                placeholder="Digite a senha novamente"
                                minLength="8"
                                required
                            />
                        </div>

                    </div>

                    <div className="usuarios-formulario-acoes">

                        <button
                            type="button"
                            className="usuarios-botao-cancelar"
                            onClick={fecharAlteracaoSenha}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="usuarios-botao-salvar"
                        >
                            Alterar senha
                        </button>

                    </div>
                </form>
            )}

            {modalStatusAberto && usuarioStatus && (
                <div className="usuarios-modal-overlay">
                    <div
                        className="usuarios-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="usuarios-modal-titulo"
                    >
                        <div className="usuarios-modal-icone">
                            {usuarioStatus.ativo ? '!' : '✓'}
                        </div>

                        <h3 id="usuarios-modal-titulo">
                            {usuarioStatus.ativo
                                ? 'Desativar usuário'
                                : 'Reativar usuário'}
                        </h3>

                        <p>
                            {usuarioStatus.ativo
                                ? `Tem certeza que deseja desativar o usuário "${usuarioStatus.nome}"?`
                                : `Deseja reativar o usuário "${usuarioStatus.nome}"?`}
                        </p>

                        <div className="usuarios-modal-acoes">

                            <button
                                type="button"
                                className="usuarios-modal-cancelar"
                                onClick={fecharModalStatus}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={
                                    usuarioStatus.ativo
                                        ? 'usuarios-modal-confirmar usuarios-modal-desativar'
                                        : 'usuarios-modal-confirmar usuarios-modal-reativar'
                                }
                                onClick={confirmarAlteracaoStatus}
                            >
                                {usuarioStatus.ativo
                                    ? 'Desativar'
                                    : 'Reativar'}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {carregando ? (
                <div className="usuarios-carregando">
                    Carregando usuários...
                </div>
            ) : (
                <div className="usuarios-tabela-container">

                    <table className="usuarios-tabela">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Perfil</th>
                                <th>Status</th>
                                <th>Criado em</th>
                                <th>Atualizado em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>

                            {usuarios.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="usuarios-sem-registros"
                                    >
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>

                            ) : (

                                usuarios.map((usuario) => (

                                    <tr key={usuario.id}>

                                        <td>
                                            {usuario.id}
                                        </td>

                                        <td>
                                            {usuario.nome}
                                        </td>

                                        <td>
                                            {usuario.email}
                                        </td>

                                        <td>
                                            <span className="usuarios-perfil">
                                                {usuario.perfil}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    usuario.ativo
                                                        ? 'usuarios-status usuarios-status-ativo'
                                                        : 'usuarios-status usuarios-status-inativo'
                                                }
                                            >
                                                {usuario.ativo
                                                    ? 'Ativo'
                                                    : 'Inativo'}
                                            </span>
                                        </td>

                                        <td>
                                            {formatarData(
                                                usuario.created_at
                                            )}
                                        </td>

                                        <td>
                                            {formatarData(
                                                usuario.updated_at
                                            )}
                                        </td>

                                        <td>
                                            <div className="usuarios-acoes">

                                                <button
                                                    type="button"
                                                    className="usuarios-botao-editar"
                                                    onClick={() =>
                                                        abrirEdicao(usuario)
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="usuarios-botao-senha"
                                                    onClick={() =>
                                                        abrirAlteracaoSenha(
                                                            usuario
                                                        )
                                                    }
                                                >
                                                    Alterar senha
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        usuario.ativo
                                                            ? 'usuarios-botao-desativar'
                                                            : 'usuarios-botao-reativar'
                                                    }
                                                    onClick={() =>
                                                        abrirModalStatus(
                                                            usuario
                                                        )
                                                    }
                                                >
                                                    {usuario.ativo
                                                        ? 'Desativar'
                                                        : 'Reativar'}
                                                </button>

                                            </div>
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

export default Usuarios;