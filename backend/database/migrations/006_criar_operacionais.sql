CREATE TABLE operacionais (
    id SERIAL PRIMARY KEY,

    equipamento_id INTEGER NOT NULL UNIQUE,

    modelo VARCHAR(150),

    numero_patrimonio_fase VARCHAR(100),

    registro_anvisa_ms VARCHAR(100),

    unidade VARCHAR(150),

    sala VARCHAR(255),

    data_aquisicao DATE,

    status_operacional VARCHAR(50) NOT NULL,

    frequencia_manutencao_interna VARCHAR(100),

    frequencia_manutencao_externa VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_operacional_equipamento
        FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
);