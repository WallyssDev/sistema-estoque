const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const { registrarAuditoria } = require('./auditoria.service');

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

const criarUsuario = async (nome, email, senha, perfil, usuarioLogadoId) => {

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

    let client;

    try {

        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
            `
            INSERT INTO usuarios (
                nome,
                email,
                senha,
                perfil
            )
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

        const usuarioCriado = resultado.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'CRIACAO',
            entidade: 'USUARIO',
            registroId: usuarioCriado.id,
            valorNovo: JSON.stringify(usuarioCriado),
            db: client
        });

        await client.query('COMMIT');

        return usuarioCriado;

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        throw error;

    } finally {

        if (client) {
            client.release();
        }
    }
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

const atualizarUsuario = async (id, nome, email, perfil, usuarioLogadoId) => {

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
        SELECT
            id,
            nome,
            email,
            perfil
        FROM usuarios
        WHERE id = $1
        `,
        [id]
    );

    if (usuarioExistente.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }

    const usuarioAnterior = usuarioExistente.rows[0];

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

    let client;

    try {

        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
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

        const usuarioAtualizado = resultado.rows[0];

        const camposAlterados = [
            {
                campo: 'nome',
                anterior: usuarioAnterior.nome,
                novo: usuarioAtualizado.nome
            },
            {
                campo: 'email',
                anterior: usuarioAnterior.email,
                novo: usuarioAtualizado.email
            },
            {
                campo: 'perfil',
                anterior: usuarioAnterior.perfil,
                novo: usuarioAtualizado.perfil
            }
        ];

        for (const alteracao of camposAlterados) {

            if (alteracao.anterior !== alteracao.novo) {

                await registrarAuditoria({
                    usuarioId: usuarioLogadoId,
                    acao: 'ALTERACAO',
                    entidade: 'USUARIO',
                    registroId: Number(id),
                    campo: alteracao.campo,
                    valorAnterior: alteracao.anterior,
                    valorNovo: alteracao.novo,
                    db: client
                });

            }
        }

        await client.query('COMMIT');

        return usuarioAtualizado;

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        throw error;

    } finally {

        if (client) {
            client.release();
        }
    }
};

const desativarUsuario = async (id, usuarioLogadoId) => {

    if (!id || isNaN(id)) {
        throw new Error('ID do usuário inválido');
    }

    if (Number(id) === Number(usuarioLogadoId)) {
        throw new Error('Você não pode desativar o próprio usuário');
    }

    let client;

    try {

        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
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
            throw new Error(
                'Usuário não encontrado ou já está desativado'
            );
        }

        const usuarioDesativado = resultado.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'DESATIVACAO',
            entidade: 'USUARIO',
            registroId: Number(id),
            campo: 'ativo',
            valorAnterior: 'true',
            valorNovo: 'false',
            db: client
        });

        await client.query('COMMIT');

        return usuarioDesativado;

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        throw error;

    } finally {

        if (client) {
            client.release();
        }
    }
};

const reativarUsuario = async (id, usuarioLogadoId) => {

    if (!id || isNaN(id)) {
        throw new Error('ID do usuário inválido');
    }

    let client;

    try {

        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
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
            throw new Error(
                'Usuário não encontrado ou já está ativo'
            );
        }

        const usuarioReativado = resultado.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'REATIVACAO',
            entidade: 'USUARIO',
            registroId: Number(id),
            campo: 'ativo',
            valorAnterior: 'false',
            valorNovo: 'true',
            db: client
        });

        await client.query('COMMIT');

        return usuarioReativado;

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        throw error;

    } finally {

        if (client) {
            client.release();
        }
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