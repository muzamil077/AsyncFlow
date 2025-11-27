"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateProjectContext = exports.generateWikiContent = void 0;
// src/services/wiki-generator.service.ts – Simulates LLM-based documentation generation
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generateWikiContent = async (projectId, context) => {
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
exports.generateWikiContent = generateWikiContent;
const aggregateProjectContext = async (projectId) => {
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
        context += '\n### Recent Meetings\n' + meetings.map((m) => `- ${m.title}: ${m.summary}`).join('\n');
    }
    if (tasks.length > 0) {
        context += '\n### Recent Tasks\n' + tasks.map((t) => `- ${t.title} (${t.status})`).join('\n');
    }
    return context;
};
exports.aggregateProjectContext = aggregateProjectContext;
