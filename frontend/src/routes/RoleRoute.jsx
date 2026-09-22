import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ children, perfisPermitidos }) {
    const { usuario } = useAuth();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RoleRoute;