import { Request, Response } from 'express';
import { listImportableMeetings, processMeeting } from '../services/meeting-import.service';
import prisma from '../lib/prisma';

export const getImportableMeetings = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const meetings = await listImportableMeetings(userId);
        res.json(meetings);
    } catch (error: any) {
        console.error('Error fetching importable meetings:', error);
        res.status(500).json({ error: 'Failed to fetch importable meetings' });
    }
};

export const importMeeting = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { meetingId, provider, projectId } = req.body;

        if (!meetingId || !provider || !projectId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await processMeeting(userId, meetingId, provider, projectId);

        // Create Meeting entry in DB
        const meeting = await prisma.meeting.create({
            data: {
                title: `Imported ${provider} Meeting`, // We could pass the real title if we had it in the body
                transcript: "Transcript placeholder", // We would put real transcript here
                summary: result.summary,
                actionItems: result.actionItems as any,
                decisions: result.decisions as any,
                provider: provider,
                externalId: meetingId,
                projectId: projectId,
                createdById: userId,
                date: new Date(), // Ideally we pass the real date
            }
        });

        res.json(meeting);
    } catch (error: any) {
        console.error('Error importing meeting:', error);
        res.status(500).json({ error: 'Failed to import meeting' });
    }
};
