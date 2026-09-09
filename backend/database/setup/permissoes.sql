-- ============================================================
-- Permissões da aplicação
-- Sistema de Controle de Estoque
-- ============================================================

-- Permissão de conexão com o banco
GRANT CONNECT
ON DATABASE sistema_estoque
TO sistema_estoque_app;

-- Permissão de uso do schema
GRANT USAGE
ON SCHEMA public
TO sistema_estoque_app;


-- ============================================================
-- Tabela: usuarios
-- ============================================================

GRANT SELECT, INSERT, UPDATE
ON TABLE usuarios
TO sistema_estoque_app;


-- ============================================================
-- Tabela: equipamentos
-- ============================================================

GRANT SELECT, INSERT, UPDATE
ON TABLE equipamentos
TO sistema_estoque_app;


-- ============================================================
-- Tabela: auditoria
-- ============================================================

-- A aplicação pode consultar e registrar auditorias,
-- mas NÃO pode alterar nem excluir o histórico.
GRANT SELECT, INSERT
ON TABLE auditoria
TO sistema_estoque_app;


-- ============================================================
-- Sequences
-- Necessárias para os campos SERIAL das tabelas
-- ============================================================

GRANT USAGE, SELECT
ON SEQUENCE
    usuarios_id_seq,
    equipamentos_id_seq,
    auditoria_id_seq
TO sistema_estoque_app;