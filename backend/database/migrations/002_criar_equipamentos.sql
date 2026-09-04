CREATE TABLE equipamentos (
    id SERIAL PRIMARY KEY,

    codigo VARCHAR(50) NOT NULL UNIQUE,

    nome VARCHAR(150) NOT NULL,

    fabricante VARCHAR(150),

    numero_serie VARCHAR(150) UNIQUE,

    localizacao VARCHAR(255),

    especificacao TEXT,

    status_qualificacao VARCHAR(50) NOT NULL,

    status_manutencao VARCHAR(50) NOT NULL,

    conduta_incidente TEXT,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);