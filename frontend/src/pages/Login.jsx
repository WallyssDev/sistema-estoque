import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post('/auth/login', {
                email: email.trim(),
                senha
            });

            const { token, usuario } = resposta.data;

            login(usuario, token);
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                setErro(
                    error.response.data?.mensagem ||
                    'Não foi possível realizar o login. Confira seus dados e tente novamente.'
                );
            } else {
                setErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-brand-panel" aria-label="Apresentação do sistema">
                <div className="login-brand-content">
                    <div className="login-brand">
                        <div className="login-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 48 48" fill="none">
                                <path d="M8 14.5 24 6l16 8.5v19L24 42 8 33.5v-19Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <path d="m8.5 14.8 15.5 8.7 15.5-8.7M24 23.5V41" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <path d="m17 10 16 8.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="login-brand-name">NEXORA</span>
                            <span className="login-brand-caption">Gestão de Equipamentos e Qualidade</span>
                        </div>
                    </div>

                    <div className="login-brand-message">
                        <span className="login-eyebrow">GESTÃO • CONTROLE • QUALIDADE</span>
                        <h1>Controle e confiança em cada detalhe.</h1>
                        <p>
                            Centralize as informações dos seus equipamentos,
                            acompanhe a qualidade e mantenha tudo organizado em um só lugar.
                        </p>
                    </div>

                    <div className="login-brand-footer">
                        <span className="login-status-dot" />
                        Plataforma de gestão de equipamentos
                    </div>
                </div>

                <div className="login-decoration login-decoration-one" aria-hidden="true" />
                <div className="login-decoration login-decoration-two" aria-hidden="true" />
                <div className="login-decoration-grid" aria-hidden="true" />
            </section>

            <section className="login-form-panel">
                <div className="login-form-wrap">
                    <div className="login-mobile-brand">
                        <div className="login-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 48 48" fill="none">
                                <path d="M8 14.5 24 6l16 8.5v19L24 42 8 33.5v-19Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <path d="m8.5 14.8 15.5 8.7 15.5-8.7M24 23.5V41" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                                <path d="m17 10 16 8.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="login-brand-name">NEXORA</span>
                            <span className="login-brand-caption">Gestão de Equipamentos e Qualidade</span>
                        </div>
                    </div>

                    <div className="login-heading">
                        <span className="login-heading-label">ACESSO AO SISTEMA</span>
                        <h2>Bem-vindo de volta</h2>
                        <p>Entre com suas credenciais para continuar.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="login-email">E-mail</label>
                            <div className="login-input-wrap">
                                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="voce@empresa.com"
                                    autoComplete="username"
                                    required
                                    disabled={carregando}
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-senha">Senha</label>
                            <div className="login-input-wrap">
                                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                                <input
                                    id="login-senha"
                                    name="senha"
                                    type={mostrarSenha ? 'text' : 'password'}
                                    value={senha}
                                    onChange={(event) => setSenha(event.target.value)}
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                    required
                                    disabled={carregando}
                                />
                                <button
                                    className="login-toggle-password"
                                    type="button"
                                    onClick={() => setMostrarSenha((valor) => !valor)}
                                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                    aria-pressed={mostrarSenha}
                                    disabled={carregando}
                                >
                                    {mostrarSenha ? (
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.3 0 8.7 5.2 9.5 6.7a.7.7 0 0 1 0 .6 15 15 0 0 1-3.1 3.9M6.2 6.3A16 16 0 0 0 2.5 11.7a.7.7 0 0 0 0 .6C3.3 13.8 6.7 19 12 19c1.2 0 2.3-.3 3.3-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="login-error" role="alert">
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M12 7.5v5M12 16.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <p>{erro}</p>
                            </div>
                        )}

                        <button className="login-submit" type="submit" disabled={carregando}>
                            {carregando ? (
                                <>
                                    <span className="login-spinner" aria-hidden="true" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar no sistema
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-security-note">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 3 19 6v5.5c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Seu acesso é protegido e controlado por permissões.</span>
                    </div>

                    <footer className="login-footer">
                        Nexora <span>•</span> Gestão de equipamentos e qualidade
                    </footer>
                </div>
            </section>
        </main>
    );
}

export default Login;
