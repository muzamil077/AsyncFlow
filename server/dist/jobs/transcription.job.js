"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = void 0;
// src/jobs/transcription.job.ts – Background job that receives an audio URL, calls a transcription service (placeholder), and stores the result in the Meeting record.
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
/**
 * Placeholder transcription implementation.
 * In a real system you would call an external service (e.g., OpenAI Whisper, AssemblyAI).
 */
const transcribeAudio = async (meetingId, audioUrl) => {
    try {
        // Simulate a call to a transcription API – here we just fetch the URL length as dummy text.
        const response = await axios_1.default.get(audioUrl);
        const dummyTranscript = `Transcribed ${response.data?.length || 0} characters from ${audioUrl}`;
        await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                transcript: dummyTranscript,
                summary: dummyTranscript.slice(0, 200), // simple preview
            },
        });
    }
    catch (error) {
        console.error('Transcription job failed', error);
        // Optionally, you could store error info in a separate field or retry.
    }
};
exports.transcribeAudio = transcribeAudio;
