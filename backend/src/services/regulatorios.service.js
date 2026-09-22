const pool = require('../database/connection');
const { registrarAuditoria } = require('./auditoria.service');

const criarRegulatorio = async ({
    equipamentoId,
    registroAnvisaMs = null,
    situacaoRegulatoria,
    dataRegistro = null,
    dataValidade = null,
    fabricanteLegal = null,
    detentorRegistro = null,
    documentoRegulatorio = null,
    observacoes = null,
    usuarioLogadoId
}) => {

    if (!equipamentoId || !situacaoRegulatoria) {
        throw new Error(
            'Equipamento e situação regulatória são obrigatórios'
        );
    }

    const equipamento = await pool.query(
        `
        SELECT id, codigo, nome, ativo
        FROM equipamentos
        WHERE id = $1
        `,
        [equipamentoId]
    );

    if (equipamento.rows.length === 0) {
        throw new Error('Equipamento não encontrado');
    }

    if (!equipamento.rows[0].ativo) {
        throw new Error(
            'Não é possível cadastrar informações regulatórias para equipamento desativado'
        );
    }

    const registroExistente = await pool.query(
        `
        SELECT id
        FROM regulatorios
        WHERE equipamento_id = $1
        `,
        [equipamentoId]
    );

    if (registroExistente.rows.length > 0) {
        throw new Error(
            'Já existem informações regulatórias cadastradas para este equipamento'
        );
    }

    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const resultado = await client.query(
            `
            INSERT INTO regulatorios (
                equipamento_id,
                registro_anvisa_ms,
                situacao_regulatoria,
                data_registro,
                data_validade,
                fabricante_legal,
                detentor_registro,
                documento_regulatorio,
                observacoes
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9
            )
            RETURNING
                id,
                equipamento_id,
                registro_anvisa_ms,
                situacao_regulatoria,
                data_registro,
                data_validade,
                fabricante_legal,
                detentor_registro,
                documento_regulatorio,
                observacoes,
                created_at
            `,
            [
                equipamentoId,
                registroAnvisaMs,
                situacaoRegulatoria,
                dataRegistro,
                dataValidade,
                fabricanteLegal,
                detentorRegistro,
                documentoRegulatorio,
                observacoes
            ]
        );

        const regulatorioCriado = resultado.rows[0];

        await registrarAuditoria({
            usuarioId: usuarioLogadoId,
            acao: 'CRIACAO',
            entidade: 'REGULATORIO',
            registroId: regulatorioCriado.id,
            valorNovo: JSON.stringify(regulatorioCriado),
            db: client
        });

        await client.query('COMMIT');

        return regulatorioCriado;

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

const listarRegulatorios = async ({
    equipamentoId = null
} = {}) => {

    const valores = [];
    const filtros = [];

    let consulta = `
        SELECT
            r.id,
            r.equipamento_id,
            e.codigo AS equipamento_codigo,
            e.nome AS equipamento_nome,
            r.registro_anvisa_ms,
            r.situacao_regulatoria,
            r.data_registro,
            r.data_validade,
            r.fabricante_legal,
            r.detentor_registro,
            r.documento_regulatorio,
            r.observacoes,
            r.created_at
        FROM regulatorios r
        INNER JOIN equipamentos e
            ON e.id = r.equipamento_id
    `;

    if (equipamentoId) {
        valores.push(equipamentoId);
        filtros.push(
            `r.equipamento_id = $${valores.length}`
        );
    }

    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    consulta += `
        ORDER BY r.id DESC
    `;

    const resultado = await pool.query(
        consulta,
        valores
    );

    return resultado.rows;
};

const normalizarData = (valor) => {

    if (valor === null || valor === undefined) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().split('T')[0];
    }

    return String(valor).slice(0, 10);
};

const atualizarRegulatorio = async ({
    regulatorioId,
    registroAnvisaMs = null,
    situacaoRegulatoria,
    dataRegistro = null,
    dataValidade = null,
    fabricanteLegal = null,
    detentorRegistro = null,
    documentoRegulatorio = null,
    observacoes = null,
    usuarioLogadoId
}) => {

    if (!regulatorioId || !situacaoRegulatoria) {
        throw new Error(
            'Registro regulatório e situação regulatória são obrigatórios'
        );
    }

    let client;

    try {

        client = await pool.connect();

        await client.query('BEGIN');

        const consultaAtual = await client.query(
            `
            SELECT
                id,
                equipamento_id,
                registro_anvisa_ms,
                situacao_regulatoria,
                data_registro,
                data_validade,
                fabricante_legal,
                detentor_registro,
                documento_regulatorio,
                observacoes,
                created_at
            FROM regulatorios
            WHERE id = $1
            `,
            [regulatorioId]
        );

        if (consultaAtual.rows.length === 0) {
            throw new Error(
                'Informações regulatórias não encontradas'
            );
        }

        const regulatorioAtual = consultaAtual.rows[0];

        const novosDados = {
            registro_anvisa_ms: registroAnvisaMs,
            situacao_regulatoria: situacaoRegulatoria,
            data_registro: dataRegistro,
            data_validade: dataValidade,
            fabricante_legal: fabricanteLegal,
            detentor_registro: detentorRegistro,
            documento_regulatorio: documentoRegulatorio,
            observacoes
        };

        const camposAlterados = [];

        const comparar = (
            campo,
            valorAnterior,
            valorNovo
        ) => {

            const anterior = valorAnterior === null
                ? null
                : String(valorAnterior);

            const novo = valorNovo === null
                ? null
                : String(valorNovo);

            if (anterior !== novo) {
                camposAlterados.push({
                    campo,
                    valorAnterior: anterior,
                    valorNovo: novo
                });
            }
        };

        const compararData = (
            campo,
            valorAnterior,
            valorNovo
        ) => {

            const anterior = normalizarData(valorAnterior);
            const novo = normalizarData(valorNovo);

            if (anterior !== novo) {
                camposAlterados.push({
                    campo,
                    valorAnterior: anterior,
                    valorNovo: novo
                });
            }
        };

        comparar(
            'registro_anvisa_ms',
            regulatorioAtual.registro_anvisa_ms,
            novosDados.registro_anvisa_ms
        );

        comparar(
            'situacao_regulatoria',
            regulatorioAtual.situacao_regulatoria,
            novosDados.situacao_regulatoria
        );

        compararData(
            'data_registro',
            regulatorioAtual.data_registro,
            novosDados.data_registro
        );

        compararData(
            'data_validade',
            regulatorioAtual.data_validade,
            novosDados.data_validade
        );

        comparar(
            'fabricante_legal',
            regulatorioAtual.fabricante_legal,
            novosDados.fabricante_legal
        );

        comparar(
            'detentor_registro',
            regulatorioAtual.detentor_registro,
            novosDados.detentor_registro
        );

        comparar(
            'documento_regulatorio',
            regulatorioAtual.documento_regulatorio,
            novosDados.documento_regulatorio
        );

        comparar(
            'observacoes',
            regulatorioAtual.observacoes,
            novosDados.observacoes
        );

        if (camposAlterados.length === 0) {
            throw new Error('Nenhuma alteração foi realizada');
        }

        const resultadoAtualizacao = await client.query(
            `
            UPDATE regulatorios
            SET
                registro_anvisa_ms = $1,
                situacao_regulatoria = $2,
                data_registro = $3,
                data_validade = $4,
                fabricante_legal = $5,
                detentor_registro = $6,
                documento_regulatorio = $7,
                observacoes = $8
            WHERE id = $9
            RETURNING
                id,
                equipamento_id,
                registro_anvisa_ms,
                situacao_regulatoria,
                data_registro,
                data_validade,
                fabricante_legal,
                detentor_registro,
                documento_regulatorio,
                observacoes,
                created_at
            `,
            [
                registroAnvisaMs,
                situacaoRegulatoria,
                dataRegistro,
                dataValidade,
                fabricanteLegal,
                detentorRegistro,
                documentoRegulatorio,
                observacoes,
                regulatorioId
            ]
        );

        const regulatorioAtualizado =
            resultadoAtualizacao.rows[0];

        for (const alteracao of camposAlterados) {

            await registrarAuditoria({
                usuarioId: usuarioLogadoId,
                acao: 'ALTERACAO',
                entidade: 'REGULATORIO',
                registroId: regulatorioId,
                campo: alteracao.campo,
                valorAnterior: alteracao.valorAnterior,
                valorNovo: alteracao.valorNovo,
                db: client
            });
        }

        await client.query('COMMIT');

        return regulatorioAtualizado;

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
    criarRegulatorio,
    listarRegulatorios,
    atualizarRegulatorio
};