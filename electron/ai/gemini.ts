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

    async extractReminders(text: string): Promise<{ text: string; due_date: string | null }[]> {
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
        } catch (error) {
            console.error('Error extracting reminders:', error);
            return [];
        }
    }
}
