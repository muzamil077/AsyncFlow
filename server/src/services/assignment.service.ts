import prisma from '../lib/prisma';
import { summarizeText } from './aiService';

interface AssigneeSuggestion {
    userId: string;
    userName: string | null;
    email: string;
    score: number;
    reasons: string[];
    currentWorkload: number;
}

// Get AI-powered assignee suggestions for a task
export const suggestAssignees = async (
    projectId: string,
    taskTitle: string,
    taskDescription?: string
): Promise<AssigneeSuggestion[]> => {
    try {
        // Get project members
        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Get project owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!project) {
            return [];
        }

        // Combine owner and members
        const allUsers = [
            { user: project.owner },
            ...members,
        ];

        // Calculate suggestions for each user
        const suggestions: AssigneeSuggestion[] = [];

        for (const member of allUsers) {
            const user = member.user;

            // Get user's current workload
            const activeTasks = await prisma.task.count({
                where: {
                    assigneeId: user.id,
                    status: {
                        in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
                    },
                },
            });

            // Get user's skills
            const skills = await prisma.userSkill.findMany({
                where: { userId: user.id },
            });

            // Calculate score based on:
            // 1. Workload (lower is better)
            // 2. Skill match (if skills exist)
            // 3. Past performance on similar tasks

            let score = 100;
            const reasons: string[] = [];

            // Workload factor (max 40 points deduction)
            const workloadPenalty = Math.min(activeTasks * 10, 40);
            score -= workloadPenalty;

            if (activeTasks === 0) {
                reasons.push('No active tasks');
            } else if (activeTasks < 3) {
                reasons.push(`Light workload (${activeTasks} tasks)`);
            } else {
                reasons.push(`Heavy workload (${activeTasks} tasks)`);
            }

            // Skill matching (simple keyword matching for now)
            if (skills.length > 0) {
                const taskText = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
                const matchingSkills = skills.filter(s =>
                    taskText.includes(s.skill.toLowerCase())
                );

                if (matchingSkills.length > 0) {
                    score += matchingSkills.length * 10;
                    reasons.push(`Skills: ${matchingSkills.map(s => s.skill).join(', ')}`);
                }
            }

            suggestions.push({
                userId: user.id,
                userName: user.name,
                email: user.email,
                score,
                reasons,
                currentWorkload: activeTasks,
            });
        }

        // Sort by score (highest first)
        suggestions.sort((a, b) => b.score - a.score);

        return suggestions.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
        console.error('Suggest assignees error:', error);
        return [];
    }
};

// Calculate user's current workload
export const calculateWorkload = async (userId: string) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                assigneeId: userId,
                status: {
                    in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
                },
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const byPriority = {
            URGENT: tasks.filter(t => t.priority === 'URGENT').length,
            HIGH: tasks.filter(t => t.priority === 'HIGH').length,
            MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
            LOW: tasks.filter(t => t.priority === 'LOW').length,
        };

        const byStatus = {
            TODO: tasks.filter(t => t.status === 'TODO').length,
            IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            IN_REVIEW: tasks.filter(t => t.status === 'IN_REVIEW').length,
        };

        return {
            total: tasks.length,
            byPriority,
            byStatus,
            tasks: tasks.map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                status: t.status,
                project: t.project.name,
                dueDate: t.dueDate,
            })),
        };
    } catch (error) {
        console.error('Calculate workload error:', error);
        return {
            total: 0,
            byPriority: { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            byStatus: { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0 },
            tasks: [],
        };
    }
};
