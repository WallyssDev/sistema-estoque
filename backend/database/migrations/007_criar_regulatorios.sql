CREATE TABLE regulatorios (
    id SERIAL PRIMARY KEY,

    equipamento_id INTEGER NOT NULL,

    registro_anvisa_ms VARCHAR(100),
    situacao_regulatoria VARCHAR(50) NOT NULL,
    data_registro DATE,
    data_validade DATE,

    fabricante_legal VARCHAR(150),
    detentor_registro VARCHAR(150),

    documento_regulatorio VARCHAR(255),
    observacoes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT regulatorios_equipamento_id_key
        UNIQUE (equipamento_id),

    CONSTRAINT fk_regulatorio_equipamento
        FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
);