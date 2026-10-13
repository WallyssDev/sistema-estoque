import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

function Header({ onMenuToggle, menuAberto }) {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const nome = usuario?.nome || 'Usuário';
    const perfil = usuario?.perfil || 'LEITOR';
    const inicial = nome.trim().charAt(0).toUpperCase() || 'U';

    return (
        <header className="header nexora-header">
            <div className="header-left nexora-header-left">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuToggle}
                    aria-label={
                        menuAberto ? 'Fechar menu' : 'Abrir menu'
                    }
                    aria-expanded={menuAberto}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <div className="header-user nexora-header-user">
                <span
                    className="header-user-avatar"
                    aria-hidden="true"
                >
                    {inicial}
                </span>

                <div className="header-user-info nexora-user-info">
                    <strong>{nome}</strong>
                    <span className="header-user-role">
                        {perfil}
                    </span>
                </div>

                <span
                    className="header-user-divider"
                    aria-hidden="true"
                />

                <button
                    type="button"
                    onClick={handleLogout}
                    className="header-logout-button nexora-logout-button"
                >
                    <FaSignOutAlt aria-hidden="true" />
                    <span>Sair</span>
                </button>
            </div>
        </header>
    );
}

export default Header;