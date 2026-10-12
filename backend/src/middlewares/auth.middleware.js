
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

const autenticar = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            mensagem: 'Token de autenticação não informado'
        });
    }

    const partes = authorization.split(' ');

    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer' ||
        !partes[1]
    ) {
        return res.status(401).json({
            mensagem: 'Formato do token inválido'
        });
    }

    let payload;

    try {
        payload = jwt.verify(
            partes[1],
            process.env.JWT_SECRET
        );
    } catch (error) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado'
        });
    }

    if (!payload.id) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado'
        });
    }

    try {
        // Consulta o estado atual do usuário no banco.
        const resultado = await pool.query(
            `
            SELECT id, nome, email, perfil, ativo
            FROM usuarios
            WHERE id = $1
            LIMIT 1
            `,
            [payload.id]
        );

        if (
            resultado.rows.length === 0 ||
            resultado.rows[0].ativo !== true
        ) {
            return res.status(401).json({
                mensagem:
                    'Usuário inexistente ou inativo. Faça login novamente.'
            });
        }

        const usuario = resultado.rows[0];

        // Utiliza os dados atuais do banco, não o perfil antigo do token.
        req.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        };

        return next();
    } catch (error) {
        console.error(
            'Erro ao validar usuário autenticado:',
            error
        );

        return res.status(500).json({
            mensagem:
                'Não foi possível validar a autenticação no momento'
        });
    }
};

module.exports = {
    autenticar
};
