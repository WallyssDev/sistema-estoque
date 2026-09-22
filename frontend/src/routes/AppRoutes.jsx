import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Equipamentos from '../pages/Equipamentos';
import Manutencoes from '../pages/Manutencoes';
import Qualificacoes from '../pages/Qualificacoes';
import Operacional from '../pages/Operacional';
import Regulatorio from '../pages/Regulatorio';
import Auditoria from '../pages/Auditoria';
import Usuarios from '../pages/Usuarios';
import Relatorios from '../pages/Relatorios';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

function AppRoutes() {
    return (
        <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/equipamentos"
                element={
                    <ProtectedRoute>
                        <Equipamentos />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/manutencoes"
                element={
                    <ProtectedRoute>
                        <Manutencoes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/qualificacoes"
                element={
                    <ProtectedRoute>
                        <Qualificacoes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/operacional"
                element={
                    <ProtectedRoute>
                        <Operacional />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/regulatorio"
                element={
                    <ProtectedRoute>
                        <Regulatorio />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/auditoria"
                element={
                    <ProtectedRoute>
                        <Auditoria />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <RoleRoute perfisPermitidos={['ADMIN']}>
                        <Usuarios />
                    </RoleRoute>
                }
            />

            <Route
                path="/relatorios"
                element={
                    <ProtectedRoute>
                        <Relatorios />
                    </ProtectedRoute>
                }
            />

            {/* Rota inicial */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;