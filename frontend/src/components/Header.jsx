import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div>
                <h1>Sistema de Controle de Estoque</h1>
                <p>Gestão de equipamentos e informações de qualidade</p>
            </div>

            <div className="header-user">
                <div>
                    <strong>{usuario?.nome}</strong>
                    <span>{usuario?.perfil}</span>
                </div>

                <button onClick={handleLogout}>
                    Sair
                </button>
            </div>
        </header>
    );
}

export default Header;