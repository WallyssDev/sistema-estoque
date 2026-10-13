import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaTachometerAlt,
    FaBox,
    FaWrench,
    FaClipboardCheck,
    FaDatabase,
    FaFileAlt,
    FaHistory,
    FaUsers,
    FaChartBar,
} from 'react-icons/fa';

function BrandMark() {
    return (
        <span className="sidebar-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
                <path d="M8 14.5 24 6l16 8.5v19L24 42 8 33.5v-19Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="m8.5 14.8 15.5 8.7 15.5-8.7M24 23.5V41" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="m17 10 16 8.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </span>
    );
}

function Sidebar({ aberta, onFechar }) {
    const { usuario } = useAuth();
    const handleNavegacao = () => {
        if (onFechar) onFechar();
    };

    const links = [
        { to: '/dashboard', label: 'Dashboard', Icon: FaTachometerAlt },
        { to: '/equipamentos', label: 'Equipamentos', Icon: FaBox },
        { to: '/manutencoes', label: 'Manutenções', Icon: FaWrench },
        { to: '/qualificacoes', label: 'Qualificações', Icon: FaClipboardCheck },
        { to: '/operacional', label: 'Operacional', Icon: FaDatabase },
        { to: '/regulatorio', label: 'Regulatório', Icon: FaFileAlt },
        { to: '/auditoria', label: 'Histórico', Icon: FaHistory },
        ...(usuario?.perfil === 'ADMIN'
            ? [{ to: '/usuarios', label: 'Usuários', Icon: FaUsers }]
            : []),
        { to: '/relatorios', label: 'Relatórios', Icon: FaChartBar },
    ];

    return (
        <aside className={`sidebar nexora-sidebar ${aberta ? 'sidebar-aberta' : ''}`}>
            <div className="sidebar-logo nexora-sidebar-logo">
                <div className="sidebar-brand">
                    <BrandMark />
                    <div className="sidebar-brand-copy">
                        <h2>NEXORA</h2>
                        <span>Gestão de Equipamentos e Qualidade</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-menu nexora-sidebar-menu" aria-label="Navegação principal">
                {links.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={handleNavegacao}
                        className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer nexora-sidebar-footer">
                <span className="sidebar-footer-avatar" aria-hidden="true">
                    {(usuario?.nome || 'U').trim().charAt(0).toUpperCase()}
                </span>
                <div className="sidebar-footer-copy">
                    <span>{usuario?.nome || 'Usuário'}</span>
                    <small>{usuario?.perfil || 'LEITOR'}</small>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
