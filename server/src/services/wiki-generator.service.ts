// src/services/wiki-generator.service.ts – Simulates LLM-based documentation generation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateWikiContent = async (projectId: string, context: string): Promise<string> => {
    // In a real implementation, this would call OpenAI or another LLM API
    // passing the context (meeting transcripts, tasks, discussions)

    const simulatedResponse = `
# Project Documentation

## Overview
Auto-generated documentation based on recent project activity.

## Recent Updates
${context}

## Key Decisions
- Extracted from meeting transcripts...
- Extracted from discussion threads...

## Next Steps
- Based on open tasks...
`;

    return simulatedResponse;
};

export const aggregateProjectContext = async (projectId: string): Promise<string> => {
    // Fetch recent meetings, tasks, discussions to build context
    const meetings = await prisma.meeting.findMany({
        where: { projectId },
        take: 5,
        orderBy: { date: 'desc' },
    });

    const tasks = await prisma.task.findMany({
        where: { projectId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
    });

    let context = '';
    if (meetings.length > 0) {
        context += '\n### Recent Meetings\n' + meetings.map((m: any) => `- ${m.title}: ${m.summary}`).join('\n');
    }
    if (tasks.length > 0) {
        context += '\n### Recent Tasks\n' + tasks.map((t: any) => `- ${t.title} (${t.status})`).join('\n');
    }

    return context;
};
