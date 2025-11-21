"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarize = void 0;
const aiService_1 = require("../services/aiService");
const summarize = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        const summary = await (0, aiService_1.summarizeText)(text);
        res.json({ summary });
    }
    catch (error) {
        console.error('Error in summarize controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.summarize = summarize;
