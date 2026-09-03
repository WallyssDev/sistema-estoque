const usuariosService = require('../services/usuarios.service');

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await usuariosService.listarUsuarios();

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);

        res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

const criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        const usuario = await usuariosService.criarUsuario(
            nome,
            email,
            senha,
            perfil
        );

        res.status(201).json(usuario);

    } catch (error) {
        console.error('Erro ao criar usuário:', error);

        res.status(400).json({
            mensagem: error.message
        });
    }
};

module.exports = {
    listarUsuarios,
    criarUsuario
};