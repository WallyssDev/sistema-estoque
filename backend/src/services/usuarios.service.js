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

const buscarUsuarioPorId = async (id) => {
    const resultado = await pool.query(
        `
        SELECT
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at,
            updated_at
        FROM usuarios
        WHERE id = $1
        `,
        [id]
    );

    if (resultado.rows.length === 0) {
        return null;
    }

    return resultado.rows[0];
};

const atualizarUsuario = async (id, nome, email, perfil) => {
    if (!id || isNaN(id)) {
        throw new Error('ID do usuário inválido');
    }

    if (!nome || !email || !perfil) {
        throw new Error('Nome, email e perfil são obrigatórios');
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

    const usuarioExistente = await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE id = $1
        `,
        [id]
    );

    if (usuarioExistente.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }

    const emailEmUso = await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE email = $1
          AND id <> $2
        `,
        [email, id]
    );

    if (emailEmUso.rows.length > 0) {
        throw new Error('Este email já está cadastrado');
    }

    const resultado = await pool.query(
        `
        UPDATE usuarios
        SET
            nome = $1,
            email = $2,
            perfil = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at,
            updated_at
        `,
        [nome, email, perfil, id]
    );

    return resultado.rows[0];
};

const desativarUsuario = async (id, usuarioLogadoId) => {
    if (!id || isNaN(id)) {
        throw new Error('ID do usuário inválido');
    }

    if (Number(id) === Number(usuarioLogadoId)) {
        throw new Error('Você não pode desativar o próprio usuário');
    }

    const resultado = await pool.query(
        `
        UPDATE usuarios
        SET
            ativo = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND ativo = true
        RETURNING
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at,
            updated_at
        `,
        [id]
    );

    if (resultado.rows.length === 0) {
        throw new Error('Usuário não encontrado ou já está desativado');
    }

    return resultado.rows[0];
};

const reativarUsuario = async (id) => {
    if (!id || isNaN(id)) {
        throw new Error('ID do usuário inválido');
    }

    const resultado = await pool.query(
        `
        UPDATE usuarios
        SET
            ativo = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND ativo = false
        RETURNING
            id,
            nome,
            email,
            perfil,
            ativo,
            created_at,
            updated_at
        `,
        [id]
    );

    if (resultado.rows.length === 0) {
        throw new Error('Usuário não encontrado ou já está ativo');
    }

    return resultado.rows[0];
};

module.exports = {
    listarUsuarios,
    criarUsuario,
    buscarUsuarioPorId,
    atualizarUsuario,
    desativarUsuario,
    reativarUsuario
};