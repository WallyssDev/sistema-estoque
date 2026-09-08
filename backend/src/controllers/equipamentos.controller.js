const pool = require('../database/connection');
const { registrarAuditoria } = require('../services/auditoria.service');

const criarEquipamento = async (req, res) => {

    let client;

    try {

        const {
            codigo,
            nome,
            fabricante,
            numero_serie,
            localizacao,
            especificacao,
            status_qualificacao,
            status_manutencao,
            conduta_incidente
        } = req.body;

        if (
            !codigo ||
            !nome ||
            !status_qualificacao ||
            !status_manutencao
        ) {
            return res.status(400).json({
                mensagem: 'Código, nome, status de qualificação e status de manutenção são obrigatórios'
            });
        }

        // Obtém uma conexão exclusiva para a transação
        client = await pool.connect();

        // Inicia a transação
        await client.query('BEGIN');

        const resultado = await client.query(
            `
            INSERT INTO equipamentos (
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo,
                created_at
            `,
            [
                codigo.trim(),
                nome.trim(),
                fabricante?.trim() || null,
                numero_serie?.trim() || null,
                localizacao?.trim() || null,
                especificacao?.trim() || null,
                status_qualificacao.trim(),
                status_manutencao.trim(),
                conduta_incidente?.trim() || null
            ]
        );

        // Registra a criação dentro da mesma transação
        await registrarAuditoria({
            usuarioId: req.usuario.id,
            acao: 'CRIACAO',
            entidade: 'EQUIPAMENTO',
            registroId: resultado.rows[0].id,
            valorNovo: JSON.stringify(resultado.rows[0]),
            db: client
        });

        // Confirma equipamento + auditoria
        await client.query('COMMIT');

        return res.status(201).json({
            mensagem: 'Equipamento cadastrado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {

        // Se alguma etapa falhar, desfaz tudo
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao cadastrar equipamento:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensagem: 'Já existe um equipamento cadastrado com este código ou número de série'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });

    } finally {

        // Devolve a conexão para o pool
        if (client) {
            client.release();
        }
    }
};

const listarEquipamentos = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo,
                created_at,
                updated_at
            FROM equipamentos
            WHERE ativo = true
            ORDER BY codigo
        `);

        return res.status(200).json(resultado.rows);

    } catch (error) {
        console.error('Erro ao listar equipamentos:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

const buscarEquipamentoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do equipamento inválido'
            });
        }

        const resultado = await pool.query(
            `
            SELECT
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo,
                created_at,
                updated_at
            FROM equipamentos
            WHERE id = $1
            `,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Equipamento não encontrado'
            });
        }

        return res.status(200).json(resultado.rows[0]);

    } catch (error) {
        console.error('Erro ao buscar equipamento:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

const atualizarEquipamento = async (req, res) => {

    let client;

    try {

        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do equipamento inválido'
            });
        }

        const {
            codigo,
            nome,
            fabricante,
            numero_serie,
            localizacao,
            especificacao,
            status_qualificacao,
            status_manutencao,
            conduta_incidente
        } = req.body;

        if (
            !codigo ||
            !nome ||
            !status_qualificacao ||
            !status_manutencao
        ) {
            return res.status(400).json({
                mensagem: 'Código, nome, status de qualificação e status de manutenção são obrigatórios'
            });
        }

        // Obtém uma conexão exclusiva
        client = await pool.connect();

        // Inicia a transação
        await client.query('BEGIN');

        // Busca o equipamento antes da alteração
        const equipamentoAtual = await client.query(
            `
            SELECT
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo
            FROM equipamentos
            WHERE id = $1
            `,
            [id]
        );

        if (equipamentoAtual.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                mensagem: 'Equipamento não encontrado'
            });
        }

        const equipamentoAnterior = equipamentoAtual.rows[0];

        // Organiza os novos valores antes de comparar
        const novosDados = {
            codigo: codigo.trim(),
            nome: nome.trim(),
            fabricante: fabricante?.trim() || null,
            numero_serie: numero_serie?.trim() || null,
            localizacao: localizacao?.trim() || null,
            especificacao: especificacao?.trim() || null,
            status_qualificacao: status_qualificacao.trim(),
            status_manutencao: status_manutencao.trim(),
            conduta_incidente: conduta_incidente?.trim() || null
        };

        // Atualiza o equipamento
        const resultado = await client.query(
            `
            UPDATE equipamentos
            SET
                codigo = $1,
                nome = $2,
                fabricante = $3,
                numero_serie = $4,
                localizacao = $5,
                especificacao = $6,
                status_qualificacao = $7,
                status_manutencao = $8,
                conduta_incidente = $9,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo,
                created_at,
                updated_at
            `,
            [
                novosDados.codigo,
                novosDados.nome,
                novosDados.fabricante,
                novosDados.numero_serie,
                novosDados.localizacao,
                novosDados.especificacao,
                novosDados.status_qualificacao,
                novosDados.status_manutencao,
                novosDados.conduta_incidente,
                id
            ]
        );

        // Verifica quais campos realmente mudaram
        for (const campo of Object.keys(novosDados)) {

            const valorAnterior = equipamentoAnterior[campo];
            const valorNovo = novosDados[campo];

            if (valorAnterior !== valorNovo) {

                await registrarAuditoria({
                    usuarioId: req.usuario.id,
                    acao: 'ALTERACAO',
                    entidade: 'EQUIPAMENTO',
                    registroId: Number(id),
                    campo,
                    valorAnterior,
                    valorNovo,
                    db: client
                });
            }
        }

        // Confirma tudo
        await client.query('COMMIT');

        return res.status(200).json({
            mensagem: 'Equipamento atualizado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao atualizar equipamento:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensagem: 'Já existe um equipamento cadastrado com este código ou número de série'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });

    } finally {

        if (client) {
            client.release();
        }
    }
};

const desativarEquipamento = async (req, res) => {

    let client;

    try {

        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do equipamento inválido'
            });
        }

        // Obtém uma conexão exclusiva para a transação
        client = await pool.connect();

        // Inicia a transação
        await client.query('BEGIN');

        const resultado = await client.query(
            `
            UPDATE equipamentos
            SET
                ativo = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND ativo = true
            RETURNING
                id,
                codigo,
                nome,
                ativo,
                updated_at
            `,
            [id]
        );

        if (resultado.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                mensagem: 'Equipamento não encontrado ou já está desativado'
            });
        }

        // Registra a desativação na auditoria
        await registrarAuditoria({
            usuarioId: req.usuario.id,
            acao: 'DESATIVACAO',
            entidade: 'EQUIPAMENTO',
            registroId: Number(id),
            campo: 'ativo',
            valorAnterior: 'true',
            valorNovo: 'false',
            db: client
        });

        // Confirma a desativação + auditoria
        await client.query('COMMIT');

        return res.status(200).json({
            mensagem: 'Equipamento desativado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao desativar equipamento:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });

    } finally {

        if (client) {
            client.release();
        }
    }
};

const reativarEquipamento = async (req, res) => {

    let client;

    try {

        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: 'ID do equipamento inválido'
            });
        }

        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
            `
            UPDATE equipamentos
            SET
                ativo = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND ativo = false
            RETURNING
                id,
                codigo,
                nome,
                ativo,
                updated_at
            `,
            [id]
        );

        if (resultado.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                mensagem: 'Equipamento não encontrado ou já está ativo'
            });
        }

        await registrarAuditoria({
            usuarioId: req.usuario.id,
            acao: 'REATIVACAO',
            entidade: 'EQUIPAMENTO',
            registroId: Number(id),
            campo: 'ativo',
            valorAnterior: 'false',
            valorNovo: 'true',
            db: client
        });

        await client.query('COMMIT');

        return res.status(200).json({
            mensagem: 'Equipamento reativado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {

        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao reativar equipamento:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });

    } finally {

        if (client) {
            client.release();
        }
    }
};

const listarEquipamentosInativos = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                codigo,
                nome,
                fabricante,
                numero_serie,
                localizacao,
                especificacao,
                status_qualificacao,
                status_manutencao,
                conduta_incidente,
                ativo,
                created_at,
                updated_at
            FROM equipamentos
            WHERE ativo = false
            ORDER BY codigo
        `);

        return res.status(200).json(resultado.rows);

    } catch (error) {
        console.error('Erro ao listar equipamentos inativos:', error);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    criarEquipamento,
    listarEquipamentos,
    buscarEquipamentoPorId,
    atualizarEquipamento,
    desativarEquipamento,
    reativarEquipamento,
    listarEquipamentosInativos
};