export interface AIProvider {
    generateEmbedding(text: string): Promise<number[]>;
    generateCompletion(prompt: string, context?: string): Promise<string>;
}

export interface AIConfig {
    apiKey: string;
    modelName?: string;
}
