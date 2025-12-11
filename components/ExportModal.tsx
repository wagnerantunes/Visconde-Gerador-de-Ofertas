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

    const generateBaseImage = async (type: 'png' | 'jpeg', scale = 4) => {
        const element = document.getElementById('flyer-preview');
        if (!element) throw new Error('Elemento não encontrado');

        const options = {
            quality: 1.0,
            pixelRatio: scale,
            backgroundColor: '#ffffff',
            style: { transform: 'scale(1)' }
        };

        if (type === 'png') return await toPng(element, options);
        return await toJpeg(element, options);
    };

    const handleExport = async (targetFormat: 'png' | 'jpg' | 'pdf') => {
        setIsExporting(true);
        setProgress('Processando imagem Ultra HD...');

        try {
            const fileName = `ofertas-${state.seasonal.theme}-${new Date().toISOString().split('T')[0]}`;
            // Usamos scale 3 para garantir boa performance e qualidade. 4 pode ser memory intensive em alguns browsers.
            const scale = 3;

            if (targetFormat === 'pdf') {
                // Para PDF, usamos JPEG para otimizar tamanho sem perder muita qualidade visual no papel
                const imgData = await generateBaseImage('jpeg', scale);

                setProgress('Gerando PDF...');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();

                // Ajustar altura proporcionalmente
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // Se altura for maior que A4, talvez precise de nova página ou ajuste? 
                // Assumindo que o flyer cabe numa folha ou será redimensionado pra caber na largura.
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${fileName}.pdf`);

            } else {
                // Para PNG/JPG
                const imgType = targetFormat === 'jpg' ? 'jpeg' : 'png';
                const imgData = await generateBaseImage(imgType, scale);

                setProgress('Finalizando download...');
                const link = document.createElement('a');
                link.download = `${fileName}.${targetFormat}`;
                link.href = imgData;
                link.click();
            }

            onClose();
        } catch (error) {
            console.error('Erro na exportação:', error);
            alert('Erro ao exportar. Verifique se o navegador suporta Canvas de alta resolução.');
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
                                <p className="text-xs text-gray-500 dark:text-gray-400">Formato ideal para impressão.</p>
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
                        O sistema gera imagens em resolução aumentada (3x) para garantir que textos e preços fiquem nítidos.
                    </p>
                )}
            </div>
        </div>
    );
};
