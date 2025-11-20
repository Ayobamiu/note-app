import { AIProvider } from './types';
import { GeminiProvider } from './gemini';
import dotenv from 'dotenv';
import path from 'path';
import { app } from 'electron';

// Load env vars from .env file in production/dev
dotenv.config({ path: path.join(process.cwd(), '.env') });

export class AIManager {
    private provider: AIProvider;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        const providerType = process.env.AI_PROVIDER || 'gemini';

        if (!apiKey) {
            console.warn('No API Key found in .env');
        }

        // Factory logic for future providers
        switch (providerType) {
            case 'gemini':
            default:
                this.provider = new GeminiProvider({ apiKey: apiKey || '' });
                break;
        }
    }

    getProvider(): AIProvider {
        return this.provider;
    }
}

export const aiManager = new AIManager();
