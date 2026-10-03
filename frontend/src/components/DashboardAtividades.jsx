function formatarDataHora(data) {

    if (!data) {

        return '-';

    }

    return new Date(data).toLocaleString('pt-BR');

}

function obterRotaAtividade(atividade) {

    return `/auditoria?auditoria_id=${atividade.id}`;

}

function formatarAcao(acao) {

    if (acao === 'CRIACAO') {

        return 'Criou';

    }

    if (acao === 'ALTERACAO') {

        return 'Alterou';

    }

    if (acao === 'DESATIVACAO') {

        return 'Desativou';

    }

    if (acao === 'REATIVACAO') {

        return 'Reativou';

    }

    return acao;

}

function formatarEntidade(entidade) {

    switch (entidade) {

        case 'EQUIPAMENTO':

            return 'Equipamento';

        case 'MANUTENCAO':

            return 'Manutenção';

        case 'QUALIFICACAO':

            return 'Qualificação';

        case 'OPERACIONAL':

            return 'Operacional';

        case 'REGULATORIO':

            return 'Regulatório';

        default:

            return entidade;

    }

}

function DashboardAtividades({

    atividades = []

}) {

    return (

        <div className="dashboard-section dashboard-atividades">

            <div className="section-header">

                <div>

                    <h3>

                        Atividades recentes

                    </h3>

                    <p>

                        Últimas alterações realizadas no sistema

                    </p>

                </div>

                <a
                    href="/auditoria"
                    className="view-all-button"
                >

                    Ver histórico

                </a>

            </div>

            {atividades.length === 0 ? (

                <p className="dashboard-atividades-vazio">

                    Nenhuma atividade recente.

                </p>

            ) : (

                <div className="dashboard-atividades-lista">

                    {atividades.slice(0, 5).map((atividade) => (

                        <a
                            key={atividade.id}
                            href={obterRotaAtividade(atividade)}
                            className="dashboard-atividade-item"
                        >

                            <div className="dashboard-atividade-indicador">

                                <span></span>

                            </div>

                            <div className="dashboard-atividade-conteudo">

                                <strong>

                                    {atividade.usuario_nome}

                                </strong>

                                <span>

                                    {formatarAcao(
                                        atividade.acao
                                    )}

                                    {' '}

                                    {formatarEntidade(
                                        atividade.entidade
                                    )}

                                    {' · Registro #'}

                                    {atividade.registro_id}

                                    {atividade.campo && (

                                        <>

                                            {' · Campo: '}

                                            {atividade.campo}

                                        </>

                                    )}

                                </span>

                                <small>

                                    {formatarDataHora(
                                        atividade.data_hora
                                    )}

                                </small>

                            </div>

                        </a>

                    ))}

                </div>

            )}

        </div>

    );

}

export default DashboardAtividades;