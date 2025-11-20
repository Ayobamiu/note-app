"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    genAI;
    model;
    embeddingModel;
    constructor(config) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.modelName || 'gemini-2.0-flash' });
        this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    }
    async generateEmbedding(text) {
        if (!text || text.trim().length === 0)
            return [];
        const result = await this.embeddingModel.embedContent(text);
        return result.embedding.values;
    }
    async generateCompletion(prompt, context = '') {
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
exports.GeminiProvider = GeminiProvider;
