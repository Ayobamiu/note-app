"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiManager = exports.AIManager = void 0;
const gemini_1 = require("./gemini");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env vars from .env file in production/dev
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
class AIManager {
    provider;
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
                this.provider = new gemini_1.GeminiProvider({ apiKey: apiKey || '' });
                break;
        }
    }
    getProvider() {
        return this.provider;
    }
}
exports.AIManager = AIManager;
exports.aiManager = new AIManager();
