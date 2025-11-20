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
    async extractReminders(text) {
        const currentDate = new Date().toISOString().split('T')[0];
        console.log('Extracting reminders for text:', text);
        console.log('Current Date Context:', currentDate);
        const prompt = `
      Analyze the following note content and extract any actionable reminders, tasks, or events (like meetings).
      
      Context: Today is ${currentDate}.
      
      Return a JSON array of objects with:
      - "text": The description of the reminder/task.
      - "due_date": The date in YYYY-MM-DD format. If a specific date is mentioned (e.g. "Nov 24"), use the current year (${new Date().getFullYear()}) unless specified otherwise. If relative (e.g. "tomorrow"), calculate it based on today's date. If no date is mentioned, use null.
      
      If no reminders are found, return an empty array [].
      
      Note Content:
      ${text}
      
      Output JSON only:
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();
            console.log('AI Raw Response:', textResponse);
            // Clean up markdown code blocks if present
            const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            console.log('Parsed Reminders:', parsed);
            return parsed;
        }
        catch (error) {
            console.error('Error extracting reminders:', error);
            return [];
        }
    }
}
exports.GeminiProvider = GeminiProvider;
