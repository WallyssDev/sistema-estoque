const pool = require('../database/connection');

const criarEquipamento = async (req, res) => {
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

        const resultado = await pool.query(
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

        return res.status(201).json({
            mensagem: 'Equipamento cadastrado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {
        console.error('Erro ao cadastrar equipamento:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensagem: 'Já existe um equipamento cadastrado com este código ou número de série'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
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

        const resultado = await pool.query(
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
                codigo.trim(),
                nome.trim(),
                fabricante?.trim() || null,
                numero_serie?.trim() || null,
                localizacao?.trim() || null,
                especificacao?.trim() || null,
                status_qualificacao.trim(),
                status_manutencao.trim(),
                conduta_incidente?.trim() || null,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Equipamento não encontrado'
            });
        }

        return res.status(200).json({
            mensagem: 'Equipamento atualizado com sucesso',
            equipamento: resultado.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensagem: 'Já existe um equipamento cadastrado com este código ou número de série'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    criarEquipamento,
    listarEquipamentos,
    buscarEquipamentoPorId,
    atualizarEquipamento
};