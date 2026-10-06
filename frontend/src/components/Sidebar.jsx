import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ aberta, onFechar }) {
    const { usuario } = useAuth();

    const handleNavegacao = () => {
        if (onFechar) {
            onFechar();
        }
    };

    return (
        <aside
            className={`sidebar ${aberta ? 'sidebar-aberta' : ''}`}
        >

            <div className="sidebar-logo">

                <h2>ESTOQUE</h2>

                <span>
                    Controle & Equipamentos
                </span>

            </div>

            <nav className="sidebar-menu">

                <NavLink
                    to="/dashboard"
                    onClick={handleNavegacao}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/equipamentos"
                    onClick={handleNavegacao}
                >
                    Equipamentos
                </NavLink>

                <NavLink
                    to="/manutencoes"
                    onClick={handleNavegacao}
                >
                    Manutenções
                </NavLink>

                <NavLink
                    to="/qualificacoes"
                    onClick={handleNavegacao}
                >
                    Qualificações
                </NavLink>

                <NavLink
                    to="/operacional"
                    onClick={handleNavegacao}
                >
                    Operacional
                </NavLink>

                <NavLink
                    to="/regulatorio"
                    onClick={handleNavegacao}
                >
                    Regulatório
                </NavLink>

                <NavLink
                    to="/auditoria"
                    onClick={handleNavegacao}
                >
                    Histórico
                </NavLink>

                {usuario?.perfil === 'ADMIN' && (
                    <NavLink
                        to="/usuarios"
                        onClick={handleNavegacao}
                    >
                        Usuários
                    </NavLink>
                )}

                <NavLink
                    to="/relatorios"
                    onClick={handleNavegacao}
                >
                    Relatórios
                </NavLink>

            </nav>

            <div className="sidebar-footer">

                <span>
                    {usuario?.nome}
                </span>

                <small>
                    {usuario?.perfil}
                </small>

            </div>

        </aside>
    );
}

export default Sidebar;