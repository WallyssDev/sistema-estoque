CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    acao VARCHAR(50) NOT NULL,

    entidade VARCHAR(50) NOT NULL,

    registro_id INTEGER,

    campo VARCHAR(100),

    valor_anterior TEXT,

    valor_novo TEXT,

    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
);