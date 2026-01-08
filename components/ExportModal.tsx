import React, { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { AppState } from '../types';
import { getAvailablePageHeight, paginateProducts } from '../utils';

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
            backgroundColor: null,
            cacheBust: true,
            style: { transform: 'scale(1)', margin: '0' } // Reseta transform e margin
        };

        if (type === 'png') return await toPng(element, options);
        return await toJpeg(element, options);
    };

    // Converte data URI para Blob
    const dataURItoBlob = (dataURI: string): Blob => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleExport = async (targetFormat: 'png' | 'jpg' | 'pdf') => {
        setIsExporting(true);
        setProgress('Iniciando exportação...');

        try {
            // 1. Gerar Nome Inteligente
            const formatNames: Record<string, string> = {
                'a4': 'A4', 'feed': 'Feed', 'story': 'Story', 'tabloid': 'Tabloide',
                'feed-side': 'Feed-Side', 'story-side': 'Story-Side', 'feed-story': 'Misto'
            };
            const formatLabel = formatNames[state.paperSize] || state.paperSize;

            let dateLabel = '';
            if (state.validUntil) {
                const [y, m, d] = state.validUntil.split('-');
                dateLabel = ` - Validade ${d}-${m}-${y}`;
            }

            // Ex: "Feed - Validade 10-12-2023" ou "Tabloide - Validade..."
            const baseFileName = `${formatLabel}${dateLabel}`;
            const scale = 3;

            // 2. Determinar Páginas a Exportar
            let pagesToExport: { index: number; suffix: string }[] = [];

            if (state.paperSize === 'feed-story') {
                // --- LÓGICA MISTA (Feed + Story) ---
                const feedH = getAvailablePageHeight('feed', state.orientation, !!state.header.customImage, !!state.footer.customImage);
                const feedPages = paginateProducts(state.products, feedH, (state.layout?.cardHeight || 280) + (state.layout?.rowGap || 16), state.columns);

                const sec = state.secondarySettings || { layout: state.layout, columns: 1 };
                const storyH = getAvailablePageHeight('story', state.orientation, !!state.header.customImage, !!state.footer.customImage);
                const storyPages = paginateProducts(state.products, storyH, (sec.layout?.cardHeight || 280) + 16, sec.columns || 1);

                // Feed Pages (Index 0 to N-1)
                feedPages.forEach((_, i) => pagesToExport.push({
                    index: i,
                    suffix: ` (Feed ${i + 1})`
                }));

                // Story Pages (Index N to N+M-1)
                storyPages.forEach((_, i) => pagesToExport.push({
                    index: feedPages.length + i,
                    suffix: ` (Story ${i + 1})`
                }));

            } else {
                // --- LÓGICA PADRÃO ---
                const availableHeight = getAvailablePageHeight(state.paperSize, state.orientation, !!state.header.customImage, !!state.footer.customImage);
                const itemHeight = (state.layout.cardHeight || 280) + (state.layout.rowGap || 16);
                const productPages = paginateProducts(state.products, availableHeight, itemHeight, state.columns);

                productPages.forEach((_, i) => pagesToExport.push({
                    index: i,
                    suffix: productPages.length > 1 ? ` (Pág ${i + 1})` : ''
                }));
            }

            if (targetFormat === 'pdf') {
                const pdf = new jsPDF({
                    orientation: state.orientation === 'landscape' ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: state.paperSize === 'tabloid' ? [279, 432] : 'a4' // Tabloid 11x17" ~ 279x432mm
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                for (let i = 0; i < pagesToExport.length; i++) {
                    const page = pagesToExport[i];
                    setProgress(`Processando Página ${i + 1}/${pagesToExport.length}...`);

                    const elementId = `flyer-page-${page.index}`;
                    const imgData = await generateBaseImage(elementId, 'jpeg', scale);
                    const imgProps = pdf.getImageProperties(imgData);

                    // Manter Proporção
                    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
                    const w = imgProps.width * ratio;
                    const h = imgProps.height * ratio;
                    const x = (pdfWidth - w) / 2;
                    const y = (pdfHeight - h) / 2;

                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', x, y, w, h);
                }

                pdf.save(`${baseFileName}.pdf`);

            } else {
                // Exportação PNG/JPG
                const imgType = targetFormat === 'jpg' ? 'jpeg' : 'png';

                if ('showSaveFilePicker' in window) {
                    const fileHandles: any[] = [];

                    // Passo 1: Solicitar onde salvar cada arquivo
                    for (let i = 0; i < pagesToExport.length; i++) {
                        const page = pagesToExport[i];
                        const fullFileName = `${baseFileName}${page.suffix}.${targetFormat}`;

                        try {
                            setProgress(`Salvar Arquivo ${i + 1}/${pagesToExport.length}...`);
                            const handle = await (window as any).showSaveFilePicker({
                                suggestedName: fullFileName,
                                types: [{
                                    description: `${targetFormat.toUpperCase()} Image`,
                                    accept: { [`image/${imgType}`]: [`.${targetFormat}`] }
                                }]
                            });
                            fileHandles.push(handle);
                        } catch (err: any) {
                            if (err.name === 'AbortError') {
                                setProgress('Exportação cancelada');
                                setTimeout(() => { setIsExporting(false); onClose(); }, 1000);
                                return;
                            }
                            throw err;
                        }
                    }

                    // Passo 2: Gerar e Escrever
                    for (let i = 0; i < pagesToExport.length; i++) {
                        const page = pagesToExport[i];
                        setProgress(`Gerando imagem ${i + 1}/${pagesToExport.length}...`);

                        const elementId = `flyer-page-${page.index}`;
                        const imgData = await generateBaseImage(elementId, imgType, scale);

                        const writable = await fileHandles[i].createWritable();
                        const blob = dataURItoBlob(imgData);
                        await writable.write(blob);
                        await writable.close();
                    }

                } else {
                    // Fallback Clássico (Download direto)
                    for (let i = 0; i < pagesToExport.length; i++) {
                        const page = pagesToExport[i];
                        setProgress(`Baixando imagem ${i + 1}/${pagesToExport.length}...`);

                        const elementId = `flyer-page-${page.index}`;
                        const imgData = await generateBaseImage(elementId, imgType, scale);

                        const link = document.createElement('a');
                        link.href = imgData;
                        link.download = `${baseFileName}${page.suffix}.${targetFormat}`;
                        link.click();

                        await new Promise(resolve => setTimeout(resolve, 800)); // Delay seguro
                    }
                }
            }

            setProgress('Sucesso! 🚀');
            setTimeout(() => {
                setIsExporting(false);
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Erro na exportação:', error);
            setProgress('Erro ao exportar');
            setTimeout(() => setIsExporting(false), 2000);
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
                        O sistema gera automaticamente múltiplas páginas se os produtos não couberem em uma só.
                    </p>
                )}
            </div>
        </div>
    );
};
