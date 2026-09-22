import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post('/auth/login', {
                email,
                senha
            });

            const { token, usuario } = resposta.data;

            login(usuario, token);

            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                setErro(
                    error.response.data?.mensagem ||
                    'Não foi possível realizar o login.'
                );
            } else {
                setErro(
                    'Não foi possível conectar ao servidor.'
                );
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Digite seu e-mail"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder="Digite sua senha"
                        required
                    />
                </div>

                {erro && (
                    <p>{erro}</p>
                )}

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}

export default Login;