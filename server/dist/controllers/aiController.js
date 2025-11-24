"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarize = void 0;
const aiService_1 = require("../services/aiService");
const prisma_1 = __importDefault(require("../lib/prisma"));
const summarize = async (req, res) => {
    try {
        const { text, projectId } = req.body;
        // For now, we'll assume the user is authenticated if the middleware is applied.
        // If this endpoint is public, we might need to handle the user differently.
        // But based on the plan, we should link it to the user.
        const userId = req.user?.userId;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const insights = await (0, aiService_1.summarizeText)(text);
        // Create Meeting record
        const meeting = await prisma_1.default.meeting.create({
            data: {
                transcript: text,
                summary: insights.summary,
                actionItems: insights.actionItems, // Prisma JSON type handling
                decisions: insights.decisions,
                discussionPoints: insights.discussionPoints,
                projectId: projectId || undefined,
                createdById: userId,
                title: `Meeting on ${new Date().toLocaleDateString()}`
            }
        });
        res.json({
            ...insights,
            meetingId: meeting.id
        });
    }
    catch (error) {
        console.error('Error in summarize controller:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
};
exports.summarize = summarize;
