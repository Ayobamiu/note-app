export interface AIProvider {
    generateEmbedding(text: string): Promise<number[]>;
    generateCompletion(prompt: string, context?: string): Promise<string>;
    extractReminders(text: string): Promise<{ text: string; due_date: string | null }[]>;
}

export interface AIConfig {
    apiKey: string;
    modelName?: string;
}
