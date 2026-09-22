import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const { usuario } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>ESTOQUE</h2>
                <span>Controle & Equipamentos</span>
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/equipamentos">Equipamentos</NavLink>
                <NavLink to="/manutencoes">Manutenções</NavLink>
                <NavLink to="/qualificacoes">Qualificações</NavLink>
                <NavLink to="/operacional">Operacional</NavLink>
                <NavLink to="/regulatorio">Regulatório</NavLink>
                <NavLink to="/auditoria">Auditoria</NavLink>
                {usuario?.perfil === 'ADMIN' && (
                    <NavLink to="/usuarios">Usuários</NavLink>
                )}
                <NavLink to="/relatorios">Relatórios</NavLink>
            </nav>

            <div className="sidebar-footer">
                <span>{usuario?.nome}</span>
                <small>{usuario?.perfil}</small>
            </div>
        </aside>
    );
}

export default Sidebar;