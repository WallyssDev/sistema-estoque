CREATE TABLE qualificacoes (
    id SERIAL PRIMARY KEY,

    equipamento_id INTEGER NOT NULL,

    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN (
            'INSTALACAO',
            'OPERACAO',
            'DESEMPENHO',
            'REQUALIFICACAO',
            'OUTRA'
        )),

    data_qualificacao DATE NOT NULL,

    proxima_qualificacao DATE,

    responsavel VARCHAR(150) NOT NULL,

    resultado VARCHAR(30) NOT NULL
        CHECK (resultado IN (
            'APROVADO',
            'REPROVADO',
            'APROVADO_COM_RESTRICAO'
        )),

    descricao TEXT NOT NULL,

    observacoes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qualificacao_equipamento
        FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
);