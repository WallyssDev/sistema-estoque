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
    const [qualificacoes, setQualificacoes] = useState([]);
    const [carregandoQualificacoes, setCarregandoQualificacoes] = useState(false);
    const [erroQualificacoes, setErroQualificacoes] = useState('');
    const [operacionais, setOperacionais] = useState([]);
    const [carregandoOperacionais, setCarregandoOperacionais] = useState(false);
    const [erroOperacionais, setErroOperacionais] = useState('');
    const [regulatorios, setRegulatorios] = useState([]);
    const [carregandoRegulatorios, setCarregandoRegulatorios] = useState(false);
    const [erroRegulatorios, setErroRegulatorios] = useState('');

    const [filtrosRegulatorios, setFiltrosRegulatorios] = useState({
        codigo: '',
        nome: '',
        registro_anvisa_ms: '',
        situacao_regulatoria: '',
        data_registro: '',
        data_validade: '',
        fabricante_legal: '',
        detentor_registro: '',
        status_validade: ''
    });




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

    const [filtrosQualificacoes, setFiltrosQualificacoes] = useState({
        codigo: '',
        nome: '',
        tipo: '',
        responsavel: '',
        resultado: '',
        data_qualificacao: '',
        proxima_qualificacao: '',
        status: ''
    });


    const [filtrosOperacionais, setFiltrosOperacionais] = useState({
        codigo: '',
        nome: '',
        modelo: '',
        numero_patrimonio_fase: '',
        registro_anvisa_ms: '',
        unidade: '',
        sala: '',
        data_aquisicao: '',
        status_operacional: '',
        frequencia_manutencao_interna: '',
        frequencia_manutencao_externa: ''
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


    const carregarQualificacoes = async (filtrosAtuais = filtrosQualificacoes) => {
        try {
            setCarregandoQualificacoes(true);
            setErroQualificacoes('');

            const parametros = {};

            Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
                if (valor !== '') {
                    parametros[chave] = valor;
                }
            });

            const resposta = await api.get('/relatorios/qualificacoes', {
                params: parametros
            });

            setQualificacoes(resposta.data.qualificacoes || []);
        } catch (error) {
            console.error(
                'Erro ao carregar relatório de qualificações:',
                error
            );

            setQualificacoes([]);

            setErroQualificacoes(
                error.response?.data?.mensagem ||
                'Erro ao carregar relatório de qualificações.'
            );
        } finally {
            setCarregandoQualificacoes(false);
        }
    };

    const carregarOperacionais = async (filtrosAtuais = filtrosOperacionais) => {
        try {
            setCarregandoOperacionais(true);
            setErroOperacionais('');

            const parametros = {};

            Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
                if (valor !== '') {
                    parametros[chave] = valor;
                }
            });

            const resposta = await api.get('/relatorios/operacionais', {
                params: parametros
            });

            setOperacionais(resposta.data.operacionais || []);
        } catch (error) {
            console.error('Erro ao carregar relatório operacional:', error);
            setOperacionais([]);
            setErroOperacionais(
                error.response?.data?.mensagem ||
                'Erro ao carregar relatório operacional.'
            );
        } finally {
            setCarregandoOperacionais(false);
        }
    };


    const carregarRegulatorios = async (
        filtrosAtuais = filtrosRegulatorios
    ) => {
        try {
            setCarregandoRegulatorios(true);
            setErroRegulatorios('');

            const parametros = {};

            Object.entries(filtrosAtuais).forEach(([chave, valor]) => {
                if (valor !== '') {
                    parametros[chave] = valor;
                }
            });

            const resposta = await api.get('/relatorios/regulatorios', {
                params: parametros
            });

            setRegulatorios(resposta.data.regulatorios || []);
        } catch (error) {
            console.error(
                'Erro ao carregar relatório regulatório:',
                error
            );

            setRegulatorios([]);

            setErroRegulatorios(
                error.response?.data?.mensagem ||
                'Erro ao carregar relatório regulatório.'
            );
        } finally {
            setCarregandoRegulatorios(false);
        }
    };


    const exportarRegulatoriosExcel = () => {
        if (regulatorios.length === 0) {
            setErroRegulatorios('Não há registros regulatórios para exportar.');
            return;
        }

        try {
            const dataAtual = new Date();
            const dataArquivo = dataAtual.toISOString().slice(0, 10);
            const formatarData = (data) => data
                ? new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-';

            const bordaPadrao = {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } }
            };

            const estiloTitulo = {
                font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '111827' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
            const estiloSubtitulo = {
                font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '1F2937' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
            const estiloInformacao = {
                font: { sz: 10, color: { rgb: '4B5563' } },
                fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
                border: bordaPadrao
            };
            const estiloCabecalho = {
                font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '2563EB' } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: bordaPadrao
            };
            const estiloCelula = {
                font: { sz: 10, color: { rgb: '374151' } },
                alignment: { vertical: 'center', wrapText: true },
                border: bordaPadrao
            };
            const criarCelula = (valor, estilo = estiloCelula) => ({
                v: String(valor ?? '-'), t: 's', s: estilo
            });
            const filtrosAplicados = Object.entries({
                'Código': filtrosRegulatorios.codigo,
                'Equipamento': filtrosRegulatorios.nome,
                'Registro ANVISA/MS': filtrosRegulatorios.registro_anvisa_ms,
                'Situação regulatória': filtrosRegulatorios.situacao_regulatoria,
                'Data de registro': filtrosRegulatorios.data_registro,
                'Data de validade': filtrosRegulatorios.data_validade,
                'Fabricante legal': filtrosRegulatorios.fabricante_legal,
                'Detentor do registro': filtrosRegulatorios.detentor_registro,
                'Status da validade': filtrosRegulatorios.status_validade
            }).filter(([, valor]) => valor !== '').map(([campo, valor]) => `${campo}: ${valor}`);

            const cabecalhos = [
                'Código', 'Equipamento', 'Registro ANVISA/MS', 'Situação regulatória',
                'Data de registro', 'Data de validade', 'Status da validade',
                'Fabricante legal', 'Detentor do registro', 'Documento regulatório'
            ];
            const linhas = regulatorios.map((item) => {
                const status = String(item.status_validade || '').toUpperCase();
                let estiloStatus = estiloCelula;
                if (status === 'VIGENTE') {
                    estiloStatus = { ...estiloCelula, font: { bold: true, sz: 10, color: { rgb: '166534' } }, fill: { patternType: 'solid', fgColor: { rgb: 'DCFCE7' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
                } else if (status === 'VENCIDO') {
                    estiloStatus = { ...estiloCelula, font: { bold: true, sz: 10, color: { rgb: '991B1B' } }, fill: { patternType: 'solid', fgColor: { rgb: 'FEE2E2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
                } else if (status === 'VENCE EM 30 DIAS') {
                    estiloStatus = { ...estiloCelula, font: { bold: true, sz: 10, color: { rgb: '92400E' } }, fill: { patternType: 'solid', fgColor: { rgb: 'FEF3C7' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
                }

                return [
                    item.codigo || '-',
                    item.nome || '-',
                    item.registro_anvisa_ms || '-',
                    item.situacao_regulatoria || '-',
                    formatarData(item.data_registro),
                    formatarData(item.data_validade),
                    { valor: item.status_validade || '-', estilo: estiloStatus },
                    item.fabricante_legal || '-',
                    item.detentor_registro || '-',
                    item.documento_regulatorio || '-'
                ];
            });

            const totalColunas = cabecalhos.length;
            const linhaMesclada = (texto, estilo) => [
                criarCelula(texto, estilo),
                ...Array.from({ length: totalColunas - 1 }, () => criarCelula('', estilo))
            ];
            const dados = [
                linhaMesclada('SISTEMA DE CONTROLE DE ESTOQUE', estiloTitulo),
                linhaMesclada('RELATÓRIO REGULATÓRIO', estiloSubtitulo),
                linhaMesclada(`Gerado em: ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR')}`, estiloInformacao),
                linhaMesclada(`Total de registros: ${regulatorios.length}`, estiloInformacao),
                linhaMesclada(`Filtros aplicados: ${filtrosAplicados.length ? filtrosAplicados.join(' | ') : 'Nenhum'}`, estiloInformacao),
                cabecalhos.map((texto) => criarCelula(texto, estiloCabecalho)),
                ...linhas.map((linha) => linha.map((valor) =>
                    typeof valor === 'object' && valor !== null && 'valor' in valor
                        ? criarCelula(valor.valor, valor.estilo)
                        : criarCelula(valor)
                ))
            ];

            const planilha = XLSX.utils.aoa_to_sheet(dados);
            planilha['!merges'] = [0, 1, 2, 3, 4].map((linha) => ({
                s: { r: linha, c: 0 }, e: { r: linha, c: totalColunas - 1 }
            }));
            planilha['!cols'] = [
                { wch: 14 }, { wch: 30 }, { wch: 24 }, { wch: 24 }, { wch: 18 },
                { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 28 }, { wch: 32 }
            ];
            planilha['!rows'] = [
                { hpt: 30 }, { hpt: 24 }, { hpt: 22 }, { hpt: 22 }, { hpt: 36 },
                { hpt: 32 }, ...regulatorios.map(() => ({ hpt: 30 }))
            ];
            planilha['!autofilter'] = { ref: `A6:J${dados.length}` };

            const livro = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(livro, planilha, 'Regulatorio');
            XLSX.writeFile(livro, `Relatorio_Regulatorio_${dataArquivo}.xlsx`);
            setErroRegulatorios('');
        } catch (error) {
            console.error('Erro ao exportar relatório regulatório para Excel:', error);
            setErroRegulatorios('Erro ao exportar relatório regulatório para Excel.');
        }
    };

    const exportarRegulatoriosPDF = () => {
        if (regulatorios.length === 0) {
            setErroRegulatorios('Não há registros regulatórios para exportar.');
            return;
        }

        try {
            const documento = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const margem = 14;
            const larguraPagina = documento.internal.pageSize.getWidth();
            const alturaPagina = documento.internal.pageSize.getHeight();
            const larguraConteudo = larguraPagina - margem * 2;
            const azulEscuro = [17, 24, 39];
            const azulCabecalho = [37, 99, 235];
            const cinzaTexto = [71, 85, 105];
            const branco = [255, 255, 255];
            const dataArquivo = new Date().toISOString().slice(0, 10);
            const formatarData = (data) => data
                ? new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-';

            const filtrosAplicados = Object.entries({
                'Código': filtrosRegulatorios.codigo,
                'Equipamento': filtrosRegulatorios.nome,
                'Registro ANVISA/MS': filtrosRegulatorios.registro_anvisa_ms,
                'Situação regulatória': filtrosRegulatorios.situacao_regulatoria,
                'Data de registro': filtrosRegulatorios.data_registro,
                'Data de validade': filtrosRegulatorios.data_validade,
                'Fabricante legal': filtrosRegulatorios.fabricante_legal,
                'Detentor do registro': filtrosRegulatorios.detentor_registro,
                'Status da validade': filtrosRegulatorios.status_validade
            }).filter(([, valor]) => valor !== '').map(([campo, valor]) => `${campo}: ${valor}`);

            documento.setFillColor(...azulEscuro);
            documento.rect(margem, 10, larguraConteudo, 23, 'F');
            documento.setTextColor(...branco);
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(16);
            documento.text('SISTEMA DE CONTROLE DE ESTOQUE', larguraPagina / 2, 19, { align: 'center' });
            documento.setFontSize(12);
            documento.text('RELATÓRIO REGULATÓRIO', larguraPagina / 2, 27, { align: 'center' });

            documento.setTextColor(...cinzaTexto);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8.5);
            documento.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margem, 40);
            documento.text(`Total de registros: ${regulatorios.length}`, larguraPagina - margem, 40, { align: 'right' });
            documento.setFont('helvetica', 'bold');
            documento.text('Filtros aplicados:', margem, 48);
            documento.setFont('helvetica', 'normal');
            const textoFiltros = filtrosAplicados.length ? filtrosAplicados.join(' | ') : 'Nenhum';
            const linhasFiltros = documento.splitTextToSize(textoFiltros, larguraConteudo - 35);
            documento.text(linhasFiltros, margem + 30, 48);
            const inicioTabela = 53 + Math.max(0, (linhasFiltros.length - 1) * 4);

            const cabecalhos = [
                'Código', 'Equipamento', 'Registro ANVISA/MS', 'Situação regulatória',
                'Data de registro', 'Data de validade', 'Status da validade',
                'Fabricante legal', 'Detentor do registro', 'Documento regulatório'
            ];
            const linhas = regulatorios.map((item) => [
                item.codigo || '-',
                item.nome || '-',
                item.registro_anvisa_ms || '-',
                item.situacao_regulatoria || '-',
                formatarData(item.data_registro),
                formatarData(item.data_validade),
                item.status_validade || '-',
                item.fabricante_legal || '-',
                item.detentor_registro || '-',
                item.documento_regulatorio || '-'
            ]);

            autoTable(documento, {
                head: [cabecalhos],
                body: linhas,
                startY: inicioTabela,
                margin: { left: margem, right: margem, bottom: 14 },
                tableWidth: 'auto',
                theme: 'grid',
                styles: {
                    font: 'helvetica', fontSize: 6.5, textColor: [30, 41, 59],
                    cellPadding: 2, lineColor: [203, 213, 225], lineWidth: 0.2,
                    valign: 'middle', overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: azulCabecalho, textColor: branco, fontStyle: 'bold',
                    fontSize: 7, halign: 'center', valign: 'middle'
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                didParseCell: (dados) => {
                    if (dados.section !== 'body') return;
                    const coluna = dados.column.index;
                    const status = String(dados.cell.raw || '').toUpperCase();
                    if (coluna === 6) {
                        if (status === 'VIGENTE') {
                            dados.cell.styles.fillColor = [220, 252, 231];
                            dados.cell.styles.textColor = [22, 101, 52];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (status === 'VENCIDO') {
                            dados.cell.styles.fillColor = [254, 226, 226];
                            dados.cell.styles.textColor = [153, 27, 27];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (status === 'VENCE EM 30 DIAS') {
                            dados.cell.styles.fillColor = [254, 243, 199];
                            dados.cell.styles.textColor = [146, 64, 14];
                            dados.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            const totalPaginas = documento.internal.getNumberOfPages();
            for (let pagina = 1; pagina <= totalPaginas; pagina++) {
                documento.setPage(pagina);
                documento.setDrawColor(203, 213, 225);
                documento.setLineWidth(0.2);
                documento.line(margem, alturaPagina - 10, larguraPagina - margem, alturaPagina - 10);
                documento.setFont('helvetica', 'normal');
                documento.setFontSize(7);
                documento.setTextColor(...cinzaTexto);
                documento.text('Sistema de Controle de Estoque', margem, alturaPagina - 4);
                documento.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - margem, alturaPagina - 4, { align: 'right' });
            }

            documento.save(`Relatorio_Regulatorio_${dataArquivo}.pdf`);
            setErroRegulatorios('');
        } catch (error) {
            console.error('Erro ao exportar relatório regulatório para PDF:', error);
            setErroRegulatorios('Erro ao exportar relatório regulatório para PDF.');
        }
    };


    const exportarOperacionaisExcel = () => {
        if (operacionais.length === 0) {
            setErroOperacionais('Não há registros operacionais para exportar.');
            return;
        }

        try {
            const dataAtual = new Date();
            const dataArquivo = dataAtual.toISOString().slice(0, 10);

            const bordaPadrao = {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } }
            };

            const estiloTitulo = {
                font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '111827' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };

            const estiloSubtitulo = {
                font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '1F2937' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };

            const estiloInformacao = {
                font: { sz: 10, color: { rgb: '4B5563' } },
                fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
                alignment: { horizontal: 'left', vertical: 'center' },
                border: bordaPadrao
            };

            const estiloCabecalho = {
                font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
                fill: { patternType: 'solid', fgColor: { rgb: '2563EB' } },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                border: bordaPadrao
            };

            const estiloCelula = {
                font: { sz: 10, color: { rgb: '374151' } },
                alignment: { vertical: 'center', wrapText: true },
                border: bordaPadrao
            };

            const formatarData = (data) => {
                if (!data) return '-';

                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const filtrosAplicados = Object.entries({
                'Código': filtrosOperacionais.codigo,
                'Equipamento': filtrosOperacionais.nome,
                'Modelo': filtrosOperacionais.modelo,
                'Patrimônio': filtrosOperacionais.numero_patrimonio_fase,
                'Registro ANVISA': filtrosOperacionais.registro_anvisa_ms,
                'Unidade': filtrosOperacionais.unidade,
                'Sala': filtrosOperacionais.sala,
                'Data de aquisição': filtrosOperacionais.data_aquisicao,
                'Status': filtrosOperacionais.status_operacional,
                'Manutenção interna': filtrosOperacionais.frequencia_manutencao_interna,
                'Manutenção externa': filtrosOperacionais.frequencia_manutencao_externa
            })
                .filter(([, valor]) => valor !== '')
                .map(([campo, valor]) => `${campo}: ${valor}`);

            const cabecalhos = [
                'Código',
                'Equipamento',
                'Modelo',
                'Patrimônio',
                'Registro ANVISA',
                'Unidade',
                'Sala',
                'Data de aquisição',
                'Status',
                'Manutenção interna',
                'Manutenção externa'
            ];

            const linhas = operacionais.map((item) => [
                item.codigo || '-',
                item.nome || '-',
                item.modelo || '-',
                item.numero_patrimonio_fase || '-',
                item.registro_anvisa_ms || '-',
                item.unidade || '-',
                item.sala || '-',
                formatarData(item.data_aquisicao),
                item.status_operacional || '-',
                item.frequencia_manutencao_interna || '-',
                item.frequencia_manutencao_externa || '-'
            ].map((valor) => ({
                v: valor,
                t: 's',
                s: estiloCelula
            })));

            const totalColunas = cabecalhos.length;

            const linhaMesclada = (texto, estilo) => [
                { v: texto, t: 's', s: estilo },
                ...Array.from({ length: totalColunas - 1 }, () => ({
                    v: '',
                    t: 's',
                    s: estilo
                }))
            ];

            const dados = [
                linhaMesclada('SISTEMA DE CONTROLE DE ESTOQUE', estiloTitulo),
                linhaMesclada('RELATÓRIO OPERACIONAL', estiloSubtitulo),
                linhaMesclada(
                    `Gerado em: ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR')}`,
                    estiloInformacao
                ),
                linhaMesclada(`Total de registros: ${operacionais.length}`, estiloInformacao),
                linhaMesclada(
                    `Filtros aplicados: ${filtrosAplicados.length ? filtrosAplicados.join(' | ') : 'Nenhum'}`,
                    estiloInformacao
                ),
                cabecalhos.map((texto) => ({
                    v: texto,
                    t: 's',
                    s: estiloCabecalho
                })),
                ...linhas
            ];

            const planilha = XLSX.utils.aoa_to_sheet(dados);

            planilha['!merges'] = [0, 1, 2, 3, 4].map((linha) => ({
                s: { r: linha, c: 0 },
                e: { r: linha, c: totalColunas - 1 }
            }));

            planilha['!cols'] = [
                { wch: 14 },
                { wch: 28 },
                { wch: 25 },
                { wch: 22 },
                { wch: 24 },
                { wch: 28 },
                { wch: 22 },
                { wch: 22 },
                { wch: 20 },
                { wch: 24 },
                { wch: 24 }
            ];

            planilha['!rows'] = [
                { hpt: 30 },
                { hpt: 24 },
                { hpt: 22 },
                { hpt: 22 },
                { hpt: 36 },
                { hpt: 30 },
                ...operacionais.map(() => ({ hpt: 24 }))
            ];

            planilha['!autofilter'] = {
                ref: `A6:K${dados.length}`
            };

            const livro = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(livro, planilha, 'Operacional');

            XLSX.writeFile(
                livro,
                `Relatorio_Operacional_${dataArquivo}.xlsx`
            );

            setErroOperacionais('');
            mostrarMensagem('Relatório Excel operacional exportado com sucesso.');
        } catch (error) {
            console.error('Erro ao exportar relatório operacional para Excel:', error);
            setErroOperacionais('Erro ao exportar relatório operacional para Excel.');
        }
    };

    const exportarOperacionaisPDF = () => {
        if (operacionais.length === 0) {
            setErroOperacionais('Não há registros operacionais para exportar.');
            return;
        }

        try {
            const documento = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const margem = 14;
            const larguraPagina = documento.internal.pageSize.getWidth();
            const alturaPagina = documento.internal.pageSize.getHeight();
            const larguraConteudo = larguraPagina - margem * 2;
            const azulEscuro = [17, 24, 39];
            const azulCabecalho = [37, 99, 235];
            const cinzaTexto = [71, 85, 105];
            const branco = [255, 255, 255];

            const formatarData = (data) => {
                if (!data) return '-';
                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const filtrosAplicados = Object.entries({
                'Código': filtrosOperacionais.codigo,
                'Equipamento': filtrosOperacionais.nome,
                'Modelo': filtrosOperacionais.modelo,
                'Patrimônio': filtrosOperacionais.numero_patrimonio_fase,
                'Registro ANVISA': filtrosOperacionais.registro_anvisa_ms,
                'Unidade': filtrosOperacionais.unidade,
                'Sala': filtrosOperacionais.sala,
                'Data de aquisição': filtrosOperacionais.data_aquisicao,
                'Status': filtrosOperacionais.status_operacional,
                'Manutenção interna': filtrosOperacionais.frequencia_manutencao_interna,
                'Manutenção externa': filtrosOperacionais.frequencia_manutencao_externa
            })
                .filter(([, valor]) => valor !== '')
                .map(([campo, valor]) => `${campo}: ${valor}`);

            documento.setFillColor(...azulEscuro);
            documento.rect(margem, 10, larguraConteudo, 23, 'F');
            documento.setTextColor(...branco);
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(16);
            documento.text('SISTEMA DE CONTROLE DE ESTOQUE', larguraPagina / 2, 19, {
                align: 'center'
            });
            documento.setFontSize(12);
            documento.text('RELATÓRIO OPERACIONAL', larguraPagina / 2, 27, {
                align: 'center'
            });

            documento.setTextColor(...cinzaTexto);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8.5);
            documento.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margem, 40);
            documento.text(`Total de registros: ${operacionais.length}`, larguraPagina - margem, 40, {
                align: 'right'
            });
            documento.setFont('helvetica', 'bold');
            documento.text('Filtros aplicados:', margem, 48);
            documento.setFont('helvetica', 'normal');
            const textoFiltros = filtrosAplicados.length
                ? filtrosAplicados.join(' | ')
                : 'Nenhum';
            const linhasFiltros = documento.splitTextToSize(textoFiltros, larguraConteudo - 35);
            documento.text(linhasFiltros, margem + 30, 48);
            const inicioTabela = 53 + Math.max(0, (linhasFiltros.length - 1) * 4);

            const cabecalhos = [
                'Código', 'Equipamento', 'Modelo', 'Patrimônio',
                'Registro ANVISA', 'Unidade', 'Sala', 'Data de aquisição',
                'Status', 'Manutenção interna', 'Manutenção externa'
            ];
            const linhas = operacionais.map((item) => [
                item.codigo || '-',
                item.nome || '-',
                item.modelo || '-',
                item.numero_patrimonio_fase || '-',
                item.registro_anvisa_ms || '-',
                item.unidade || '-',
                item.sala || '-',
                formatarData(item.data_aquisicao),
                item.status_operacional || '-',
                item.frequencia_manutencao_interna || '-',
                item.frequencia_manutencao_externa || '-'
            ]);

            autoTable(documento, {
                head: [cabecalhos],
                body: linhas,
                startY: inicioTabela,
                margin: { left: margem, right: margem, bottom: 14 },
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 6.5,
                    textColor: [30, 41, 59],
                    cellPadding: 2,
                    lineColor: [203, 213, 225],
                    lineWidth: 0.2,
                    valign: 'middle',
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: azulCabecalho,
                    textColor: branco,
                    fontStyle: 'bold',
                    fontSize: 7,
                    halign: 'center',
                    valign: 'middle'
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                columnStyles: {
                    0: { cellWidth: 17 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 24 },
                    4: { cellWidth: 27 },
                    5: { cellWidth: 29 },
                    6: { cellWidth: 20 },
                    7: { cellWidth: 23 },
                    8: { cellWidth: 19 },
                    9: { cellWidth: 25 },
                    10: { cellWidth: 25 }
                },
                didParseCell: (dados) => {
                    if (dados.section !== 'body' || dados.column.index !== 8) return;
                    const status = String(dados.cell.raw || '').toUpperCase();
                    if (status === 'ATIVO') {
                        dados.cell.styles.fillColor = [220, 252, 231];
                        dados.cell.styles.textColor = [22, 101, 52];
                        dados.cell.styles.fontStyle = 'bold';
                    } else if (status === 'INATIVO') {
                        dados.cell.styles.fillColor = [254, 226, 226];
                        dados.cell.styles.textColor = [185, 28, 28];
                        dados.cell.styles.fontStyle = 'bold';
                    } else if (status === 'EM MANUTENÇÃO') {
                        dados.cell.styles.fillColor = [254, 243, 199];
                        dados.cell.styles.textColor = [154, 52, 18];
                        dados.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            const totalPaginas = documento.internal.getNumberOfPages();
            for (let pagina = 1; pagina <= totalPaginas; pagina++) {
                documento.setPage(pagina);
                documento.setDrawColor(203, 213, 225);
                documento.setLineWidth(0.2);
                documento.line(margem, alturaPagina - 10, larguraPagina - margem, alturaPagina - 10);
                documento.setFont('helvetica', 'normal');
                documento.setFontSize(7);
                documento.setTextColor(...cinzaTexto);
                documento.text('Sistema de Controle de Estoque', margem, alturaPagina - 4);
                documento.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - margem, alturaPagina - 4, {
                    align: 'right'
                });
            }

            const dataArquivo = new Date().toISOString().slice(0, 10);
            documento.save(`Relatorio_Operacional_${dataArquivo}.pdf`);
            setErroOperacionais('');
            mostrarMensagem('Relatório PDF operacional exportado com sucesso.');
        } catch (error) {
            console.error('Erro ao exportar relatório operacional para PDF:', error);
            setErroOperacionais('Erro ao exportar relatório operacional para PDF.');
        }
    };

    useEffect(() => {
        carregarEquipamentos();
        carregarManutencoes();
        carregarQualificacoes();
        carregarOperacionais();
        carregarRegulatorios();
    }, []);

    const handleFiltroChange = (evento) => {
        const { name, value } = evento.target;

        setFiltros((estadoAtual) => ({
            ...estadoAtual,
            [name]: value
        }));
    };

    const handleFiltroOperacionaisChange = (evento) => {
        const { name, value } = evento.target;

        setFiltrosOperacionais((estadoAtual) => ({
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
                // Larguras ajustadas para ocupar a mesma largura útil do relatório de Qualificações.
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 40 },
                2: { cellWidth: 31 },
                3: { cellWidth: 28 },
                4: { cellWidth: 43 },
                5: { cellWidth: 36, halign: 'center' },
                6: { cellWidth: 35, halign: 'center' },
                7: { cellWidth: 36, halign: 'center' }
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
             * Filtros aplicados
             */

            const filtrosAplicados = [];

            if (filtros.codigo?.trim()) filtrosAplicados.push(`Código: ${filtros.codigo.trim()}`);
            if (filtros.nome?.trim()) filtrosAplicados.push(`Nome: ${filtros.nome.trim()}`);
            if (filtros.fabricante?.trim()) filtrosAplicados.push(`Fabricante: ${filtros.fabricante.trim()}`);
            if (filtros.localizacao?.trim()) filtrosAplicados.push(`Localização: ${filtros.localizacao.trim()}`);
            if (filtros.status_qualificacao) filtrosAplicados.push(`Qualificação: ${filtros.status_qualificacao}`);
            if (filtros.status_manutencao) filtrosAplicados.push(`Manutenção: ${filtros.status_manutencao}`);
            if (filtros.ativo !== '') filtrosAplicados.push(`Situação: ${filtros.ativo === 'true' ? 'Ativos' : 'Inativos'}`);

            dados.push([
                criarCelula(
                    `Filtros aplicados: ${filtrosAplicados.length ? filtrosAplicados.join(' | ') : 'Todos os equipamentos'}`,
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
                },
                {
                    s: { r: 4, c: 0 },
                    e: { r: 4, c: 7 }
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
                { hpt: 30 }
            ];

            /*
             * =========================
             * FILTRO NATIVO DO EXCEL
             * =========================
             */

            const ultimaLinha = dados.length;

            planilha['!autofilter'] = {
                ref: `A5:H${ultimaLinha}`
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



    const exportarManutencoesExcel = () => {
        if (manutencoes.length === 0) {
            setErroManutencoes('Não há manutenções para exportar.');
            return;
        }

        try {
            const dataAtual = new Date();
            const dataArquivo = dataAtual.toISOString().slice(0, 10);

            const bordaPadrao = {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } }
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
                },
                border: bordaPadrao
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

            const estiloStatusBase = {
                ...estiloCelula,
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };

            const formatarData = (data) => {
                if (!data) return '-';

                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const linhas = manutencoes.map((manutencao) => {
                let estiloStatus = estiloStatusBase;

                if (manutencao.status === 'VENCIDA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        }
                    };
                } else if (manutencao.status === 'PRÓXIMA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '92400E' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEF3C7' }
                        }
                    };
                } else if (manutencao.status === 'EM DIA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        }
                    };
                }

                let estiloResultado = estiloCelula;

                if (manutencao.resultado === 'APROVADO') {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        }
                    };
                } else if (manutencao.resultado === 'REPROVADO') {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        }
                    };
                } else if (
                    manutencao.resultado === 'APROVADO_COM_RESTRICAO'
                ) {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '92400E' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEF3C7' }
                        }
                    };
                }

                return [
                    {
                        v: manutencao.codigo || '-',
                        t: 's',
                        s: {
                            ...estiloCelula,
                            font: {
                                bold: true,
                                sz: 10,
                                color: { rgb: '111827' }
                            }
                        }
                    },
                    {
                        v: manutencao.nome || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: manutencao.tipo || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: formatarData(manutencao.data_manutencao),
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: formatarData(manutencao.proxima_manutencao),
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: manutencao.responsavel || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: manutencao.resultado === 'APROVADO_COM_RESTRICAO'
                            ? 'Aprovado com restrição'
                            : manutencao.resultado === 'APROVADO'
                                ? 'Aprovado'
                                : manutencao.resultado === 'REPROVADO'
                                    ? 'Reprovado'
                                    : manutencao.resultado || '-',
                        t: 's',
                        s: estiloResultado
                    },
                    {
                        v: manutencao.status || '-',
                        t: 's',
                        s: estiloStatus
                    }
                ];
            });

            const dados = [
                [
                    {
                        v: 'SISTEMA DE CONTROLE DE ESTOQUE',
                        t: 's',
                        s: estiloTitulo
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloTitulo
                    }))
                ],
                [
                    {
                        v: 'RELATÓRIO DE MANUTENÇÕES',
                        t: 's',
                        s: estiloSubtitulo
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloSubtitulo
                    }))
                ],
                [
                    {
                        v: `Gerado em: ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR')}`,
                        t: 's',
                        s: estiloInformacao
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloInformacao
                    }))
                ],
                [
                    {
                        v: `Total de manutenções: ${manutencoes.length}`,
                        t: 's',
                        s: estiloInformacao
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloInformacao
                    }))
                ],
                [
                    { v: 'Código', t: 's', s: estiloCabecalho },
                    { v: 'Equipamento', t: 's', s: estiloCabecalho },
                    { v: 'Tipo', t: 's', s: estiloCabecalho },
                    { v: 'Data da manutenção', t: 's', s: estiloCabecalho },
                    { v: 'Próxima manutenção', t: 's', s: estiloCabecalho },
                    { v: 'Responsável', t: 's', s: estiloCabecalho },
                    { v: 'Resultado', t: 's', s: estiloCabecalho },
                    { v: 'Status', t: 's', s: estiloCabecalho }
                ],
                ...linhas
            ];

            const planilha = XLSX.utils.aoa_to_sheet(dados);

            planilha['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
            ];

            planilha['!cols'] = [
                { wch: 14 },
                { wch: 32 },
                { wch: 18 },
                { wch: 22 },
                { wch: 22 },
                { wch: 28 },
                { wch: 30 },
                { wch: 18 }
            ];

            planilha['!rows'] = [
                { hpt: 30 },
                { hpt: 24 },
                { hpt: 22 },
                { hpt: 22 },
                { hpt: 30 },
                ...manutencoes.map(() => ({ hpt: 22 }))
            ];

            planilha['!autofilter'] = {
                ref: `A5:H${dados.length}`
            };

            const livro = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                livro,
                planilha,
                'Manutenções'
            );

            XLSX.writeFile(
                livro,
                `Relatorio_Manutencoes_${dataArquivo}.xlsx`
            );

            setErroManutencoes('');
            mostrarMensagem(
                'Relatório Excel de manutenções exportado com sucesso.'
            );
        } catch (error) {
            console.error(
                'Erro ao exportar relatório de manutenções:',
                error
            );

            setErroManutencoes(
                'Erro ao exportar relatório de manutenções.'
            );
        }
    };


    const exportarQualificacoesExcel = () => {
        if (qualificacoes.length === 0) {
            setErroQualificacoes(
                'Não há qualificações para exportar.'
            );
            return;
        }

        try {
            const dataAtual = new Date();
            const dataArquivo = dataAtual.toISOString().slice(0, 10);

            const bordaPadrao = {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } }
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
                },
                border: bordaPadrao
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

            const estiloStatusBase = {
                ...estiloCelula,
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };

            const formatarData = (data) => {
                if (!data) return '-';

                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const formatarResultado = (resultado) => {
                if (resultado === 'APROVADO_COM_RESTRICAO') {
                    return 'Aprovado com restrição';
                }

                if (resultado === 'APROVADO') return 'Aprovado';
                if (resultado === 'REPROVADO') return 'Reprovado';

                return resultado || '-';
            };

            const linhas = qualificacoes.map((qualificacao) => {
                let estiloResultado = estiloStatusBase;

                if (qualificacao.resultado === 'APROVADO') {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        }
                    };
                } else if (qualificacao.resultado === 'REPROVADO') {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        }
                    };
                } else if (
                    qualificacao.resultado === 'APROVADO_COM_RESTRICAO'
                ) {
                    estiloResultado = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '92400E' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEF3C7' }
                        }
                    };
                }

                let estiloStatus = estiloStatusBase;

                if (qualificacao.status === 'VENCIDA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '991B1B' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEE2E2' }
                        }
                    };
                } else if (qualificacao.status === 'PRÓXIMA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '92400E' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'FEF3C7' }
                        }
                    };
                } else if (qualificacao.status === 'EM DIA') {
                    estiloStatus = {
                        ...estiloStatusBase,
                        font: {
                            bold: true,
                            sz: 10,
                            color: { rgb: '166534' }
                        },
                        fill: {
                            patternType: 'solid',
                            fgColor: { rgb: 'DCFCE7' }
                        }
                    };
                }

                return [
                    {
                        v: qualificacao.codigo || '-',
                        t: 's',
                        s: {
                            ...estiloCelula,
                            font: {
                                bold: true,
                                sz: 10,
                                color: { rgb: '111827' }
                            }
                        }
                    },
                    {
                        v: qualificacao.nome || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: qualificacao.tipo || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: formatarData(qualificacao.data_qualificacao),
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: formatarData(qualificacao.proxima_qualificacao),
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: qualificacao.responsavel || '-',
                        t: 's',
                        s: estiloCelula
                    },
                    {
                        v: formatarResultado(qualificacao.resultado),
                        t: 's',
                        s: estiloResultado
                    },
                    {
                        v: qualificacao.status || '-',
                        t: 's',
                        s: estiloStatus
                    }
                ];
            });

            const dados = [
                [
                    {
                        v: 'SISTEMA DE CONTROLE DE ESTOQUE',
                        t: 's',
                        s: estiloTitulo
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloTitulo
                    }))
                ],
                [
                    {
                        v: 'RELATÓRIO DE QUALIFICAÇÕES',
                        t: 's',
                        s: estiloSubtitulo
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloSubtitulo
                    }))
                ],
                [
                    {
                        v: `Gerado em: ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR')}`,
                        t: 's',
                        s: estiloInformacao
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloInformacao
                    }))
                ],
                [
                    {
                        v: `Total de qualificações: ${qualificacoes.length}`,
                        t: 's',
                        s: estiloInformacao
                    },
                    ...Array.from({ length: 7 }, () => ({
                        v: '',
                        t: 's',
                        s: estiloInformacao
                    }))
                ],
                [
                    { v: 'Código', t: 's', s: estiloCabecalho },
                    { v: 'Equipamento', t: 's', s: estiloCabecalho },
                    { v: 'Tipo', t: 's', s: estiloCabecalho },
                    { v: 'Data da qualificação', t: 's', s: estiloCabecalho },
                    { v: 'Próxima qualificação', t: 's', s: estiloCabecalho },
                    { v: 'Responsável', t: 's', s: estiloCabecalho },
                    { v: 'Resultado', t: 's', s: estiloCabecalho },
                    { v: 'Status', t: 's', s: estiloCabecalho }
                ],
                ...linhas
            ];

            const planilha = XLSX.utils.aoa_to_sheet(dados);

            planilha['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }
            ];

            planilha['!cols'] = [
                { wch: 14 },
                { wch: 32 },
                { wch: 22 },
                { wch: 24 },
                { wch: 24 },
                { wch: 28 },
                { wch: 30 },
                { wch: 22 }
            ];

            planilha['!rows'] = [
                { hpt: 30 },
                { hpt: 24 },
                { hpt: 22 },
                { hpt: 22 },
                { hpt: 30 },
                ...qualificacoes.map(() => ({ hpt: 22 }))
            ];

            planilha['!autofilter'] = {
                ref: `A5:H${dados.length}`
            };

            const livro = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                livro,
                planilha,
                'Qualificações'
            );

            XLSX.writeFile(
                livro,
                `Relatorio_Qualificacoes_${dataArquivo}.xlsx`
            );

            setErroQualificacoes('');
            mostrarMensagem(
                'Relatório Excel de qualificações exportado com sucesso.'
            );
        } catch (error) {
            console.error(
                'Erro ao exportar relatório de qualificações:',
                error
            );

            setErroQualificacoes(
                'Erro ao exportar relatório Excel de qualificações.'
            );
        }
    };


    const exportarQualificacoesPDF = () => {
        if (qualificacoes.length === 0) {
            setErroQualificacoes('Não há qualificações para exportar.');
            return;
        }

        try {
            const documento = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const margem = 14;
            const larguraPagina = documento.internal.pageSize.getWidth();
            const alturaPagina = documento.internal.pageSize.getHeight();
            const larguraConteudo = larguraPagina - margem * 2;

            const azulEscuro = [17, 24, 39];
            const azulCabecalho = [37, 99, 235];
            const cinzaTexto = [71, 85, 105];
            const branco = [255, 255, 255];

            const formatarData = (data) => {
                if (!data) return '-';

                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const formatarResultado = (resultado) => {
                if (resultado === 'APROVADO_COM_RESTRICAO') {
                    return 'Aprovado com restrição';
                }

                if (resultado === 'APROVADO') return 'Aprovado';
                if (resultado === 'REPROVADO') return 'Reprovado';

                return resultado || '-';
            };

            const filtrosAplicados = [];

            if (filtrosQualificacoes.codigo?.trim()) {
                filtrosAplicados.push(
                    `Código: ${filtrosQualificacoes.codigo.trim()}`
                );
            }

            if (filtrosQualificacoes.nome?.trim()) {
                filtrosAplicados.push(
                    `Equipamento: ${filtrosQualificacoes.nome.trim()}`
                );
            }

            if (filtrosQualificacoes.tipo) {
                filtrosAplicados.push(
                    `Tipo: ${filtrosQualificacoes.tipo}`
                );
            }

            if (filtrosQualificacoes.responsavel?.trim()) {
                filtrosAplicados.push(
                    `Responsável: ${filtrosQualificacoes.responsavel.trim()}`
                );
            }

            if (filtrosQualificacoes.resultado) {
                filtrosAplicados.push(
                    `Resultado: ${formatarResultado(filtrosQualificacoes.resultado)}`
                );
            }

            if (filtrosQualificacoes.data_qualificacao) {
                filtrosAplicados.push(
                    `Data da qualificação: ${formatarData(filtrosQualificacoes.data_qualificacao)}`
                );
            }

            if (filtrosQualificacoes.proxima_qualificacao) {
                filtrosAplicados.push(
                    `Próxima qualificação: ${formatarData(filtrosQualificacoes.proxima_qualificacao)}`
                );
            }

            if (filtrosQualificacoes.status) {
                filtrosAplicados.push(
                    `Status: ${filtrosQualificacoes.status}`
                );
            }

            // Cabeçalho
            documento.setFillColor(...azulEscuro);
            documento.rect(margem, 10, larguraConteudo, 23, 'F');

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
                'RELATÓRIO DE QUALIFICAÇÕES',
                larguraPagina / 2,
                27,
                { align: 'center' }
            );

            // Data e total
            documento.setTextColor(...cinzaTexto);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8.5);

            documento.text(
                `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
                margem,
                40
            );

            documento.text(
                `Total de qualificações: ${qualificacoes.length}`,
                larguraPagina - margem,
                40,
                { align: 'right' }
            );

            // Filtros aplicados
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(8.5);
            documento.setTextColor(...azulEscuro);

            documento.text('Filtros aplicados:', margem, 48);

            documento.setFont('helvetica', 'normal');
            documento.setTextColor(...cinzaTexto);

            const textoFiltros = filtrosAplicados.length > 0
                ? filtrosAplicados.join(' | ')
                : 'Todas as qualificações';

            const linhasFiltros = documento.splitTextToSize(
                textoFiltros,
                larguraConteudo - 35
            );

            documento.text(linhasFiltros, margem + 30, 48);

            const inicioTabela =
                51 + Math.max(0, (linhasFiltros.length - 1) * 4);

            // Dados da tabela
            const cabecalho = [
                'Código',
                'Equipamento',
                'Tipo',
                'Data da qualificação',
                'Próxima qualificação',
                'Responsável',
                'Resultado',
                'Status'
            ];

            const linhas = qualificacoes.map((qualificacao) => [
                qualificacao.codigo || '-',
                qualificacao.nome || '-',
                qualificacao.tipo || '-',
                formatarData(qualificacao.data_qualificacao),
                formatarData(qualificacao.proxima_qualificacao),
                qualificacao.responsavel || '-',
                formatarResultado(qualificacao.resultado),
                qualificacao.status || '-'
            ]);

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
                    valign: 'middle',
                    overflow: 'linebreak'
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
                    0: { cellWidth: 18, halign: 'center' },
                    1: { cellWidth: 44 },
                    2: { cellWidth: 28, halign: 'center' },
                    3: { cellWidth: 32, halign: 'center' },
                    4: { cellWidth: 32, halign: 'center' },
                    5: { cellWidth: 39 },
                    6: { cellWidth: 50, halign: 'center' },
                    7: { cellWidth: 24, halign: 'center' }
                },
                didParseCell: (dados) => {
                    if (dados.section !== 'body') return;

                    const valor = String(
                        dados.cell.raw || ''
                    ).toUpperCase();

                    const coluna = dados.column.index;

                    // Resultado da qualificação
                    if (coluna === 6) {
                        if (valor === 'APROVADO') {
                            dados.cell.styles.fillColor = [220, 252, 231];
                            dados.cell.styles.textColor = [22, 101, 52];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'REPROVADO') {
                            dados.cell.styles.fillColor = [254, 226, 226];
                            dados.cell.styles.textColor = [153, 27, 27];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'APROVADO COM RESTRIÇÃO') {
                            dados.cell.styles.fillColor = [254, 249, 195];
                            dados.cell.styles.textColor = [133, 77, 14];
                            dados.cell.styles.fontStyle = 'bold';
                        }
                    }

                    // Status da qualificação
                    if (coluna === 7) {
                        if (valor === 'VENCIDA') {
                            dados.cell.styles.fillColor = [254, 226, 226];
                            dados.cell.styles.textColor = [185, 28, 28];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'PRÓXIMA') {
                            dados.cell.styles.fillColor = [254, 243, 199];
                            dados.cell.styles.textColor = [146, 64, 14];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'EM DIA') {
                            dados.cell.styles.fillColor = [220, 252, 231];
                            dados.cell.styles.textColor = [22, 101, 52];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'SEM AGENDAMENTO') {
                            dados.cell.styles.fillColor = [226, 232, 240];
                            dados.cell.styles.textColor = [71, 85, 105];
                            dados.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            // Rodapé e paginação
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

            const dataArquivo = new Date().toISOString().slice(0, 10);

            documento.save(
                `Relatorio_Qualificacoes_${dataArquivo}.pdf`
            );

            setErroQualificacoes('');
            mostrarMensagem(
                'Relatório PDF de qualificações exportado com sucesso.'
            );
        } catch (error) {
            console.error(
                'Erro ao exportar relatório PDF de qualificações:',
                error
            );

            setErroQualificacoes(
                'Erro ao exportar relatório PDF de qualificações.'
            );
        }
    };



    const exportarManutencoesPDF = () => {
        if (manutencoes.length === 0) {
            setErroManutencoes('Não há manutenções para exportar.');
            return;
        }

        try {
            const documento = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const margem = 14;
            const larguraPagina = documento.internal.pageSize.getWidth();
            const alturaPagina = documento.internal.pageSize.getHeight();
            const larguraConteudo = larguraPagina - margem * 2;

            const azulEscuro = [17, 24, 39];
            const azulCabecalho = [37, 99, 235];
            const cinzaTexto = [71, 85, 105];
            const branco = [255, 255, 255];

            const formatarData = (data) => {
                if (!data) return '-';

                return new Date(data).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                });
            };

            const formatarResultado = (resultado) => {
                if (resultado === 'APROVADO_COM_RESTRICAO') {
                    return 'Aprovado com restrição';
                }

                if (resultado === 'APROVADO') return 'Aprovado';
                if (resultado === 'REPROVADO') return 'Reprovado';

                return resultado || '-';
            };

            // Filtros aplicados
            const filtrosAplicados = [];

            if (filtrosManutencoes.codigo?.trim()) {
                filtrosAplicados.push(
                    `Código: ${filtrosManutencoes.codigo.trim()}`
                );
            }

            if (filtrosManutencoes.nome?.trim()) {
                filtrosAplicados.push(
                    `Equipamento: ${filtrosManutencoes.nome.trim()}`
                );
            }

            if (filtrosManutencoes.tipo) {
                filtrosAplicados.push(`Tipo: ${filtrosManutencoes.tipo}`);
            }

            if (filtrosManutencoes.responsavel?.trim()) {
                filtrosAplicados.push(
                    `Responsável: ${filtrosManutencoes.responsavel.trim()}`
                );
            }

            if (filtrosManutencoes.resultado) {
                filtrosAplicados.push(
                    `Resultado: ${formatarResultado(filtrosManutencoes.resultado)}`
                );
            }

            if (filtrosManutencoes.data_manutencao) {
                filtrosAplicados.push(
                    `Data da manutenção: ${formatarData(filtrosManutencoes.data_manutencao)}`
                );
            }

            if (filtrosManutencoes.proxima_manutencao) {
                filtrosAplicados.push(
                    `Próxima manutenção: ${formatarData(filtrosManutencoes.proxima_manutencao)}`
                );
            }

            if (filtrosManutencoes.status) {
                filtrosAplicados.push(
                    `Status: ${filtrosManutencoes.status}`
                );
            }

            // Cabeçalho no padrão do relatório de Equipamentos
            documento.setFillColor(...azulEscuro);
            documento.rect(margem, 10, larguraConteudo, 23, 'F');

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
                'RELATÓRIO DE MANUTENÇÕES',
                larguraPagina / 2,
                27,
                { align: 'center' }
            );

            // Data e total
            documento.setTextColor(...cinzaTexto);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8.5);

            documento.text(
                `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
                margem,
                40
            );

            documento.text(
                `Total de manutenções: ${manutencoes.length}`,
                larguraPagina - margem,
                40,
                { align: 'right' }
            );

            // Filtros antes da tabela
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(8.5);
            documento.setTextColor(...azulEscuro);

            documento.text('Filtros aplicados:', margem, 48);

            documento.setFont('helvetica', 'normal');
            documento.setTextColor(...cinzaTexto);

            const textoFiltros = filtrosAplicados.length > 0
                ? filtrosAplicados.join(' | ')
                : 'Todas as manutenções';

            const linhasFiltros = documento.splitTextToSize(
                textoFiltros,
                larguraConteudo - 35
            );

            documento.text(linhasFiltros, margem + 30, 48);

            const inicioTabela =
                51 + Math.max(0, (linhasFiltros.length - 1) * 4);

            // Dados da tabela
            const cabecalho = [
                'Código',
                'Equipamento',
                'Tipo',
                'Data da manutenção',
                'Próxima manutenção',
                'Responsável',
                'Resultado',
                'Status'
            ];

            const linhas = manutencoes.map((manutencao) => [
                manutencao.codigo || '-',
                manutencao.nome || '-',
                manutencao.tipo || '-',
                formatarData(manutencao.data_manutencao),
                formatarData(manutencao.proxima_manutencao),
                manutencao.responsavel || '-',
                formatarResultado(manutencao.resultado),
                manutencao.status || '-'
            ]);

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
                    valign: 'middle',
                    overflow: 'linebreak'
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
                // A soma das larguras é 267 mm.
                // A largura disponível entre as margens é 269 mm.
                columnStyles: {
                    0: { cellWidth: 18, halign: 'center' },
                    1: { cellWidth: 44 },
                    2: { cellWidth: 28, halign: 'center' },
                    3: { cellWidth: 32, halign: 'center' },
                    4: { cellWidth: 32, halign: 'center' },
                    5: { cellWidth: 39 },
                    6: { cellWidth: 50, halign: 'center' },
                    7: { cellWidth: 24, halign: 'center' }
                },
                didParseCell: (dados) => {
                    if (dados.section !== 'body') return;

                    const valor = String(
                        dados.cell.raw || ''
                    ).toUpperCase();

                    const coluna = dados.column.index;

                    // Resultado da manutenção
                    if (coluna === 6) {
                        if (valor === 'APROVADO') {
                            dados.cell.styles.fillColor = [220, 252, 231];
                            dados.cell.styles.textColor = [22, 101, 52];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'REPROVADO') {
                            dados.cell.styles.fillColor = [254, 226, 226];
                            dados.cell.styles.textColor = [153, 27, 27];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'APROVADO COM RESTRIÇÃO') {
                            dados.cell.styles.fillColor = [254, 249, 195];
                            dados.cell.styles.textColor = [133, 77, 14];
                            dados.cell.styles.fontStyle = 'bold';
                        }
                    }

                    // Status da manutenção
                    if (coluna === 7) {
                        if (valor === 'VENCIDA') {
                            dados.cell.styles.fillColor = [254, 226, 226];
                            dados.cell.styles.textColor = [185, 28, 28];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'PRÓXIMA') {
                            dados.cell.styles.fillColor = [254, 243, 199];
                            dados.cell.styles.textColor = [146, 64, 14];
                            dados.cell.styles.fontStyle = 'bold';
                        } else if (valor === 'EM DIA') {
                            dados.cell.styles.fillColor = [220, 252, 231];
                            dados.cell.styles.textColor = [22, 101, 52];
                            dados.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            // Rodapé e paginação
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

            const dataArquivo = new Date().toISOString().slice(0, 10);

            documento.save(
                `Relatorio_Manutencoes_${dataArquivo}.pdf`
            );

            setErroManutencoes('');
            mostrarMensagem(
                'Relatório PDF de manutenções exportado com sucesso.'
            );
        } catch (error) {
            console.error(
                'Erro ao exportar relatório PDF de manutenções:',
                error
            );

            setErroManutencoes(
                'Erro ao exportar relatório PDF de manutenções.'
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


                        <div className="relatorio-resultado-header">
                            <div>
                                <h3>Resultado</h3>
                                <p>
                                    {manutencoes.length} manutenção(ões) encontrada(s).
                                </p>
                            </div>

                            <div className="relatorios-exportacoes">

                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-excel"
                                    onClick={exportarManutencoesExcel}
                                    disabled={
                                        carregandoManutencoes ||
                                        manutencoes.length === 0
                                    }
                                >
                                    Exportar Excel
                                </button>

                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-pdf"
                                    onClick={exportarManutencoesPDF}
                                    disabled={
                                        carregandoManutencoes ||
                                        manutencoes.length === 0
                                    }
                                >
                                    Exportar PDF
                                </button>

                            </div>
                        </div>


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


            <section className="relatorio-card relatorio-painel">
                <button
                    type="button"
                    className="relatorio-painel-cabecalho"
                    onClick={() => alternarPainel('qualificacoes')}
                    aria-expanded={paineisAbertos.qualificacoes}
                >
                    <span className="relatorio-painel-titulo">
                        <h3>Relatório de Qualificações</h3>
                        <p>
                            {qualificacoes.length} qualificação(ões) encontrada(s).
                        </p>
                    </span>

                    <span
                        className={`relatorio-painel-icone ${paineisAbertos.qualificacoes ? 'aberto' : ''
                            }`}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>

                {paineisAbertos.qualificacoes && (
                    <div className="relatorio-painel-conteudo">
                        <form
                            className="relatorio-filtros"
                            onSubmit={(event) => {
                                event.preventDefault();
                                carregarQualificacoes(filtrosQualificacoes);
                            }}
                        >
                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_codigo">
                                    Código do equipamento
                                </label>
                                <input
                                    id="qualificacao_codigo"
                                    type="text"
                                    value={filtrosQualificacoes.codigo}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            codigo: event.target.value
                                        }))
                                    }
                                    placeholder="Ex.: EQ-001"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_nome">
                                    Nome do equipamento
                                </label>
                                <input
                                    id="qualificacao_nome"
                                    type="text"
                                    value={filtrosQualificacoes.nome}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            nome: event.target.value
                                        }))
                                    }
                                    placeholder="Nome do equipamento"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_tipo">
                                    Tipo de qualificação
                                </label>
                                <select
                                    id="qualificacao_tipo"
                                    value={filtrosQualificacoes.tipo}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            tipo: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="INSTALACAO">Instalação</option>
                                    <option value="OPERACAO">Operação</option>
                                    <option value="DESEMPENHO">Desempenho</option>
                                    <option value="REQUALIFICACAO">Requalificação</option>
                                    <option value="OUTRA">Outra</option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_responsavel">
                                    Responsável
                                </label>
                                <input
                                    id="qualificacao_responsavel"
                                    type="text"
                                    value={filtrosQualificacoes.responsavel}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            responsavel: event.target.value
                                        }))
                                    }
                                    placeholder="Nome do responsável"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_resultado">
                                    Resultado
                                </label>
                                <select
                                    id="qualificacao_resultado"
                                    value={filtrosQualificacoes.resultado}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            resultado: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="APROVADO_COM_RESTRICAO">
                                        Aprovado com restrição
                                    </option>
                                    <option value="REPROVADO">Reprovado</option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_data">
                                    Data da qualificação
                                </label>
                                <input
                                    id="qualificacao_data"
                                    type="date"
                                    value={filtrosQualificacoes.data_qualificacao}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            data_qualificacao: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_proxima">
                                    Próxima qualificação
                                </label>
                                <input
                                    id="qualificacao_proxima"
                                    type="date"
                                    value={filtrosQualificacoes.proxima_qualificacao}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            proxima_qualificacao: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="qualificacao_status">Status</label>
                                <select
                                    id="qualificacao_status"
                                    value={filtrosQualificacoes.status}
                                    onChange={(event) =>
                                        setFiltrosQualificacoes((anterior) => ({
                                            ...anterior,
                                            status: event.target.value
                                        }))
                                    }
                                >
                                    <option value="">Todos</option>
                                    <option value="VENCIDA">Vencida</option>
                                    <option value="PRÓXIMA">Próxima</option>
                                    <option value="EM DIA">Em dia</option>
                                    <option value="SEM AGENDAMENTO">
                                        Sem agendamento
                                    </option>
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
                                            data_qualificacao: '',
                                            proxima_qualificacao: '',
                                            status: ''
                                        };

                                        setFiltrosQualificacoes(filtrosLimpos);
                                        carregarQualificacoes(filtrosLimpos);
                                    }}
                                    disabled={carregandoQualificacoes}
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="submit"
                                    className="botao-relatorio botao-principal"
                                    disabled={carregandoQualificacoes}
                                >
                                    {carregandoQualificacoes
                                        ? 'Carregando...'
                                        : 'Gerar relatório'}
                                </button>
                            </div>
                        </form>


                        <div className="relatorio-resultado-header">
                            <div>
                                <h3>Resultado</h3>
                                <p>
                                    {qualificacoes.length} qualificação(ões) encontrada(s).
                                </p>
                            </div>

                            <div className="relatorios-exportacoes">
                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-excel"
                                    onClick={exportarQualificacoesExcel}
                                    disabled={
                                        carregandoQualificacoes ||
                                        qualificacoes.length === 0
                                    }
                                >
                                    Exportar Excel
                                </button>


                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-pdf"
                                    onClick={exportarQualificacoesPDF}
                                    disabled={
                                        carregandoQualificacoes ||
                                        qualificacoes.length === 0
                                    }
                                >
                                    Exportar PDF
                                </button>


                            </div>
                        </div>


                        {erroQualificacoes && (
                            <div className="mensagem-relatorio mensagem-erro">
                                {erroQualificacoes}
                            </div>
                        )}

                        {carregandoQualificacoes ? (
                            <div className="relatorio-vazio">
                                Carregando qualificações...
                            </div>
                        ) : qualificacoes.length === 0 ? (
                            <div className="relatorio-vazio">
                                Nenhuma qualificação encontrada.
                            </div>
                        ) : (
                            <div className="relatorio-tabela-container">
                                <table className="relatorio-tabela">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Equipamento</th>
                                            <th>Tipo</th>
                                            <th>Data da qualificação</th>
                                            <th>Próxima qualificação</th>
                                            <th>Responsável</th>
                                            <th>Resultado</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {qualificacoes.map((qualificacao) => (
                                            <tr key={qualificacao.id}>
                                                <td>{qualificacao.codigo}</td>
                                                <td>{qualificacao.nome}</td>
                                                <td>{qualificacao.tipo}</td>
                                                <td>
                                                    {qualificacao.data_qualificacao
                                                        ? new Date(
                                                            qualificacao.data_qualificacao
                                                        ).toLocaleDateString('pt-BR', {
                                                            timeZone: 'UTC'
                                                        })
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {qualificacao.proxima_qualificacao
                                                        ? new Date(
                                                            qualificacao.proxima_qualificacao
                                                        ).toLocaleDateString('pt-BR', {
                                                            timeZone: 'UTC'
                                                        })
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {qualificacao.responsavel || '-'}
                                                </td>
                                                <td>
                                                    {qualificacao.resultado ===
                                                        'APROVADO_COM_RESTRICAO'
                                                        ? 'Aprovado com restrição'
                                                        : qualificacao.resultado || '-'}
                                                </td>
                                                <td>{qualificacao.status || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </section>


            <section className="relatorio-card relatorio-painel">
                <button
                    type="button"
                    className="relatorio-painel-cabecalho"
                    onClick={() => alternarPainel('operacional')}
                    aria-expanded={paineisAbertos.operacional}
                >
                    <span className="relatorio-painel-titulo">
                        <h3>Relatório Operacional</h3>
                        <p>
                            Consulte os registros operacionais dos equipamentos.
                        </p>
                    </span>

                    <span
                        className={`relatorio-painel-icone ${paineisAbertos.operacional ? 'aberto' : ''
                            }`}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>

                {paineisAbertos.operacional && (
                    <div className="relatorio-painel-conteudo">

                        <form
                            className="relatorio-filtros"
                            onSubmit={(event) => {
                                event.preventDefault();
                                carregarOperacionais(filtrosOperacionais);
                            }}
                        >
                            <div className="campo-relatorio">
                                <label htmlFor="operacional_codigo">
                                    Código do equipamento
                                </label>
                                <input
                                    id="operacional_codigo"
                                    type="text"
                                    value={filtrosOperacionais.codigo}
                                    onChange={(event) =>
                                        setFiltrosOperacionais((anterior) => ({
                                            ...anterior,
                                            codigo: event.target.value
                                        }))
                                    }
                                    placeholder="Ex.: EQ-001"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_nome">
                                    Nome do equipamento
                                </label>
                                <input
                                    id="operacional_nome"
                                    type="text"
                                    value={filtrosOperacionais.nome}
                                    onChange={(event) =>
                                        setFiltrosOperacionais((anterior) => ({
                                            ...anterior,
                                            nome: event.target.value
                                        }))
                                    }
                                    placeholder="Nome do equipamento"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_modelo">Modelo</label>
                                <input
                                    id="operacional_modelo"
                                    type="text"
                                    value={filtrosOperacionais.modelo}
                                    onChange={(event) =>
                                        setFiltrosOperacionais((anterior) => ({
                                            ...anterior,
                                            modelo: event.target.value
                                        }))
                                    }
                                    placeholder="Modelo do equipamento"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_patrimonio">
                                    Número de patrimônio
                                </label>
                                <input
                                    id="operacional_patrimonio"
                                    type="text"
                                    value={filtrosOperacionais.numero_patrimonio_fase}
                                    onChange={(event) =>
                                        setFiltrosOperacionais((anterior) => ({
                                            ...anterior,
                                            numero_patrimonio_fase: event.target.value
                                        }))
                                    }
                                    placeholder="Número de patrimônio"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_anvisa">Registro ANVISA</label>
                                <input
                                    id="operacional_anvisa"
                                    type="text"
                                    value={filtrosOperacionais.registro_anvisa_ms}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        registro_anvisa_ms: event.target.value
                                    }))}
                                    placeholder="Registro ANVISA"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_unidade">Unidade</label>
                                <input
                                    id="operacional_unidade"
                                    type="text"
                                    value={filtrosOperacionais.unidade}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        unidade: event.target.value
                                    }))}
                                    placeholder="Nome da unidade"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_sala">Sala</label>
                                <input
                                    id="operacional_sala"
                                    type="text"
                                    value={filtrosOperacionais.sala}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        sala: event.target.value
                                    }))}
                                    placeholder="Nome ou número da sala"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_data_aquisicao">Data de aquisição</label>
                                <input
                                    id="operacional_data_aquisicao"
                                    type="date"
                                    value={filtrosOperacionais.data_aquisicao}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        data_aquisicao: event.target.value
                                    }))}
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_status">Status operacional</label>
                                <select
                                    id="operacional_status"
                                    value={filtrosOperacionais.status_operacional}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        status_operacional: event.target.value
                                    }))}
                                >
                                    <option value="">Todos</option>
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                    <option value="EM MANUTENÇÃO">Em manutenção</option>
                                </select>
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_manutencao_interna">Frequência de manutenção interna</label>
                                <input
                                    id="operacional_manutencao_interna"
                                    type="text"
                                    value={filtrosOperacionais.frequencia_manutencao_interna}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        frequencia_manutencao_interna: event.target.value
                                    }))}
                                    placeholder="Ex.: Mensal"
                                />
                            </div>

                            <div className="campo-relatorio">
                                <label htmlFor="operacional_manutencao_externa">Frequência de manutenção externa</label>
                                <input
                                    id="operacional_manutencao_externa"
                                    type="text"
                                    value={filtrosOperacionais.frequencia_manutencao_externa}
                                    onChange={(event) => setFiltrosOperacionais((anterior) => ({
                                        ...anterior,
                                        frequencia_manutencao_externa: event.target.value
                                    }))}
                                    placeholder="Ex.: Anual"
                                />
                            </div>

                            <div className="relatorio-acoes">


                                <button
                                    type="button"
                                    className="botao-relatorio"
                                    onClick={() => {
                                        const filtrosLimpos = {
                                            codigo: '',
                                            nome: '',
                                            modelo: '',
                                            numero_patrimonio_fase: '',
                                            registro_anvisa_ms: '',
                                            unidade: '',
                                            sala: '',
                                            data_aquisicao: '',
                                            status_operacional: '',
                                            frequencia_manutencao_interna: '',
                                            frequencia_manutencao_externa: ''
                                        };

                                        setFiltrosOperacionais(filtrosLimpos);
                                        carregarOperacionais(filtrosLimpos);
                                    }}
                                    disabled={carregandoOperacionais}
                                >
                                    Limpar filtros
                                </button>


                                <button
                                    type="submit"
                                    className="botao-relatorio botao-principal"
                                    disabled={carregandoOperacionais}
                                >
                                    {carregandoOperacionais
                                        ? 'Carregando...'
                                        : 'Gerar relatório'}
                                </button>


                            </div>
                        </form>

                        <div className="relatorio-resultado-header">
                            <div>
                                <h3>Resultado</h3>
                                <p>
                                    {operacionais.length} registro(s) encontrado(s).
                                </p>
                            </div>

                            <div className="relatorios-exportacoes">
                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-excel"
                                    onClick={exportarOperacionaisExcel}
                                    disabled={
                                        carregandoOperacionais ||
                                        operacionais.length === 0
                                    }
                                >
                                    Exportar Excel
                                </button>

                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-pdf"
                                    onClick={exportarOperacionaisPDF}
                                    disabled={
                                        carregandoOperacionais ||
                                        operacionais.length === 0
                                    }
                                >
                                    Exportar PDF
                                </button>
                            </div>
                        </div>

                        {erroOperacionais && (
                            <div className="mensagem-relatorio mensagem-erro">
                                {erroOperacionais}
                            </div>
                        )}

                        {carregandoOperacionais ? (
                            <div className="relatorio-vazio">
                                Carregando registros operacionais...
                            </div>
                        ) : operacionais.length === 0 ? (
                            <div className="relatorio-vazio">
                                Nenhum registro operacional encontrado.
                            </div>
                        ) : (
                            <div className="relatorio-tabela-container">
                                <table className="relatorio-tabela">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Equipamento</th>
                                            <th>Modelo</th>
                                            <th>Patrimônio</th>
                                            <th>Registro ANVISA</th>
                                            <th>Unidade</th>
                                            <th>Sala</th>
                                            <th>Data de aquisição</th>
                                            <th>Status</th>
                                            <th>Manutenção interna</th>
                                            <th>Manutenção externa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {operacionais.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.codigo || '-'}</td>
                                                <td>{item.nome || '-'}</td>
                                                <td>{item.modelo || '-'}</td>
                                                <td>{item.numero_patrimonio_fase || '-'}</td>
                                                <td>{item.registro_anvisa_ms || '-'}</td>
                                                <td>{item.unidade || '-'}</td>
                                                <td>{item.sala || '-'}</td>
                                                <td>
                                                    {item.data_aquisicao
                                                        ? new Date(item.data_aquisicao).toLocaleDateString(
                                                            'pt-BR',
                                                            { timeZone: 'UTC' }
                                                        )
                                                        : '-'}
                                                </td>
                                                <td>{item.status_operacional || '-'}</td>
                                                <td>{item.frequencia_manutencao_interna || '-'}</td>
                                                <td>{item.frequencia_manutencao_externa || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}
            </section>


            <section className="relatorio-card relatorio-painel">
                <button
                    type="button"
                    className="relatorio-painel-cabecalho"
                    onClick={() => alternarPainel('regulatorios')}
                    aria-expanded={paineisAbertos.regulatorios}
                >
                    <span className="relatorio-painel-titulo">
                        <h3>Relatório Regulatório</h3>
                        <p>
                            {regulatorios.length} registro(s) regulatório(s) encontrado(s).
                        </p>
                    </span>

                    <span
                        className={`relatorio-painel-icone ${paineisAbertos.regulatorios ? 'aberto' : ''
                            }`}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                </button>

                {paineisAbertos.regulatorios && (
                    <div className="relatorio-painel-conteudo">


                        <form
                            className="relatorio-filtros"
                            onSubmit={(e) => {
                                e.preventDefault();
                                carregarRegulatorios(filtrosRegulatorios);
                            }}
                        >
                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_codigo">Código</label>
                                    <input
                                        id="regulatorio_codigo"
                                        type="text"
                                        value={filtrosRegulatorios.codigo}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                codigo: e.target.value
                                            }))
                                        }
                                        placeholder="Código do equipamento"
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_nome">Equipamento</label>
                                    <input
                                        id="regulatorio_nome"
                                        type="text"
                                        value={filtrosRegulatorios.nome}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                nome: e.target.value
                                            }))
                                        }
                                        placeholder="Nome do equipamento"
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_registro">Registro ANVISA/MS</label>
                                    <input
                                        id="regulatorio_registro"
                                        type="text"
                                        value={filtrosRegulatorios.registro_anvisa_ms}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                registro_anvisa_ms: e.target.value
                                            }))
                                        }
                                        placeholder="Número do registro"
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_situacao">
                                        Situação regulatória
                                    </label>
                                    <select
                                        id="regulatorio_situacao"
                                        value={filtrosRegulatorios.situacao_regulatoria}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                situacao_regulatoria: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Todas</option>
                                        <option value="VIGENTE">Vigente</option>
                                        <option value="VENCIDO">Vencido</option>
                                    </select>
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_data_registro">
                                        Data de registro
                                    </label>
                                    <input
                                        id="regulatorio_data_registro"
                                        type="date"
                                        value={filtrosRegulatorios.data_registro}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                data_registro: e.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_data_validade">
                                        Data de validade
                                    </label>
                                    <input
                                        id="regulatorio_data_validade"
                                        type="date"
                                        value={filtrosRegulatorios.data_validade}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                data_validade: e.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_fabricante">
                                        Fabricante legal
                                    </label>
                                    <input
                                        id="regulatorio_fabricante"
                                        type="text"
                                        value={filtrosRegulatorios.fabricante_legal}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                fabricante_legal: e.target.value
                                            }))
                                        }
                                        placeholder="Nome do fabricante"
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_detentor">
                                        Detentor do registro
                                    </label>
                                    <input
                                        id="regulatorio_detentor"
                                        type="text"
                                        value={filtrosRegulatorios.detentor_registro}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                detentor_registro: e.target.value
                                            }))
                                        }
                                        placeholder="Nome do detentor"
                                    />
                                </div>

                                <div className="campo-relatorio">
                                    <label htmlFor="regulatorio_status_validade">
                                        Status da validade
                                    </label>
                                    <select
                                        id="regulatorio_status_validade"
                                        value={filtrosRegulatorios.status_validade}
                                        onChange={(e) =>
                                            setFiltrosRegulatorios((atual) => ({
                                                ...atual,
                                                status_validade: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Todos</option>
                                        <option value="VIGENTE">Vigente</option>
                                        <option value="VENCE EM 30 DIAS">
                                            Vence em 30 dias
                                        </option>
                                        <option value="VENCIDO">Vencido</option>
                                        <option value="SEM VALIDADE">Sem validade</option>
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
                                            registro_anvisa_ms: '',
                                            situacao_regulatoria: '',
                                            data_registro: '',
                                            data_validade: '',
                                            fabricante_legal: '',
                                            detentor_registro: '',
                                            status_validade: ''
                                        };

                                        setFiltrosRegulatorios(filtrosLimpos);
                                        carregarRegulatorios(filtrosLimpos);
                                    }}
                                    disabled={carregandoRegulatorios}
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="submit"
                                    className="botao-relatorio botao-principal"
                                    disabled={carregandoRegulatorios}
                                >
                                    {carregandoRegulatorios
                                        ? 'Carregando...'
                                        : 'Gerar relatório'}
                                </button>
                            </div>
                        </form>


                        <div className="relatorio-resultado-header">
                            <div>
                                <h3>Resultado</h3>
                                <p>
                                    {regulatorios.length} registro(s) encontrado(s).
                                </p>
                            </div>

                            <div className="relatorios-exportacoes">
                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-excel"
                                    onClick={exportarRegulatoriosExcel}
                                    disabled={carregandoRegulatorios || regulatorios.length === 0}
                                >
                                    Exportar Excel
                                </button>

                                <button
                                    type="button"
                                    className="relatorios-exportar-button relatorios-exportar-pdf"
                                    onClick={exportarRegulatoriosPDF}
                                    disabled={carregandoRegulatorios || regulatorios.length === 0}
                                >
                                    Exportar PDF
                                </button>
                            </div>
                        </div>

                        {erroRegulatorios && (
                            <div className="mensagem-relatorio mensagem-erro">
                                {erroRegulatorios}
                            </div>
                        )}

                        {carregandoRegulatorios ? (
                            <div className="relatorio-vazio">
                                Carregando registros regulatórios...
                            </div>
                        ) : regulatorios.length === 0 ? (
                            <div className="relatorio-vazio">
                                Nenhum registro regulatório encontrado.
                            </div>
                        ) : (
                            <div className="relatorio-tabela-container">
                                <table className="relatorio-tabela">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Equipamento</th>
                                            <th>Registro ANVISA/MS</th>
                                            <th>Situação regulatória</th>
                                            <th>Data de registro</th>
                                            <th>Validade</th>
                                            <th>Status da validade</th>
                                            <th>Fabricante legal</th>
                                            <th>Detentor do registro</th>
                                            <th>Documento</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {regulatorios.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.codigo || '-'}</td>
                                                <td>{item.nome || '-'}</td>
                                                <td>{item.registro_anvisa_ms || '-'}</td>
                                                <td>{item.situacao_regulatoria || '-'}</td>
                                                <td>
                                                    {item.data_registro
                                                        ? new Date(item.data_registro)
                                                            .toLocaleDateString('pt-BR', {
                                                                timeZone: 'UTC'
                                                            })
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {item.data_validade
                                                        ? new Date(item.data_validade)
                                                            .toLocaleDateString('pt-BR', {
                                                                timeZone: 'UTC'
                                                            })
                                                        : '-'}
                                                </td>
                                                <td>{item.status_validade || '-'}</td>
                                                <td>{item.fabricante_legal || '-'}</td>
                                                <td>{item.detentor_registro || '-'}</td>
                                                <td>{item.documento_regulatorio || '-'}</td>
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