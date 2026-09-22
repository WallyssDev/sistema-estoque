import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function MainLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-area">
                <Header />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;