const jwt = require('jsonwebtoken');

const gerarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '8h'
        }
    );
};

module.exports = {
    gerarToken
};