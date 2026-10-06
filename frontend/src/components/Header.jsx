import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header({ onMenuToggle, menuAberto }) {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">

            <div className="header-left">

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuToggle}
                    aria-label={
                        menuAberto
                            ? 'Fechar menu'
                            : 'Abrir menu'
                    }
                    aria-expanded={menuAberto}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className="header-title">

                    <h1 className="header-title-desktop">
                        Sistema de Controle de Estoque
                    </h1>

                    <h1 className="header-title-mobile">
                        Estoque
                    </h1>

                    <p>
                        Gestão de equipamentos e informações de qualidade
                    </p>

                </div>

            </div>

            <div className="header-user">

                <div className="header-user-info">
                    <strong>{usuario?.nome}</strong>
                    <span>{usuario?.perfil}</span>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="header-logout-button"
                >
                    Sair
                </button>

            </div>

        </header>
    );
}

export default Header;