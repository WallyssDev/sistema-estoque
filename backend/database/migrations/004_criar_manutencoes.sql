CREATE TABLE manutencoes (
    id SERIAL PRIMARY KEY,

    equipamento_id INTEGER NOT NULL,

    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN (
            'PREVENTIVA',
            'CORRETIVA',
            'CALIBRACAO',
            'OUTRA'
        )),

    data_manutencao DATE NOT NULL,

    proxima_manutencao DATE,

    responsavel VARCHAR(150) NOT NULL,

    descricao TEXT NOT NULL,

    resultado VARCHAR(30) NOT NULL
        CHECK (resultado IN (
            'APROVADO',
            'REPROVADO',
            'APROVADO_COM_RESTRICAO'
        )),

    observacoes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_manutencao_equipamento
        FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
);