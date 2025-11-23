import { Request, Response } from 'express';
import { summarizeText } from '../services/aiService';
import prisma from '../lib/prisma';

export const summarize = async (req: Request, res: Response) => {
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

        const insights = await summarizeText(text);

        // Create Meeting record
        const meeting = await prisma.meeting.create({
            data: {
                transcript: text,
                summary: insights.summary,
                actionItems: insights.actionItems as any, // Prisma JSON type handling
                decisions: insights.decisions as any,
                discussionPoints: insights.discussionPoints as any,
                projectId: projectId || undefined,
                createdById: userId,
                title: `Meeting on ${new Date().toLocaleDateString()}`
            }
        });

        res.json({
            ...insights,
            meetingId: meeting.id
        });
    } catch (error: any) {
        console.error('Error in summarize controller:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
};
