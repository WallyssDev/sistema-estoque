import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const usuarioSalvo = localStorage.getItem('usuario');

        return usuarioSalvo
            ? JSON.parse(usuarioSalvo)
            : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token');
    });

    const login = (dadosUsuario, tokenRecebido) => {
        setUsuario(dadosUsuario);
        setToken(tokenRecebido);

        localStorage.setItem(
            'usuario',
            JSON.stringify(dadosUsuario)
        );

        localStorage.setItem(
            'token',
            tokenRecebido
        );
    };

    const logout = () => {
        setUsuario(null);
        setToken(null);

        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}