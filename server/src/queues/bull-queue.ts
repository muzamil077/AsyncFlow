// src/queues/bull-queue.ts – Bull queue setup for background jobs (transcription, wiki updates)
import Bull from 'bull';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a queue named "meetingQueue"
export const meetingQueue = new Bull('meetingQueue', {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
});

// Example of adding a transcription job
export const addTranscriptionJob = async (meetingId: string, audioUrl: string) => {
    await meetingQueue.add('transcribe', { meetingId, audioUrl }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
    });
};

// Process jobs – the actual processor is defined in a separate file (transcription.job.ts)
meetingQueue.process('transcribe', async (job: Bull.Job) => {
    const { meetingId, audioUrl } = job.data;
    // Lazy import to avoid circular dependencies
    const { transcribeAudio } = await import('../jobs/transcription.job');
    await transcribeAudio(meetingId, audioUrl);
});

export default meetingQueue;
