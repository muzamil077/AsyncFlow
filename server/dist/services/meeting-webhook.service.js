"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMicrosoftWebhook = exports.handleGoogleWebhook = exports.handleZoomWebhook = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Example payload handling – you will need to adapt per provider documentation
const handleZoomWebhook = async (req, res) => {
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
exports.handleZoomWebhook = handleZoomWebhook;
const handleGoogleWebhook = async (req, res) => {
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
exports.handleGoogleWebhook = handleGoogleWebhook;
const handleMicrosoftWebhook = async (req, res) => {
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
exports.handleMicrosoftWebhook = handleMicrosoftWebhook;
