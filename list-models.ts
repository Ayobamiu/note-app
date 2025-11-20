import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Just to get the client
        // The SDK doesn't have a direct listModels method on the client in all versions, 
        // but let's try the one documented or fallback to a known working one.
        // Actually, for the node SDK, we might need to use the model manager if exposed, 
        // or just try a simple generation to see if it works, but the user error says "Call ListModels".
        // The error comes from the API, not the SDK validation locally.

        // Let's try to use the API directly via fetch if the SDK is obscure about listing.
        // But wait, the SDK usually has a way.
        // Let's try a simple fetch to the API endpoint for listing models.

        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        interface GeminiModel {
            name: string;
            supportedGenerationMethods: string[];
        }

        console.log('Available Models:');
        if (data.models) {
            data.models.forEach((m: GeminiModel) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found or error:', data);
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
