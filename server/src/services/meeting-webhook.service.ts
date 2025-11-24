// src/services/meeting-webhook.service.ts – Handles incoming webhook events from Zoom, Google Meet, Microsoft Teams
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example payload handling – you will need to adapt per provider documentation
export const handleZoomWebhook = async (req: Request, res: Response) => {
    const event = req.body;
    // Verify webhook signature if needed (omitted for brevity)
    if (event.event === 'meeting.created') {
        const meeting = event.payload.object;
        await prisma.meeting.create({
            data: {
                externalId: meeting.id,
                provider: 'zoom',
                title: meeting.topic,
                date: new Date(meeting.start_time),
                // transcript will be filled later by transcription job
                transcript: '',
                summary: '',
                // optional fields left null
                projectId: null,
                createdById: req.user?.userId || '', // assuming auth middleware sets req.user
            },
        });
    }
    res.sendStatus(200);
};

export const handleGoogleWebhook = async (req: Request, res: Response) => {
    const event = req.body;
    // Google Calendar webhook payload handling (simplified)
    if (event.type === 'calendar#event') {
        const meeting = event;
        await prisma.meeting.create({
            data: {
                externalId: meeting.id,
                provider: 'google',
                title: meeting.summary,
                date: new Date(meeting.start.dateTime),
                transcript: '',
                summary: '',
                projectId: null,
                createdById: req.user?.userId || '',
            },
        });
    }
    res.sendStatus(200);
};

export const handleMicrosoftWebhook = async (req: Request, res: Response) => {
    const event = req.body;
    // Microsoft Graph webhook payload handling (simplified)
    if (event.eventType === 'created') {
        const meeting = event.resourceData;
        await prisma.meeting.create({
            data: {
                externalId: meeting.id,
                provider: 'teams',
                title: meeting.subject,
                date: new Date(meeting.start.dateTime),
                transcript: '',
                summary: '',
                projectId: null,
                createdById: req.user?.userId || '',
            },
        });
    }
    res.sendStatus(200);
};
