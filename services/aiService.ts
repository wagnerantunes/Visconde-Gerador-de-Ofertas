import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateAIContent = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        throw new Error("Chave de API não encontrada.\nAdicione VITE_GEMINI_API_KEY no arquivo .env");
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new Error("Falha ao gerar conteúdo com IA. Verifique sua conexão e cota.");
    }
};
