
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const { showToast } = useToast();
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await signUpWithEmail(email, password, fullName);
                if (error) throw error;
                showToast('success', 'Conta criada! Verifique seu e-mail para confirmar.');
                onClose();
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) throw error;
                showToast('success', 'Login realizado com sucesso!');
                onClose();
            }
        } catch (error: any) {
            console.error(error);
            showToast('error', error.message || 'Erro ao realizar autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-primary to-primary-dark text-white text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                        <span className="material-icons-round text-2xl">person</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                        {mode === 'login' ? 'Login' : 'Criar Conta'}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">Salve seus layouts na nuvem</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {mode === 'signup' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Seu nome"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Senha</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="********"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full bg-primary hover:brightness-110 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                mode === 'login' ? 'Entrar' : 'Cadastrar'
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-2 my-2">
                        <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-xs text-gray-400 uppercase">ou</span>
                        <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        className="flex items-center justify-center gap-3 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm group"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                        <span>Entrar com Google</span>
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-2">
                        {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="ml-1 text-primary font-bold hover:underline"
                        >
                            {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                        </button>
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-bold py-2 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
