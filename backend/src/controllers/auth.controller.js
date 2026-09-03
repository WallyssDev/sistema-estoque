const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const { gerarToken } = require('../utils/jwt');

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Email e senha são obrigatórios'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const resultado = await pool.query(
            `
            SELECT
                id,
                nome,
                email,
                senha,
                perfil,
                ativo
            FROM usuarios
            WHERE email = $1
            `,
            [emailNormalizado]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensagem: 'Email ou senha inválidos'
            });
        }

        const usuario = resultado.rows[0];

        if (!usuario.ativo) {
            return res.status(403).json({
                mensagem: 'Usuário inativo'
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'Email ou senha inválidos'
            });
        }

        const token = gerarToken(usuario);

        res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (error) {
        console.error('Erro ao realizar login:', error);

        res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    login
};