const pool = require('../database/connection');
const bcrypt = require('bcrypt');

const listarUsuarios = async () => {
    const resultado = await pool.query(`
        SELECT
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at,
            updated_at
        FROM usuarios
        ORDER BY id
    `);

    return resultado.rows;
};

const criarUsuario = async (nome, email, senha, perfil) => {
    if (!nome || !email || !senha || !perfil) {
        throw new Error('Todos os campos são obrigatórios');
    }

    nome = nome.trim();
    email = email.trim().toLowerCase();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
        throw new Error('Informe um email válido');
    }

    const perfisPermitidos = ['ADMIN', 'EDITOR', 'LEITOR'];

    if (!perfisPermitidos.includes(perfil)) {
        throw new Error('Perfil inválido');
    }

    if (senha.length < 8) {
        throw new Error('A senha deve possuir pelo menos 8 caracteres');
    }

    const usuarioExistente = await pool.query(
     'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
        throw new Error('Este email já está cadastrado');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
        `
        INSERT INTO usuarios (nome, email, senha, perfil)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at
        `,
        [nome, email, senhaHash, perfil]
    );

    return resultado.rows[0];
};

module.exports = {
    listarUsuarios,
    criarUsuario
};