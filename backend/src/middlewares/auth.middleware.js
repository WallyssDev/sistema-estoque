const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                mensagem: 'Token de autenticação não informado'
            });
        }

        const partes = authorization.split(' ');

        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            return res.status(401).json({
                mensagem: 'Formato do token inválido'
            });
        }

        const token = partes[1];

        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = usuario;

        next();

    } catch (error) {
        console.error('Erro na autenticação:', error);

        return res.status(401).json({
            mensagem: 'Token inválido ou expirado'
        });
    }
};

module.exports = {
    autenticar
};