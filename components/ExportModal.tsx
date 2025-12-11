import React, { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { AppState } from '../types';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: AppState;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, state }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState('');

    if (!isOpen) return null;

    const generateBaseImage = async (elementId: string, type: 'png' | 'jpeg', scale = 3) => {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`Elemento ${elementId} não encontrado`);

        const options = {
            quality: 1.0,
            pixelRatio: scale,
            backgroundColor: '#ffffff',
            style: { transform: 'scale(1)', margin: '0' } // Reseta transform e margin
        };

        if (type === 'png') return await toPng(element, options);
        return await toJpeg(element, options);
    };

    const handleExport = async (targetFormat: 'png' | 'jpg' | 'pdf') => {
        setIsExporting(true);
        setProgress('Iniciando exportação...');

        try {
            const fileName = `ofertas-${state.seasonal.theme}-${new Date().toISOString().split('T')[0]}`;
            // Scale 3 para alta resolução
            const scale = 3;

            // Fallback se não houver pages definido (migração)
            const pages = state.pages || [{ id: 'page-1' }];

            if (targetFormat === 'pdf') {
                // Configuração inicial do PDF baseada na orientação
                const pdf = new jsPDF({
                    orientation: state.orientation === 'landscape' ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: 'a4' // Padrão A4 para impressão
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeightPage = pdf.internal.pageSize.getHeight();

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    setProgress(`Processando Página ${i + 1}/${pages.length}...`);

                    // ID do elemento da página específica
                    const elementId = `flyer-page-${page.id}`;

                    // Usamos JPEG para otimizar tamanho no PDF
                    const imgData = await generateBaseImage(elementId, 'jpeg', scale);
                    const imgProps = pdf.getImageProperties(imgData);

                    // Calcular altura proporcional à largura da página A4
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    if (i > 0) pdf.addPage();

                    // Centralizar verticalmente se for menor que a página, ou alinhar ao topo
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
                }

                pdf.save(`${fileName}.pdf`);

            } else {
                // Exportação PNG/JPG (Sequencial)
                const imgType = targetFormat === 'jpg' ? 'jpeg' : 'png';

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    setProgress(`Gerando Imagem ${i + 1}/${pages.length}...`);

                    const elementId = `flyer-page-${page.id}`;
                    const imgData = await generateBaseImage(elementId, imgType, scale);

                    const link = document.createElement('a');
                    const suffix = pages.length > 1 ? `-pg${i + 1}` : '';
                    link.download = `${fileName}${suffix}.${targetFormat}`;
                    link.href = imgData;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Pequeno delay para evitar bloqueio de downloads múltiplos
                    if (pages.length > 1) await new Promise(r => setTimeout(r, 800));
                }
            }

            onClose();
        } catch (error) {
            console.error('Erro na exportação:', error);
            alert('Erro ao exportar. Tente recarregar a página e tentar novamente.');
        } finally {
            setIsExporting(false);
            setProgress('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary">download</span>
                        Exportar Flyer
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                        disabled={isExporting}
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* loading state */}
                {isExporting ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-800 dark:text-gray-200 font-bold text-lg animate-pulse">{progress}</p>
                        <p className="text-sm text-gray-500 mt-2">Renderizando em alta definição...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={() => handleExport('png')}
                            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-blue-50 hover:border-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:border-blue-500 transition-all group relative overflow-hidden"
                        >
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors z-10">
                                <span className="material-icons-round text-2xl">image</span>
                            </div>
                            <div className="text-left flex-1 z-10">
                                <h3 className="font-bold text-gray-800 dark:text-white">Imagem PNG (HD)</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Melhor qualidade para WhatsApp e Instagram.</p>
                            </div>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded absolute top-2 right-2">RECOMENDADO</span>
                        </button>

                        <button
                            onClick={() => handleExport('pdf')}
                            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-red-50 hover:border-red-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:border-red-500 transition-all group"
                        >
                            <div className="bg-red-100 text-red-600 p-3 rounded-lg mr-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <span className="material-icons-round text-2xl">picture_as_pdf</span>
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white">Arquivo PDF</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Formato ideal para impressão (Múltiplas Páginas).</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('jpg')}
                            className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-green-50 hover:border-green-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:border-green-500 transition-all group"
                        >
                            <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <span className="material-icons-round text-2xl">photo</span>
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white">Imagem JPG</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Arquivo mais leve.</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Footer info */}
                {!isExporting && (
                    <p className="text-[10px] text-center text-gray-400 mt-6 max-w-xs mx-auto">
                        O sistema gera imagens separadas (se houver múltiplas páginas) ou um único PDF multipágina.
                    </p>
                )}
            </div>
        </div>
    );
};
