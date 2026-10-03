import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

import DashboardAlertas from '../components/DashboardAlertas';

import DashboardAtividades from '../components/DashboardAtividades';

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');

    const equipamentos = dashboard?.equipamentos ?? [];

    const alertas = dashboard?.alertas ?? {};

    const manutencoesVencidas =
        alertas.manutencoesVencidas ?? [];

    const manutencoesProximas =
        alertas.manutencoesProximas ?? [];

    const qualificacoesVencidas =
        alertas.qualificacoesVencidas ?? [];

    const qualificacoesProximas =
        alertas.qualificacoesProximas ?? [];

    const regulatoriosVencidos =
        alertas.regulatoriosVencidos ?? [];

    const regulatoriosProximos =
        alertas.regulatoriosProximos ?? [];

    const atividadesRecentes =
        dashboard?.atividadesRecentes ?? [];

    useEffect(() => {

        const carregarDashboard = async () => {

            try {

                const resposta = await api.get('/dashboard');

                setDashboard(resposta.data);

            } catch (error) {

                console.error(
                    'Erro ao carregar dashboard:',
                    error
                );

                setErro(
                    'Não foi possível carregar o dashboard.'
                );

            } finally {

                setCarregando(false);

            }

        };

        carregarDashboard();

    }, []);

    const totalEquipamentos =
        dashboard?.indicadores.total_equipamentos ?? 0;

    const equipamentosQualificados =
        dashboard?.indicadores.equipamentos_qualificados ?? 0;

    const manutencoesEmDia =
        dashboard?.indicadores.manutencoes_em_dia ?? 0;

    const equipamentosEmManutencao =
        dashboard?.indicadores.equipamentos_em_manutencao ?? 0;

    return (

        <div className="dashboard">

            <div className="dashboard-title">

                <h2>Dashboard</h2>

                <p>Visão geral do sistema</p>

            </div>

            {carregando && (

                <p>
                    Carregando informações...
                </p>

            )}

            {erro && (

                <p>
                    {erro}
                </p>

            )}

            {!carregando && !erro && (

                <>

                    <div className="dashboard-cards">

                        <a
                            href="/equipamentos"
                            className="dashboard-card"
                        >

                            <span>
                                Total de equipamentos
                            </span>

                            <strong>
                                {totalEquipamentos}
                            </strong>

                        </a>

                        <a
                            href="/qualificacoes"
                            className="dashboard-card"
                        >

                            <span>
                                Equipamentos qualificados
                            </span>

                            <strong>
                                {equipamentosQualificados}
                            </strong>

                        </a>

                        <a
                            href="/manutencoes"
                            className="dashboard-card"
                        >

                            <span>
                                Manutenções em dia
                            </span>

                            <strong>
                                {manutencoesEmDia}
                            </strong>

                        </a>

                        <a
                            href="/manutencoes"
                            className="dashboard-card"
                        >

                            <span>
                                Em manutenção
                            </span>

                            <strong>
                                {equipamentosEmManutencao}
                            </strong>

                        </a>

                    </div>

                    <DashboardAlertas

                        manutencoesVencidas={
                            manutencoesVencidas
                        }

                        manutencoesProximas={
                            manutencoesProximas
                        }

                        qualificacoesVencidas={
                            qualificacoesVencidas
                        }

                        qualificacoesProximas={
                            qualificacoesProximas
                        }

                        regulatoriosVencidos={
                            regulatoriosVencidos
                        }

                        regulatoriosProximos={
                            regulatoriosProximos
                        }

                    />

                    <div className="dashboard-section">

                        <div className="section-header">

                            <div>

                                <h3>
                                    Equipamentos
                                </h3>

                                <p>
                                    Equipamentos cadastrados no sistema
                                </p>

                            </div>

                            <a
                                href="/equipamentos"
                                className="view-all-button"
                            >
                                Ver todos
                            </a>

                        </div>

                        <div className="dashboard-table-container">

                            <table className="dashboard-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Código
                                        </th>

                                        <th>
                                            Equipamento
                                        </th>

                                        <th>
                                            Fabricante
                                        </th>

                                        <th>
                                            Qualificação
                                        </th>

                                        <th>
                                            Manutenção
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {equipamentos
                                        .slice(0, 5)
                                        .map((equipamento) => (

                                            <tr
                                                key={equipamento.id}
                                                className="dashboard-table-row-clickable"
                                                onClick={() => {
                                                    navigate(
                                                        `/equipamentos/${equipamento.id}`
                                                    );
                                                }}
                                            >

                                                <td>

                                                    <a
                                                        href={`/equipamentos/${equipamento.id}`}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();

                                                            navigate(
                                                                `/equipamentos/${equipamento.id}`
                                                            );
                                                        }}
                                                    >
                                                        {equipamento.codigo}
                                                    </a>

                                                </td>

                                                <td>

                                                    <a
                                                        href={`/equipamentos/${equipamento.id}`}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();

                                                            navigate(
                                                                `/equipamentos/${equipamento.id}`
                                                            );
                                                        }}
                                                    >
                                                        {equipamento.nome}
                                                    </a>

                                                </td>

                                                <td>
                                                    {equipamento.fabricante}
                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${
                                                            equipamento.status_qualificacao ===
                                                            'QUALIFICADO'
                                                                ? 'status-success'
                                                                : 'status-warning'
                                                        }`}
                                                    >

                                                        {
                                                            equipamento.status_qualificacao
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${
                                                            equipamento.status_manutencao ===
                                                            'EM DIA'
                                                                ? 'status-success'
                                                                : 'status-warning'
                                                        }`}
                                                    >

                                                        {
                                                            equipamento.status_manutencao
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    <DashboardAtividades
                        atividades={atividadesRecentes}
                    />

                </>

            )}

        </div>

    );

}

export default Dashboard;