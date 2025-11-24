// src/jobs/transcription.job.ts – Background job that receives an audio URL, calls a transcription service (placeholder), and stores the result in the Meeting record.
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Placeholder transcription implementation.
 * In a real system you would call an external service (e.g., OpenAI Whisper, AssemblyAI).
 */
export const transcribeAudio = async (meetingId: string, audioUrl: string) => {
    try {
        // Simulate a call to a transcription API – here we just fetch the URL length as dummy text.
        const response = await axios.get(audioUrl);
        const dummyTranscript = `Transcribed ${response.data?.length || 0} characters from ${audioUrl}`;

        await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                transcript: dummyTranscript,
                summary: dummyTranscript.slice(0, 200), // simple preview
            },
        });
    } catch (error) {
        console.error('Transcription job failed', error);
        // Optionally, you could store error info in a separate field or retry.
    }
};
