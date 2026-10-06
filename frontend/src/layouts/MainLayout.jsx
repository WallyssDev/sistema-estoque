import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }) {
    const [menuAberto, setMenuAberto] = useState(false);

    const location = useLocation();

    const abrirFecharMenu = () => {
        setMenuAberto((estadoAtual) => !estadoAtual);
    };

    const fecharMenu = () => {
        setMenuAberto(false);
    };

    useEffect(() => {
        setMenuAberto(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                setMenuAberto(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener(
                'resize',
                handleResize
            );
        };
    }, []);

    return (
        <div className="app-layout">

            <Sidebar
                aberta={menuAberto}
                onFechar={fecharMenu}
            />

            {menuAberto && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={fecharMenu}
                    aria-label="Fechar menu"
                />
            )}

            <div className="main-area">

                <Header
                    onMenuToggle={abrirFecharMenu}
                    menuAberto={menuAberto}
                />

                <main className="main-content">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default MainLayout;