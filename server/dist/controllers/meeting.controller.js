"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.updateMeeting = exports.getMeetingById = exports.getProjectMeetings = exports.createMeeting = void 0;
const client_1 = require("@prisma/client");
const bull_queue_1 = require("../queues/bull-queue");
const prisma = new client_1.PrismaClient();
// Create a manual meeting entry
const createMeeting = async (req, res) => {
    try {
        const { title, date, projectId, audioUrl } = req.body;
        const userId = req.user?.id;
        const meeting = await prisma.meeting.create({
            data: {
                title,
                date: new Date(date),
                projectId,
                createdById: userId,
                transcript: '',
                summary: '',
                provider: 'manual',
            },
        });
        // If an audio URL is provided, trigger transcription job
        if (audioUrl) {
            await (0, bull_queue_1.addTranscriptionJob)(meeting.id, audioUrl);
        }
        res.status(201).json(meeting);
    }
    catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
};
exports.createMeeting = createMeeting;
// List meetings for a project
const getProjectMeetings = async (req, res) => {
    try {
        const { projectId } = req.params;
        const meetings = await prisma.meeting.findMany({
            where: { projectId },
            orderBy: { date: 'desc' },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        res.json(meetings);
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};
exports.getProjectMeetings = getProjectMeetings;
// Get a single meeting detail
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await prisma.meeting.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    }
    catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
};
exports.getMeetingById = getMeetingById;
// Update meeting (e.g. edit summary or transcript)
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, summary, transcript, actionItems } = req.body;
        const meeting = await prisma.meeting.update({
            where: { id },
            data: {
                title,
                summary,
                transcript,
                actionItems,
            },
        });
        res.json(meeting);
    }
    catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
};
exports.updateMeeting = updateMeeting;
// Delete meeting
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.meeting.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
};
exports.deleteMeeting = deleteMeeting;
