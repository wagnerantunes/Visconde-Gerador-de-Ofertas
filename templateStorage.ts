import { AppState } from '../types';

const TEMPLATES_KEY = 'visconde-templates';

export interface Template {
    id: string;
    name: string;
    createdAt: string;
    state: AppState;
}

export const saveTemplate = (name: string, state: AppState): void => {
    try {
        const templates = loadTemplates();
        const newTemplate: Template = {
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString(),
            state,
        };
        templates.push(newTemplate);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
        console.error('Erro ao salvar template:', error);
    }
};

export const loadTemplates = (): Template[] => {
    try {
        const saved = localStorage.getItem(TEMPLATES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        return [];
    }
};

export const deleteTemplate = (id: string): void => {
    try {
        const templates = loadTemplates().filter(t => t.id !== id);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
        console.error('Erro ao deletar template:', error);
    }
};
