function formatarData(data) {

    if (!data) {

        return '-';

    }

    return new Date(data).toLocaleDateString('pt-BR');

}

function ListaAlertas({

    itens,

    tipo,

    mensagemVazia

}) {

    if (itens.length === 0) {

        return (

            <p className="dashboard-alerta-vazio">

                {mensagemVazia}

            </p>

        );

    }

    return (

        <div className="dashboard-alerta-lista">

            {itens.map((item) => (

                <a
                    href={`/equipamentos/${item.equipamento_id}`}
                    className="dashboard-alerta-item"
                    key={item.id}
                >

                    <div className="dashboard-alerta-equipamento">

                        <strong>

                            {item.equipamento_codigo}

                        </strong>

                        <span>

                            {item.equipamento_nome}

                        </span>

                    </div>

                    <div className="dashboard-alerta-data">

                        <span>

                            {tipo === 'manutencao'

                                ? formatarData(item.proxima_manutencao)

                                : tipo === 'qualificacao'

                                    ? formatarData(item.proxima_qualificacao)

                                    : formatarData(item.data_validade)

                            }

                        </span>

                        <span className="dashboard-alerta-seta">

                            →

                        </span>

                    </div>

                </a>

            ))}

        </div>

    );

}

function DashboardAlertas({

    manutencoesVencidas = [],

    manutencoesProximas = [],

    qualificacoesVencidas = [],

    qualificacoesProximas = [],

    regulatoriosVencidos = [],

    regulatoriosProximos = []

}) {

    return (

        <div className="dashboard-alertas">

            <div className="dashboard-alertas-header">

                <div>

                    <h3>Alertas e vencimentos</h3>

                    <p>
                        Itens que exigem atenção no sistema
                    </p>

                </div>

            </div>

            <div className="dashboard-alertas-grid">

                {/* MANUTENÇÕES VENCIDAS */}

                <div
                    className="dashboard-alerta dashboard-alerta-vencida"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Manutenções vencidas

                        </span>

                        <strong>

                            {manutencoesVencidas.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={manutencoesVencidas}
                        tipo="manutencao"
                        mensagemVazia="Nenhuma manutenção vencida."
                    />

                </div>


                {/* PRÓXIMAS MANUTENÇÕES */}

                <div
                    className="dashboard-alerta dashboard-alerta-proxima"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Próximas manutenções

                        </span>

                        <strong>

                            {manutencoesProximas.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={manutencoesProximas}
                        tipo="manutencao"
                        mensagemVazia="Nenhuma manutenção próxima."
                    />

                </div>


                {/* QUALIFICAÇÕES VENCIDAS */}

                <div
                    className="dashboard-alerta dashboard-alerta-vencida"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Qualificações vencidas

                        </span>

                        <strong>

                            {qualificacoesVencidas.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={qualificacoesVencidas}
                        tipo="qualificacao"
                        mensagemVazia="Nenhuma qualificação vencida."
                    />

                </div>


                {/* PRÓXIMAS QUALIFICAÇÕES */}

                <div
                    className="dashboard-alerta dashboard-alerta-proxima"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Próximas qualificações

                        </span>

                        <strong>

                            {qualificacoesProximas.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={qualificacoesProximas}
                        tipo="qualificacao"
                        mensagemVazia="Nenhuma qualificação próxima."
                    />

                </div>


                {/* REGISTROS REGULATÓRIOS VENCIDOS */}

                <div
                    className="dashboard-alerta dashboard-alerta-vencida"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Registros regulatórios vencidos

                        </span>

                        <strong>

                            {regulatoriosVencidos.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={regulatoriosVencidos}
                        tipo="regulatorio"
                        mensagemVazia="Nenhum registro regulatório vencido."
                    />

                </div>


                {/* PRÓXIMOS VENCIMENTOS REGULATÓRIOS */}

                <div
                    className="dashboard-alerta dashboard-alerta-proxima"
                >

                    <div className="dashboard-alerta-titulo">

                        <span>

                            Próximos vencimentos regulatórios

                        </span>

                        <strong>

                            {regulatoriosProximos.length}

                        </strong>

                    </div>

                    <ListaAlertas
                        itens={regulatoriosProximos}
                        tipo="regulatorio"
                        mensagemVazia="Nenhum vencimento regulatório próximo."
                    />

                </div>

            </div>

        </div>

    );

}

export default DashboardAlertas;