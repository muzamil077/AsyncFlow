"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTasksFromMeeting = exports.summarizeWithTeamContext = exports.analyzeDiscussionThread = exports.summarizeText = void 0;
const openai_1 = __importDefault(require("openai"));
const prisma_1 = __importDefault(require("../lib/prisma"));
let openai = null;
const getOpenAIClient = () => {
    if (!openai) {
        openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
            baseURL: 'https://openrouter.ai/api/v1', // OpenRouter endpoint
        });
    }
    return openai;
};
const summarizeText = async (text) => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY is not set. Returning dummy summary.');
        return {
            summary: 'This is a dummy summary because the OpenAI API key is missing.',
            actionItems: ['Dummy action item 1', 'Dummy action item 2'],
            decisions: ['Dummy decision 1'],
            discussionPoints: ['Dummy discussion point 1']
        };
    }
    try {
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
            model: 'openai/gpt-3.5-turbo', // OpenRouter format: provider/model
            messages: [
                {
                    role: 'system',
                    content: `You are an expert project manager. Analyze the following meeting transcript and extract key insights.
                    Return the output strictly as a JSON object with the following keys:
                    - "summary": A concise summary of the meeting.
                    - "actionItems": An array of strings, each representing an actionable task with an owner if mentioned.
                    - "decisions": An array of strings, each representing a key decision made.
                    - "discussionPoints": An array of strings, each representing a major topic discussed.
                    
                    Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
        });
        const content = response.choices[0].message.content || '{}';
        // Clean up potential markdown code blocks if the model adds them despite instructions
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    }
    catch (error) {
        console.error('Error generating summary:', error);
        // Fallback for demo/testing purposes if API fails (e.g., quota exceeded)
        if (error?.status === 429 || error?.code === 'insufficient_quota') {
            console.warn('OpenAI quota exceeded. Returning mock data for demonstration.');
            return {
                summary: 'This is a MOCK summary because the OpenAI API quota was exceeded. The meeting discussed project timelines and resource allocation. Key decisions were made regarding the frontend framework and database schema.',
                actionItems: [
                    'Update the Prisma schema with new models',
                    'Refactor the authentication middleware',
                    'Schedule a team sync for next Tuesday'
                ],
                decisions: [
                    'Use Tailwind CSS for styling',
                    'Adopt Next.js for the frontend'
                ],
                discussionPoints: [
                    'Pros and cons of different UI libraries',
                    'Database performance optimization strategies'
                ]
            };
        }
        throw new Error('Failed to generate summary');
    }
};
exports.summarizeText = summarizeText;
const analyzeDiscussionThread = async (threadText) => {
    if (!process.env.OPENAI_API_KEY) {
        return {
            consensus: ['Mock consensus point 1', 'Mock consensus point 2'],
            disagreements: ['Mock disagreement point 1'],
            summary: 'Mock summary of the discussion thread.'
        };
    }
    try {
        const client = getOpenAIClient();
        const response = await client.chat.completions.create({
            model: 'openai/gpt-3.5-turbo', // OpenRouter format
            messages: [
                {
                    role: 'system',
                    content: `You are an expert moderator. Analyze the following discussion thread.
                    Return the output strictly as a JSON object with the following keys:
                    - "consensus": An array of strings, each representing a point where participants agree.
                    - "disagreements": An array of strings, each representing a point of contention or disagreement.
                    - "summary": A concise summary of the discussion flow.
                    
                    Do not include markdown formatting. Just return the raw JSON string.`,
                },
                {
                    role: 'user',
                    content: threadText,
                },
            ],
        });
        const content = response.choices[0].message.content || '{}';
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    }
    catch (error) {
        console.error('Error analyzing thread:', error);
        if (error?.status === 429 || error?.code === 'insufficient_quota') {
            return {
                consensus: ['Mock consensus: Team agrees on using React', 'Mock consensus: Deadline set for Friday'],
                disagreements: ['Mock disagreement: Choice of state management library'],
                summary: 'Mock summary: The team discussed the frontend stack. There is agreement on React but debate over Redux vs Context.'
            };
        }
        throw new Error('Failed to analyze thread');
    }
};
exports.analyzeDiscussionThread = analyzeDiscussionThread;
// Enhanced summarization with team context
const summarizeWithTeamContext = async (text, projectId) => {
    try {
        let teamContext = '';
        if (projectId) {
            // Get team members and their skills
            const members = await prisma_1.default.projectMember.findMany({
                where: { projectId },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            skills: true,
                        },
                    },
                },
            });
            const project = await prisma_1.default.project.findUnique({
                where: { id: projectId },
                include: {
                    owner: {
                        select: {
                            name: true,
                            skills: true,
                        },
                    },
                },
            });
            if (project && members.length > 0) {
                const teamSkills = members
                    .flatMap(m => m.user.skills.map(s => s.skill))
                    .concat(project.owner.skills.map(s => s.skill));
                teamContext = `\n\nTeam Context:\nTeam size: ${members.length + 1}\nTeam skills: ${[...new Set(teamSkills)].join(', ')}`;
            }
        }
        const prompt = `Analyze this meeting transcript and extract structured information.${teamContext}

Transcript:
${text}

Provide a JSON response with:
1. summary: A concise summary of the meeting
2. actionItems: Array of action items with suggested assignees based on team skills
3. decisions: Array of key decisions made
4. discussionPoints: Array of main discussion topics

Format:
{
  "summary": "...",
  "actionItems": [{"text": "...", "suggestedAssignee": "name or skill"}],
  "decisions": ["..."],
  "discussionPoints": ["..."]
}`;
        getOpenAIClient(); // Initialize OpenAI client
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo', // OpenRouter format
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    }
    catch (error) {
        console.error('AI summarization with team context error:', error);
        // Return mock data
        return {
            summary: 'Meeting summary with team context (mock data)',
            actionItems: [
                { text: 'Review API documentation', suggestedAssignee: 'Backend Developer' },
                { text: 'Design new UI components', suggestedAssignee: 'Frontend Developer' },
            ],
            decisions: ['Approved new feature timeline'],
            discussionPoints: ['API architecture', 'UI/UX improvements'],
        };
    }
};
exports.summarizeWithTeamContext = summarizeWithTeamContext;
// Auto-create tasks from meeting action items
const createTasksFromMeeting = async (meetingId, projectId, createdById) => {
    try {
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: meetingId },
        });
        if (!meeting || !meeting.actionItems) {
            return [];
        }
        const actionItems = meeting.actionItems;
        const createdTasks = [];
        // Get team members for assignment
        const members = await prisma_1.default.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        skills: true,
                    },
                },
            },
        });
        for (const item of actionItems) {
            // Try to match suggested assignee with team member
            let assigneeId = null;
            if (item.suggestedAssignee) {
                const matchedMember = members.find(m => m.user.name?.toLowerCase().includes(item.suggestedAssignee.toLowerCase()) ||
                    m.user.skills.some(s => s.skill.toLowerCase().includes(item.suggestedAssignee.toLowerCase())));
                if (matchedMember) {
                    assigneeId = matchedMember.user.id;
                }
            }
            const task = await prisma_1.default.task.create({
                data: {
                    title: item.text,
                    description: `Auto-generated from meeting: ${meeting.title || 'Untitled Meeting'}`,
                    projectId,
                    createdById,
                    assigneeId,
                    aiGenerated: true,
                    status: 'TODO',
                    priority: 'MEDIUM',
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            createdTasks.push(task);
        }
        return createdTasks;
    }
    catch (error) {
        console.error('Create tasks from meeting error:', error);
        return [];
    }
};
exports.createTasksFromMeeting = createTasksFromMeeting;
