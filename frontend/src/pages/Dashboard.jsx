import { useEffect, useState } from 'react';

import api from '../services/api';

function Dashboard() {

    const [equipamentos, setEquipamentos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState('');

    useEffect(() => {

        const carregarEquipamentos = async () => {

            try {

                const resposta = await api.get('/equipamentos');

                setEquipamentos(resposta.data);

            } catch (error) {

                console.error('Erro ao carregar equipamentos:', error);

                setErro('Não foi possível carregar os equipamentos.');

            } finally {

                setCarregando(false);

            }

        };

        carregarEquipamentos();

    }, []);

    const totalEquipamentos = equipamentos.length;

    const equipamentosQualificados = equipamentos.filter(
        (equipamento) =>
            equipamento.status_qualificacao === 'QUALIFICADO'
    ).length;

    const manutencoesEmDia = equipamentos.filter(
        (equipamento) =>
            equipamento.status_manutencao === 'EM DIA'
    ).length;

    const equipamentosEmManutencao = equipamentos.filter(
        (equipamento) =>
            equipamento.status_manutencao === 'EM MANUTENÇÃO'
    ).length;

    return (
        <div className="dashboard">

            <div className="dashboard-title">
                <h2>Dashboard</h2>
                <p>Visão geral do sistema</p>
            </div>

            {carregando && (
                <p>Carregando informações...</p>
            )}

            {erro && (
                <p>{erro}</p>
            )}

            {!carregando && !erro && (
                <>
                    <div className="dashboard-cards">

                        <div className="dashboard-card">
                            <span>Total de equipamentos</span>
                            <strong>{totalEquipamentos}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Equipamentos qualificados</span>
                            <strong>{equipamentosQualificados}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Manutenções em dia</span>
                            <strong>{manutencoesEmDia}</strong>
                        </div>

                        <div className="dashboard-card">
                            <span>Em manutenção</span>
                            <strong>{equipamentosEmManutencao}</strong>
                        </div>

                    </div>

                    <div className="dashboard-section">

                        <div className="section-header">
                            <div>
                                <h3>Equipamentos</h3>
                                <p>Equipamentos cadastrados no sistema</p>
                            </div>

                            <a href="/equipamentos" className="view-all-button">
                                Ver todos
                            </a>
                        </div>

                        <div className="dashboard-table-container">

                            <table className="dashboard-table">

                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Equipamento</th>
                                        <th>Fabricante</th>
                                        <th>Qualificação</th>
                                        <th>Manutenção</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {equipamentos.map((equipamento) => (

                                        <tr key={equipamento.id}>

                                            <td>
                                                {equipamento.codigo}
                                            </td>

                                            <td>
                                                {equipamento.nome}
                                            </td>

                                            <td>
                                                {equipamento.fabricante}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${equipamento.status_qualificacao === 'QUALIFICADO'
                                                        ? 'status-success'
                                                        : 'status-warning'
                                                        }`}
                                                >
                                                    {equipamento.status_qualificacao}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${equipamento.status_manutencao === 'EM DIA'
                                                        ? 'status-success'
                                                        : 'status-warning'
                                                        }`}
                                                >
                                                    {equipamento.status_manutencao}
                                                </span>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}

export default Dashboard;