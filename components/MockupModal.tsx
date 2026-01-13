import React from 'react';
import { AppState } from '../types';

interface MockupModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: AppState;
}

export const MockupModal: React.FC<MockupModalProps> = ({ isOpen, onClose, state }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative animate-in zoom-in-95 duration-300 flex flex-col items-center">
                {/* iPhone Case Mockup */}
                <div className="relative w-[320px] h-[650px] bg-gray-900 rounded-[50px] border-[8px] border-gray-800 shadow-2xl overflow-hidden ring-4 ring-gray-700">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-20" />

                    {/* Screen Content - WhatsApp Interface */}
                    <div className="absolute inset-0 bg-[#e5ddd5] flex flex-col font-sans">
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white pt-10 pb-3 px-4 flex items-center gap-3">
                            <span className="material-icons-round text-lg">arrow_back</span>
                            <div className="w-9 h-9 bg-gray-300 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-bold leading-none">Visconde Carnes</p>
                                <p className="text-[10px] opacity-70">online</p>
                            </div>
                            <span className="material-icons-round text-lg">videocam</span>
                            <span className="material-icons-round text-lg">call</span>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-4">
                            <div className="bg-white p-1 rounded-lg rounded-tl-none shadow-sm relative max-w-[85%]">
                                <p className="text-[11px] p-2 pr-10">Confira nossas ofertas imperdíveis de hoje! 👇</p>
                                <span className="absolute bottom-1 right-2 text-[9px] text-gray-400">10:30</span>
                            </div>

                            {/* THE FLYER IMAGE */}
                            <div className="bg-[#dcf8c6] p-1 rounded-lg rounded-tr-none shadow-sm relative self-end ml-auto max-w-[90%] border border-black/5">
                                <div className="bg-white rounded overflow-hidden">
                                    {/* Small preview of the first page */}
                                    <div className="aspect-[1/1.4] relative overflow-hidden">
                                        {/* Ideally we'd use a canvas or thumb here, but for mockup we use a placeholder or stylized version */}
                                        <div
                                            className="absolute inset-0 transform scale-[0.25] origin-top-left"
                                            style={{ width: '1240px', height: '1754px' }}
                                        >
                                            {/* We approximate the look with color strips if we can't easily re-render */}
                                            <div className="w-full h-full bg-white flex flex-col">
                                                <div className="h-48" style={{ background: state.seasonal.primaryColor }} />
                                                <div className="flex-1 p-10 grid grid-cols-2 gap-10">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="bg-gray-100 rounded-xl" />
                                                    ))}
                                                </div>
                                                <div className="h-40" style={{ background: state.seasonal.primaryColor }} />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
                                            <div className="bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                                                <span className="material-icons-round text-blue-500 text-sm">visibility</span>
                                                <span className="text-[10px] font-black text-gray-800">Bater o olho nas ofertas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] p-1.5 opacity-60">Panfleto_Digital_Carnes.pdf</p>
                            </div>
                        </div>

                        {/* WhatsApp Input */}
                        <div className="p-2 flex items-center gap-2">
                            <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                                <span className="material-icons-round text-xl text-gray-400">sentiment_satisfied</span>
                                <span className="text-sm text-gray-400 flex-1">Mensagem</span>
                                <span className="material-icons-round text-xl text-gray-400">attach_file</span>
                            </div>
                            <div className="w-10 h-10 bg-[#128c7e] rounded-full flex items-center justify-center text-white shadow-sm">
                                <span className="material-icons-round text-xl">mic</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-white text-sm font-bold uppercase tracking-widest opacity-80">Visualização de Cliente</p>
                    <p className="text-white/60 text-xs text-center max-w-[280px]">Este é um exemplo de como seu cliente verá o encarte no WhatsApp.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl"
                    >
                        Voltar para Edição
                    </button>
                </div>
            </div>
        </div>
    );
};
