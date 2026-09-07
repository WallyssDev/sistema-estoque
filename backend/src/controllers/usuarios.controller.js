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

const buscarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do usuário inválido'
            });
        }

        const resultado = await usuariosService.buscarUsuarioPorId(id);

        if (!resultado) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado'
            });
        }

        return res.status(200).json(resultado);

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, perfil } = req.body;

        const usuario = await usuariosService.atualizarUsuario(
            id,
            nome,
            email,
            perfil
        );

        return res.status(200).json(usuario);

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

const desativarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuariosService.desativarUsuario(
            id,
            req.usuario.id
        );

        return res.status(200).json({
            mensagem: 'Usuário desativado com sucesso',
            usuario
        });

    } catch (error) {
        console.error('Erro ao desativar usuário:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

const reativarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuariosService.reativarUsuario(id);

        return res.status(200).json({
            mensagem: 'Usuário reativado com sucesso',
            usuario
        });

    } catch (error) {
        console.error('Erro ao reativar usuário:', error);

        return res.status(400).json({
            mensagem: error.message
        });
    }
};

module.exports = {
    listarUsuarios,
    criarUsuario,
    buscarUsuarioPorId,
    atualizarUsuario,
    desativarUsuario,
    reativarUsuario
};