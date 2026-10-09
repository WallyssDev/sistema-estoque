import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import '../styles/relatorios.css';

function Relatorios() {


    const [paineisAbertos, setPaineisAbertos] = useState({
        equipamentos: false,
        manutencoes: false,
        qualificacoes: false,
        operacional: false,
        regulatorios: false,
        vencimentos: false
    });

    const alternarPainel = (painel) => {
        setPaineisAbertos((estadoAtual) => ({
            ...estadoAtual,
            [painel]: !estadoAtual[painel]
        }));
    };


    const [equipamentos, setEquipamentos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [manutencoes, setManutencoes] = useState([]);
    const [carregandoManutencoes, setCarregandoManutencoes] = useState(false);
    const [erroManutencoes, setErroManutencoes] = useState('');


    const mensagemTimeoutRef = useRef(null);

    const mostrarMensagem = (texto) => {
        if (mensagemTimeoutRef.current) {
            clearTimeout(mensagemTimeoutRef.current);
        }

        setMensagem(texto);

        mensagemTimeoutRef.current = setTimeout(() => {
            setMensagem('');
            mensagemTimeoutRef.current = null;
        }, 3000);
    };

    const [filtros, setFiltros] = useState({
        codigo: '',
        nome: '',
        fabricante: '',
        localizacao: '',
        status_qualificacao: '',
        status_manutencao: '',
        ativo: ''
    });


    const [filtrosManutencoes, setFiltrosManutencoes] = useState({
        codigo: '',
        nome: '',
        tipo: '',
        responsavel: '',
        resultado: '',
        data_manutencao: '',
        proxima_manutencao: '',
        status: ''
    });


    const carregarEquipamentos = async (filtrosAtuais = filtros) => {
        try {
            setCarregando(true);
            setErro('');
            setMensagem('');

            const parametros = {};

            Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
                if (valor !== '') {
                    parametros[chave] = valor;
                }
            });

            const resposta = await api.get('/relatorios/equipamentos', {
                params: parametros
            });

            setEquipamentos(resposta.data.equipamentos || []);

        } catch (error) {
            console.error('Erro ao carregar relatório de equipamentos:', error);

            setEquipamentos([]);

            setErro(
                error.response?.data?.mensagem ||
                'Erro ao carregar relatório de equipamentos.'
            );
        } finally {
            setCarregando(false);
        }
    };


    const carregarManutencoes = async (filtrosAtuais = filtrosManutencoes) => {
        try {
            setCarregandoManutencoes(true);
            setErroManutencoes('');

            const parametros = {};

            Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
                if (valor !== '') {
                    parametros[chave] = valor;
                }
            });

            const resposta = await api.get('/relatorios/manutencoes', {
                params: parametros
            });

            setManutencoes(resposta.data.manutencoes || []);
        } catch (error) {
            console.error('Erro ao carregar relatório de manutenções:', error);

            setManutencoes([]);

            setErroManutencoes(
                error.response?.data?.mensagem ||
                'Erro ao carregar relatório de manutenções.'
            );
        } finally {
            setCarregandoManutencoes(false);
        }
    };


    useEffect(() => {
        carregarEquipamentos();
        carregarManutencoes();
    }, []);

    const handleFiltroChange = (evento) => {
        const { name, value } = evento.target;

        setFiltros((estadoAtual) => ({
            ...estadoAtual,
            [name]: value
        }));
    };

    const exportarPDF = () => {
        const documento = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const margem = 14;
        const larguraPagina = documento.internal.pageSize.getWidth();
        const alturaPagina = documento.internal.pageSize.getHeight();
        const larguraConteudo = larguraPagina - (margem * 2);

        const azulEscuro = [17, 24, 39];
        const azulCabecalho = [37, 99, 235];
        const cinzaTexto = [71, 85, 105];
        const cinzaClaro = [241, 245, 249];
        const branco = [255, 255, 255];

        /*
         * ---------------------------------------------------------
         * FILTROS APLICADOS
         * ---------------------------------------------------------
         */

        const filtrosAplicados = [];

        if (filtros.codigo?.trim()) {
            filtrosAplicados.push(`Código: ${filtros.codigo.trim()}`);
        }

        if (filtros.nome?.trim()) {
            filtrosAplicados.push(`Nome: ${filtros.nome.trim()}`);
        }

        if (filtros.fabricante?.trim()) {
            filtrosAplicados.push(`Fabricante: ${filtros.fabricante.trim()}`);
        }

        if (filtros.localizacao?.trim()) {
            filtrosAplicados.push(`Localização: ${filtros.localizacao.trim()}`);
        }

        if (filtros.status_qualificacao) {
            const qualificacoes = {
                QUALIFICADO: 'Qualificado',
                REPROVADO: 'Reprovado',
                APROVADO_COM_RESTRICAO: 'Aprovado com restrição'
            };

            filtrosAplicados.push(
                `Qualificação: ${qualificacoes[filtros.status_qualificacao] ||
                filtros.status_qualificacao
                }`
            );
        }

        if (filtros.status_manutencao) {
            const manutencoes = {
                'EM DIA': 'Em dia',
                'EM MANUTENÇÃO': 'Em manutenção',
                VENCIDA: 'Vencida'
            };

            filtrosAplicados.push(
                `Manutenção: ${manutencoes[filtros.status_manutencao] ||
                filtros.status_manutencao
                }`
            );
        }

        if (filtros.ativo !== '') {
            filtrosAplicados.push(
                `Situação: ${filtros.ativo === 'true' ? 'Ativos' : 'Inativos'}`
            );
        }

        /*
         * ---------------------------------------------------------
         * CABEÇALHO
         * ---------------------------------------------------------
         */

        documento.setFillColor(...azulEscuro);
        documento.rect(
            margem,
            10,
            larguraConteudo,
            23,
            'F'
        );

        documento.setTextColor(...branco);
        documento.setFont('helvetica', 'bold');
        documento.setFontSize(16);

        documento.text(
            'SISTEMA DE CONTROLE DE ESTOQUE',
            larguraPagina / 2,
            19,
            { align: 'center' }
        );

        documento.setFontSize(12);

        documento.text(
            'RELATÓRIO DE EQUIPAMENTOS',
            larguraPagina / 2,
            27,
            { align: 'center' }
        );

        /*
         * ---------------------------------------------------------
         * INFORMAÇÕES DO RELATÓRIO
         * ---------------------------------------------------------
         */

        documento.setTextColor(...cinzaTexto);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(8.5);

        documento.text(
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            margem,
            40
        );

        documento.text(
            `Total de equipamentos: ${equipamentos.length}`,
            larguraPagina - margem,
            40,
            { align: 'right' }
        );

        /*
         * ---------------------------------------------------------
         * FILTROS
         * ---------------------------------------------------------
         */

        let inicioTabela = 51;

        documento.setFont('helvetica', 'bold');
        documento.setFontSize(8.5);
        documento.setTextColor(...azulEscuro);

        documento.text(
            'Filtros aplicados:',
            margem,
            48
        );

        documento.setFont('helvetica', 'normal');
        documento.setTextColor(...cinzaTexto);

        const textoFiltros = filtrosAplicados.length > 0
            ? filtrosAplicados.join('  |  ')
            : 'Todos os equipamentos';

        const linhasFiltros = documento.splitTextToSize(
            textoFiltros,
            larguraConteudo - 35
        );

        documento.text(
            linhasFiltros,
            margem + 30,
            48
        );

        inicioTabela += Math.max(0, (linhasFiltros.length - 1) * 4);

        /*
         * ---------------------------------------------------------
         * DADOS DA TABELA
         * ---------------------------------------------------------
         */

        const cabecalho = [
            'Código',
            'Nome',
            'Fabricante',
            'Nº de série',
            'Localização',
            'Status de qualificação',
            'Status de manutenção',
            'Situação'
        ];

        const linhas = equipamentos.map((equipamento) => [
            equipamento.codigo || '-',
            equipamento.nome || '-',
            equipamento.fabricante || '-',
            equipamento.numero_serie || '-',
            equipamento.localizacao || '-',
            equipamento.status_qualificacao || '-',
            equipamento.status_manutencao || '-',
            equipamento.ativo ? 'Ativo' : 'Inativo'
        ]);

        /*
         * ---------------------------------------------------------
         * TABELA ESTILIZADA
         * ---------------------------------------------------------
         */

        autoTable(documento, {
            head: [cabecalho],
            body: linhas,
            startY: inicioTabela,

            margin: {
                left: margem,
                right: margem,
                bottom: 14
            },

            theme: 'grid',

            styles: {
                font: 'helvetica',
                fontSize: 7,
                textColor: [30, 41, 59],
                cellPadding: 2,
                lineColor: [203, 213, 225],
                lineWidth: 0.2,
                valign: 'middle'
            },

            headStyles: {
                fillColor: azulCabecalho,
                textColor: branco,
                fontStyle: 'bold',
                fontSize: 7,
                halign: 'center',
                valign: 'middle',
                cellPadding: 2
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },

            columnStyles: {
                0: {
                    cellWidth: 18,
                    halign: 'center'
                },
                1: {
                    cellWidth: 40
                },
                2: {
                    cellWidth: 31
                },
                3: {
                    cellWidth: 28
                },
                4: {
                    cellWidth: 43
                },
                5: {
                    cellWidth: 36,
                    halign: 'center'
                },
                6: {
                    cellWidth: 35,
                    halign: 'center'
                },
                7: {
                    cellWidth: 24,
                    halign: 'center'
                }
            },

            didParseCell: (dados) => {
                if (dados.section !== 'body') {
                    return;
                }

                const coluna = dados.column.index;
                const valor = String(dados.cell.raw || '').toUpperCase();

                /*
                 * Status de qualificação
                 */
                if (coluna === 5) {
                    if (valor === 'QUALIFICADO') {
                        dados.cell.styles.fillColor = [220, 252, 231];
                        dados.cell.styles.textColor = [22, 101, 52];
                        dados.cell.styles.fontStyle = 'bold';
                    }

                    if (valor === 'REPROVADO') {
                        dados.cell.styles.fillColor = [254, 226, 226];
                        dados.cell.styles.textColor = [185, 28, 28];
                        dados.cell.styles.fontStyle = 'bold';
                    }

                    if (valor === 'APROVADO_COM_RESTRICAO') {
                        dados.cell.styles.fillColor = [254, 249, 195];
                        dados.cell.styles.textColor = [133, 77, 14];
                        dados.cell.styles.fontStyle = 'bold';
                    }
                }

                /*
                 * Status de manutenção
                 */
                if (coluna === 6) {
                    if (valor === 'EM DIA') {
                        dados.cell.styles.fillColor = [220, 252, 231];
                        dados.cell.styles.textColor = [22, 101, 52];
                        dados.cell.styles.fontStyle = 'bold';
                    }

                    if (valor === 'EM MANUTENÇÃO') {
                        dados.cell.styles.fillColor = [254, 243, 199];
                        dados.cell.styles.textColor = [154, 52, 18];
                        dados.cell.styles.fontStyle = 'bold';
                    }

                    if (valor === 'VENCIDA') {
                        dados.cell.styles.fillColor = [254, 226, 226];
                        dados.cell.styles.textColor = [185, 28, 28];
                        dados.cell.styles.fontStyle = 'bold';
                    }
                }

                /*
                 * Situação
                 */
                if (coluna === 7) {
                    if (valor === 'ATIVO') {
                        dados.cell.styles.fillColor = [220, 252, 231];
                        dados.cell.styles.textColor = [22, 101, 52];
                        dados.cell.styles.fontStyle = 'bold';
                    }

                    if (valor === 'INATIVO') {
                        dados.cell.styles.fillColor = [254, 226, 226];
                        dados.cell.styles.textColor = [185, 28, 28];
                        dados.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        /*
         * ---------------------------------------------------------
         * RODAPÉ E PAGINAÇÃO
         * ---------------------------------------------------------
         */

        const totalPaginas = documento.internal.getNumberOfPages();

        for (let pagina = 1; pagina <= totalPaginas; pagina++) {
            documento.setPage(pagina);

            documento.setDrawColor(203, 213, 225);
            documento.setLineWidth(0.2);

            documento.line(
                margem,
                alturaPagina - 10,
                larguraPagina - margem,
                alturaPagina - 10
            );

            documento.setFont('helvetica', 'normal');
            documento.setFontSize(7);
            documento.setTextColor(...cinzaTexto);

            documento.text(
                'Sistema de Controle de Estoque',
                margem,
                alturaPagina - 4
            );

            documento.text(
                `Página ${pagina} de ${totalPaginas}`,
                larguraPagina - margem,
                alturaPagina - 4,
                { align: 'right' }
            );
        }

        /*
         * ---------------------------------------------------------
         * DOWNLOAD
         * ---------------------------------------------------------
         */

        const dataArquivo = new Date().toISOString().slice(0, 10);

        documento.save(
            `Relatorio_Equipamentos_${dataArquivo}.pdf`
        );

        setErro('');

        mostrarMensagem(
            'Relatório PDF exportado com sucesso.'
        );
    };

    const exportarExcel = () => {
        if (equipamentos.length === 0) {
            setErro('Não há equipamentos para exportar.');
            setMensagem('');
            return;
        }

        try {
            const dataAtual = new Date();

            const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
            const horaFormatada = dataAtual.toLocaleTimeString('pt-BR');

            /*
             * =========================
             * ESTILOS
             * =========================
             */

            const bordaPadrao = {
                top: {
                    style: 'thin',
                    color: { rgb: 'D1D5DB' }
                },
                bottom: {
                    style: 'thin',
                    color: { rgb: 'D1D5DB' }
                },
                left: {
                    style: 'thin',
                    color: { rgb: 'D1D5DB' }
                },
                right: {
                    style: 'thin',
                    color: { rgb: 'D1D5DB' }
                }
            };

            const estiloTitulo = {
                font: {
                    bold: true,
                    sz: 18,
                    color: { rgb: 'FFFFFF' }
                },
                fill: {
                    patternType: 'solid',
                    fgColor: { rgb: '111827' }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };

            const estiloSubtitulo = {
                font: {
                    bold: true,
                    sz: 14,
                    color: { rgb: 'FFFFFF' }
                },
                fill: {
                    patternType: 'solid',
                    fgColor: { rgb: '1F2937' }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };

            const estiloInformacao = {
                font: {
                    sz: 10,
                    color: { rgb: '4B5563' }
                },
                fill: {
                    patternType: 'solid',
                    fgColor: { rgb: 'F3F4F6' }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };

            const estiloCabecalho = {
                font: {
                    bold: true,
                    sz: 10,
                    color: { rgb: 'FFFFFF' }
                },
                fill: {
                    patternType: 'solid',
                    fgColor: { rgb: '2563EB' }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                border: bordaPadrao
            };

            const estiloCelula = {
                font: {
                    sz: 10,
                    color: { rgb: '374151' }
                },
                alignment: {
                    vertical: 'center'
                },
                border: bordaPadrao
            };

            /*
             * =========================
             * FUNÇÃO AUXILIAR
             * =========================
             */

            const criarCelula = (valor, estilo = estiloCelula) => ({
                v: valor,
                t: 's',
                s: estilo
            });

            /*
             * =========================
             * DADOS
             * =========================
             */

            const dados = [];

            /*
             * Título
             */

            dados.push([
                criarCelula(
                    'SISTEMA DE CONTROLE DE ESTOQUE',
                    estiloTitulo
                ),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo),
                criarCelula('', estiloTitulo)
            ]);

            /*
             * Subtítulo
             */

            dados.push([
                criarCelula(
                    'RELATÓRIO DE EQUIPAMENTOS',
                    estiloSubtitulo
                ),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo),
                criarCelula('', estiloSubtitulo)
            ]);

            /*
             * Data
             */

            dados.push([
                criarCelula(
                    `Gerado em: ${dataFormatada} às ${horaFormatada}`,
                    estiloInformacao
                ),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao)
            ]);

            /*
             * Quantidade
             */

            dados.push([
                criarCelula(
                    `Total de equipamentos: ${equipamentos.length}`,
                    estiloInformacao
                ),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao),
                criarCelula('', estiloInformacao)
            ]);

            /*
             * Linha vazia
             */

            dados.push([
                criarCelula(''),
                criarCelula(''),
                criarCelula(''),
                criarCelula(''),
                criarCelula(''),
                criarCelula(''),
                criarCelula(''),
                criarCelula('')
            ]);

            /*
             * Cabeçalho
             */

            dados.push([
                criarCelula('Código', estiloCabecalho),
                criarCelula('Nome', estiloCabecalho),
                criarCelula('Fabricante', estiloCabecalho),
                criarCelula('Nº de série', estiloCabecalho),
                criarCelula('Localização', estiloCabecalho),
                criarCelula('Status de qualificação', estiloCabecalho),
                criarCelula('Status de manutenção', estiloCabecalho),
                criarCelula('Situação', estiloCabecalho)
            ]);

            /*
             * Equipamentos
             */

            equipamentos.forEach((equipamento) => {
                let estiloQualificacao = estiloCelula;

                if (equipamento.status_qualificacao === 'QUALIFICADO') {
                    estiloQualificacao = {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };
                } else if (
                    equipamento.status_qualificacao === 'REPROVADO'
                ) {
                    estiloQualificacao = {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };
                }

                let estiloManutencao = estiloCelula;

                if (equipamento.status_manutencao === 'EM DIA') {
                    estiloManutencao = {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };
                } else if (
                    equipamento.status_manutencao === 'EM MANUTENÇÃO'
                ) {
                    estiloManutencao = {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '92400E' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEF3C7' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };
                } else if (
                    equipamento.status_manutencao === 'VENCIDA'
                ) {
                    estiloManutencao = {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };
                }

                const estiloSituacao = equipamento.ativo
                    ? {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    }
                    : {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center'
                        }
                    };

                dados.push([
                    criarCelula(equipamento.codigo, {
                        ...estiloCelula,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '111827' }
                        }
                    }),

                    criarCelula(equipamento.nome),

                    criarCelula(
                        equipamento.fabricante || '-'
                    ),

                    criarCelula(
                        equipamento.numero_serie || '-'
                    ),

                    criarCelula(
                        equipamento.localizacao || '-'
                    ),

                    criarCelula(
                        equipamento.status_qualificacao || '-',
                        estiloQualificacao
                    ),

                    criarCelula(
                        equipamento.status_manutencao || '-',
                        estiloManutencao
                    ),

                    criarCelula(
                        equipamento.ativo ? 'Ativo' : 'Inativo',
                        estiloSituacao
                    )
                ]);
            });

            /*
             * =========================
             * CRIAR PLANILHA
             * =========================
             */

            const planilha = XLSX.utils.aoa_to_sheet(dados);

            /*
             * =========================
             * MESCLAR CABEÇALHO
             * =========================
             */

            planilha['!merges'] = [
                {
                    s: { r: 0, c: 0 },
                    e: { r: 0, c: 7 }
                },
                {
                    s: { r: 1, c: 0 },
                    e: { r: 1, c: 7 }
                },
                {
                    s: { r: 2, c: 0 },
                    e: { r: 2, c: 7 }
                },
                {
                    s: { r: 3, c: 0 },
                    e: { r: 3, c: 7 }
                }
            ];

            /*
             * =========================
             * LARGURA DAS COLUNAS
             * =========================
             */

            planilha['!cols'] = [
                { wch: 12 },
                { wch: 32 },
                { wch: 24 },
                { wch: 20 },
                { wch: 42 },
                { wch: 24 },
                { wch: 24 },
                { wch: 14 }
            ];

            /*
             * =========================
             * ALTURA DAS LINHAS
             * =========================
             */

            planilha['!rows'] = [
                { hpt: 30 },
                { hpt: 24 },
                { hpt: 20 },
                { hpt: 20 },
                { hpt: 8 },
                { hpt: 28 }
            ];

            /*
             * =========================
             * FILTRO NATIVO DO EXCEL
             * =========================
             */

            const ultimaLinha = dados.length;

            planilha['!autofilter'] = {
                ref: `A6:H${ultimaLinha}`
            };

            /*
             * =========================
             * CRIAR LIVRO
             * =========================
             */

            const livro = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                livro,
                planilha,
                'Equipamentos'
            );

            /*
             * =========================
             * EXPORTAR
             * =========================
             */

            const dataArquivo = dataAtual
                .toISOString()
                .slice(0, 10);

            XLSX.writeFile(
                livro,
                `Relatorio_Equipamentos_${dataArquivo}.xlsx`
            );

            setErro('');
            mostrarMensagem(
                'Relatório Excel exportado com sucesso.'
            );

        } catch (error) {
            console.error(
                'Erro ao exportar relatório Excel:',
                error
            );

            setMensagem('');
            setErro(
                'Erro ao exportar relatório Excel.'
            );
        }
    };

    const handleGerarRelatorio = async (evento) => {
        evento.preventDefault();

        await carregarEquipamentos(filtros);

        mostrarMensagem('Relatório atualizado com os filtros selecionados.');
    };

    const limparFiltros = async () => {
        const filtrosLimpos = {
            codigo: '',
            nome: '',
            fabricante: '',
            localizacao: '',
            status_qualificacao: '',
            status_manutencao: '',
            ativo: ''
        };

        setFiltros(filtrosLimpos);

        await carregarEquipamentos(filtrosLimpos);

        mostrarMensagem('Filtros limpos.');
    };

    return (
        <div className="relatorios-page">

            <div className="relatorios-header">
                <div>
                    <h2>Relatórios</h2>
                    <p>
                        Gere relatórios dos equipamentos e registros do sistema.
                    </p>
                </div>
            </div>


            <section className="relatorio-card relatorio-painel">
                <button
                    type="button"
                    className="relatorio-painel-cabecalho"
                    onClick={() => alternarPainel('equipamentos')}
                    aria-expanded={paineisAbertos.equipamentos}
                >
                    <span className="relatorio-painel-titulo">
                        <h3>Relatório de Equipamentos</h3>
                        <p>
                            Consulte os equipamentos cadastrados utilizando os filtros abaixo.
                        </p>
                    </span>

                    <span
                        className={`relatorio-painel-icone ${paineisAbertos.equipamentos ? 'aberto' : ''
                            }`}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>

                {paineisAbertos.equipamentos && (
                    <div className="relatorio-painel-conteudo">
                        <form
                            className="relatorio-filtros"
                            onSubmit={handleGerarRelatorio}
                        >
                            <div className="campo-relatorio">
                                <label htmlFor="codigo">Código</label>
                                <input
                                    id="codigo"
                                    name="codigo"
                                    type="text"
                                    value={filtros.codigo}
                                    onChange={handleFiltroChange}
                                    placeholder="Ex.: EQ-001"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="nome">Nome</label>
                                <input
                                    id="nome"
                                    name="nome"
                                    type="text"
                                    value={filtros.nome}
                                    onChange={handleFiltroChange}
                                    placeholder="Nome do equipamento"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="fabricante">Fabricante</label>
                                <input
                                    id="fabricante"
                                    name="fabricante"
                                    type="text"
                                    value={filtros.fabricante}
                                    onChange={handleFiltroChange}
                                    placeholder="Fabricante"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="localizacao">Localização</label>
                                <input
                                    id="localizacao"
                                    name="localizacao"
                                    type="text"
                                    value={filtros.localizacao}
                                    onChange={handleFiltroChange}
                                    placeholder="Localização"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="status_qualificacao">
                                    Qualificação
                                </label>
                                <select
                                    id="status_qualificacao"
                                    name="status_qualificacao"
                                    value={filtros.status_qualificacao}
                                    onChange={handleFiltroChange}
                                >
                                    <option value="">Todos</option>
                                    <option value="QUALIFICADO">Qualificado</option>
                                    <option value="REPROVADO">Reprovado</option>
                                    <option value="APROVADO_COM_RESTRICAO">
                                        Aprovado com restrição
                                    </option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="status_manutencao">Manutenção</label>
                                <select
                                    id="status_manutencao"
                                    name="status_manutencao"
                                    value={filtros.status_manutencao}
                                    onChange={handleFiltroChange}
                                >
                                    <option value="">Todos</option>
                                    <option value="EM DIA">Em dia</option>
                                    <option value="EM MANUTENÇÃO">
                                        Em manutenção
                                    </option>
                                    <option value="VENCIDA">Vencida</option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="ativo">Situação</label>
                                <select
                                    id="ativo"
                                    name="ativo"
                                    value={filtros.ativo}
                                    onChange={handleFiltroChange}
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Ativos</option>
                                    <option value="false">Inativos</option>
                                </select>
                            </div>

                            <div className="relatorio-acoes">
                                <button
                                    type="button"
                                    className="botao-relatorio botao-secundario"
                                    onClick={limparFiltros}
                                    disabled={carregando}
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="submit"
                                    className="botao-relatorio botao-principal"
                                    disabled={carregando}
                                >
                                    {carregando ? 'Carregando...' : 'Gerar relatório'}
                                </button>
                            </div>
                        </form>

                        {erro && (
                            <div className="mensagem-relatorio mensagem-erro">
                                {erro}
                            </div>
                        )}

                        {mensagem && !erro && (
                            <div className="mensagem-relatorio mensagem-sucesso">
                                {mensagem}
                            </div>
                        )}

                        <div className="relatorio-resultado-header">
                            <div>
                                <h3>Resultado</h3>
                                <p>
                                    {equipamentos.length} equipamento(s) encontrado(s).
                                </p>
                            </div>

                            <div className="relatorios-exportacoes">
                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-excel"
                                    onClick={exportarExcel}
                                >
                                    Exportar Excel
                                </button>

                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-pdf"
                                    onClick={exportarPDF}
                                >
                                    Exportar PDF
                                </button>
                            </div>
                        </div>

                        {carregando ? (
                            <div className="relatorio-vazio">
                                Carregando equipamentos...
                            </div>
                        ) : equipamentos.length === 0 ? (
                            <div className="relatorio-vazio">
                                Nenhum equipamento encontrado.
                            </div>
                        ) : (
                            <div className="relatorio-tabela-container">
                                <table className="relatorio-tabela">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nome</th>
                                            <th>Fabricante</th>
                                            <th>Nº de série</th>
                                            <th>Localização</th>
                                            <th>Qualificação</th>
                                            <th>Manutenção</th>
                                            <th>Situação</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {equipamentos.map((equipamento) => (
                                            <tr key={equipamento.id}>
                                                <td>{equipamento.codigo}</td>
                                                <td>{equipamento.nome}</td>
                                                <td>{equipamento.fabricante || '-'}</td>
                                                <td>{equipamento.numero_serie || '-'}</td>
                                                <td>{equipamento.localizacao || '-'}</td>
                                                <td>
                                                    {equipamento.status_qualificacao || '-'}
                                                </td>
                                                <td>
                                                    {equipamento.status_manutencao || '-'}
                                                </td>
                                                <td>
                                                    {equipamento.ativo ? 'Ativo' : 'Inativo'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="relatorio-card relatorio-painel relatorio-manutencoes-card">
                <button
                    type="button"
                    className="relatorio-painel-cabecalho"
                    onClick={() => alternarPainel('manutencoes')}
                    aria-expanded={paineisAbertos.manutencoes}
                >
                    <span className="relatorio-painel-titulo">
                        <h3>Relatório de Manutenções</h3>
                        <p>
                            {manutencoes.length} manutenção(ões) encontrada(s).
                        </p>
                    </span>

                    <span
                        className={`relatorio-painel-icone ${paineisAbertos.manutencoes ? 'aberto' : ''
                            }`}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>

                {paineisAbertos.manutencoes && (
                    <div className="relatorio-painel-conteudo">
                        <form
                            className="relatorio-filtros"
                            onSubmit={(event) => {
                                event.preventDefault();
                                carregarManutencoes(filtrosManutencoes);
                            }}
                        >
                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_codigo">
                                    Código do equipamento
                                </label>
                                <input
                                    id="manutencao_codigo"
                                    type="text"
                                    value={filtrosManutencoes.codigo}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            codigo: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_nome">
                                    Nome do equipamento
                                </label>
                                <input
                                    id="manutencao_nome"
                                    type="text"
                                    value={filtrosManutencoes.nome}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            nome: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_tipo">
                                    Tipo de manutenção
                                </label>
                                <select
                                    id="manutencao_tipo"
                                    value={filtrosManutencoes.tipo}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            tipo: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="PREVENTIVA">Preventiva</option>
                                    <option value="CORRETIVA">Corretiva</option>
                                    <option value="CALIBRACAO">Calibração</option>
                                    <option value="OUTRA">Outra</option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_responsavel">
                                    Responsável
                                </label>
                                <input
                                    id="manutencao_responsavel"
                                    type="text"
                                    value={filtrosManutencoes.responsavel}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            responsavel: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_resultado">
                                    Resultado
                                </label>
                                <select
                                    id="manutencao_resultado"
                                    value={filtrosManutencoes.resultado}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            resultado: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="REPROVADO">Reprovado</option>
                                    <option value="APROVADO_COM_RESTRICAO">
                                        Aprovado com restrição
                                    </option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_data">
                                    Data da manutenção
                                </label>
                                <input
                                    id="manutencao_data"
                                    type="date"
                                    value={filtrosManutencoes.data_manutencao}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            data_manutencao: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_proxima">
                                    Próxima manutenção
                                </label>
                                <input
                                    id="manutencao_proxima"
                                    type="date"
                                    value={filtrosManutencoes.proxima_manutencao}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            proxima_manutencao: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="manutencao_status">Status</label>
                                <select
                                    id="manutencao_status"
                                    value={filtrosManutencoes.status}
                                    onChange={(event) =>
                                        setFiltrosManutencoes((anterior) => ({
                                            ...anterior,
                                            status: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="VENCIDA">Vencida</option>
                                    <option value="PRÓXIMA">Próxima</option>
                                    <option value="EM DIA">Em dia</option>
                                </select>
                            </div>

                            <div className="relatorio-acoes">
                                <button
                                    type="button"
                                    className="botao-relatorio botao-secundario"
                                    onClick={() => {
                                        const filtrosLimpos = {
                                            codigo: '',
                                            nome: '',
                                            tipo: '',
                                            responsavel: '',
                                            resultado: '',
                                            data_manutencao: '',
                                            proxima_manutencao: '',
                                            status: ''
                                        };

                                        setFiltrosManutencoes(filtrosLimpos);
                                        carregarManutencoes(filtrosLimpos);
                                    }}
                                    disabled={carregandoManutencoes}
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="submit"
                                    className="botao-relatorio botao-principal"
                                    disabled={carregandoManutencoes}
                                >
                                    {carregandoManutencoes
                                        ? 'Carregando...'
                                        : 'Gerar relatório'}
                                </button>
                            </div>
                        </form>

                        {erroManutencoes && (
                            <div className="mensagem-relatorio mensagem-erro">
                                {erroManutencoes}
                            </div>
                        )}

                        {carregandoManutencoes ? (
                            <div className="relatorio-vazio">
                                Carregando manutenções...
                            </div>
                        ) : manutencoes.length === 0 ? (
                            <div className="relatorio-vazio">
                                Nenhuma manutenção encontrada.
                            </div>
                        ) : (
                            <div className="relatorio-tabela-container">
                                <table className="relatorio-tabela">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Equipamento</th>
                                            <th>Tipo</th>
                                            <th>Data da manutenção</th>
                                            <th>Próxima manutenção</th>
                                            <th>Responsável</th>
                                            <th>Resultado</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {manutencoes.map((manutencao) => (
                                            <tr key={manutencao.id}>
                                                <td>{manutencao.codigo}</td>
                                                <td>{manutencao.nome}</td>
                                                <td>{manutencao.tipo}</td>
                                                <td>
                                                    {manutencao.data_manutencao
                                                        ? new Date(
                                                            manutencao.data_manutencao
                                                        ).toLocaleDateString('pt-BR', {
                                                            timeZone: 'UTC'
                                                        })
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {manutencao.proxima_manutencao
                                                        ? new Date(
                                                            manutencao.proxima_manutencao
                                                        ).toLocaleDateString('pt-BR', {
                                                            timeZone: 'UTC'
                                                        })
                                                        : '-'}
                                                </td>
                                                <td>{manutencao.responsavel || '-'}</td>
                                                <td>
                                                    {manutencao.resultado ===
                                                        'APROVADO_COM_RESTRICAO'
                                                        ? 'Aprovado com restrição'
                                                        : manutencao.resultado || '-'}
                                                </td>
                                                <td>{manutencao.status || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </section>



        </div>
    );
}

export default Relatorios;