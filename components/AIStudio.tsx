import React, { useState } from 'react';
import { AppState, Product } from '../types';
import { useToast } from '../contexts/ToastContext';
import { generateAIContent } from '../services/aiService';

interface AIStudioProps {
    isOpen: boolean;
    onClose: () => void;
    state: AppState;
    onUpdateState: (updates: Partial<AppState>) => void;
}

export const AIStudio: React.FC<AIStudioProps> = ({ isOpen, onClose, state, onUpdateState }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<string>('');
    const { showToast } = useToast();

    // ... inside component

    const generateContent = async (type: 'title' | 'description', context?: string) => {
        setIsGenerating(true);
        setResult('');

        try {
            const systemPrompt = type === 'title'
                ? `Você é um especialista em marketing para varejo e açougues.
                   Crie 3 títulos curtos, criativos e chamativos (máximo 5 palavras cada) para um encarte de ofertas.
                   Tema sazonal atual: "${state.seasonal.subtitle}".
                   Retorne apenas a lista numerada.`
                : `Crie uma descrição curta (máximo 20 palavras), apetitosa e persuasiva para vender o seguinte produto de açougue: "${context}".
                   Destaque qualidade, sabor ou uso culinário.`;

            const aiResponse = await generateAIContent(systemPrompt);
            setResult(aiResponse);
            showToast('success', 'Conteúdo gerado com sucesso!');
        } catch (error) {
            console.error('AI Error:', error);
            showToast('error', error instanceof Error ? error.message : 'Falha ao gerar conteúdo');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 relative">
                    <div className="absolute inset-0 bg-primary/5 opacity-50"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <span className="material-icons-round text-primary">auto_awesome</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">AI Creative Studio</h2>
                                <p className="text-xs text-gray-400 font-medium">Powered by Google Gemini</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => generateContent('title')}
                            disabled={isGenerating}
                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                            <span className="material-icons-round text-3xl text-gray-300 group-hover:text-primary mb-1">text_fields</span>
                            <span className="text-xs font-black uppercase tracking-wider text-gray-500 group-hover:text-primary">Sugestões de Títulos</span>
                        </button>
                        <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden">
                            <span className="material-icons-round text-3xl text-gray-300 group-hover:text-primary mb-1">description</span>
                            <span className="text-xs font-black uppercase tracking-wider text-gray-500 group-hover:text-primary text-center">Descrições de Produtos</span>
                            <select
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => generateContent('description', e.target.value)}
                                value=""
                            >
                                <option value="" disabled>Selecione um produto</option>
                                {state.products.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* AI Output Area */}
                    <div className="relative">
                        <div className={`min-h-[200px] w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl border ${isGenerating ? 'border-primary/50 animate-pulse' : 'border-gray-100 dark:border-gray-800'} p-6 transition-all`}>
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <span className="material-icons-round animate-spin text-4xl">sync</span>
                                    <p className="text-xs font-black uppercase tracking-widest">O Gemini está pensando...</p>
                                </div>
                            ) : result ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Resultado da IA</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(result);
                                                showToast('success', 'Copiado para a área de transferência!');
                                            }}
                                            className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                        >
                                            <span className="material-icons-round text-sm">content_copy</span>
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">
                                        {result}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-300 dark:text-gray-600 py-10">
                                    <span className="material-icons-round text-6xl opacity-20">psychology</span>
                                    <p className="text-xs font-bold uppercase">Selecione uma ação acima para começar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                        As sugestões da IA são geradas com base no seu tema atual e lista de produtos.<br />
                        Sempre revise o conteúdo antes de publicar seu encarte.
                    </p>
                </div>
            </div>
        </div>
    );
};
