import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIConfig } from './types';

export class GeminiProvider implements AIProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private embeddingModel: any;

    constructor(config: AIConfig) {
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.modelName || 'gemini-2.0-flash' });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        if (!text || text.trim().length === 0) return [];

        const result = await this.embeddingModel.embedContent(text);
        return result.embedding.values;
    }

    async generateCompletion(prompt: string, context: string = ''): Promise<string> {
        const systemPrompt = `
      You are an intelligent assistant for a note-taking app.
      Answer the user's question based ONLY on the provided context (notes).
      If the answer is not in the context, say "I don't have enough information in your notes to answer that."
      
      Context:
      ${context}
    `;

        const result = await this.model.generateContent([systemPrompt, prompt]);
        const response = await result.response;
        return response.text();
    }
}
