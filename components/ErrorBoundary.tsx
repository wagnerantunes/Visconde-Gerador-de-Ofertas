import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full border-l-4 border-red-500">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="material-icons-round text-5xl text-red-500">error_outline</span>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Ops! Algo deu errado.</h1>
                                <p className="text-gray-600">Ocorreu um erro inesperado na aplicação.</p>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 mb-6 border border-gray-200">
                            <p className="font-mono text-sm text-red-600 font-bold mb-2">
                                {this.state.error?.toString()}
                            </p>
                            <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold shadow-md"
                            >
                                Recarregar Página
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
                            >
                                Limpar Dados e Recarregar
                            </button>
                        </div>

                        <p className="mt-6 text-xs text-gray-400 text-center">
                            Se o erro persistir após limpar os dados, contate o suporte.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
