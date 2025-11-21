"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeText = void 0;
const openai_1 = __importDefault(require("openai"));
let openai = null;
const getOpenAIClient = () => {
    if (!openai) {
        openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Prevent crash if key is missing
        });
    }
    return openai;
};
const summarizeText = async (text) => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY is not set. Returning dummy summary.');
        return 'This is a dummy summary because the OpenAI API key is missing.';
    }
    try {
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
            model: 'gpt-4o', // or gpt-3.5-turbo
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert project manager. Summarize the following meeting transcript into a concise summary with key decisions and action items.',
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
        });
        return response.choices[0].message.content || 'No summary generated.';
    }
    catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
};
exports.summarizeText = summarizeText;
