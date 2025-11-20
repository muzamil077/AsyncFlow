import { Request, Response } from 'express';
import { summarizeText } from '../services/aiService';

export const summarize = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const summary = await summarizeText(text);
        res.json({ summary });
    } catch (error) {
        console.error('Error in summarize controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
