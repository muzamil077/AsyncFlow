"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWorkload = exports.suggestAssignees = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Get AI-powered assignee suggestions for a task
const suggestAssignees = async (projectId, taskTitle, taskDescription) => {
    try {
        // Get project members
        const members = await prisma_1.default.projectMember.findMany({
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
        const project = await prisma_1.default.project.findUnique({
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
        const suggestions = [];
        for (const member of allUsers) {
            const user = member.user;
            // Get user's current workload
            const activeTasks = await prisma_1.default.task.count({
                where: {
                    assigneeId: user.id,
                    status: {
                        in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
                    },
                },
            });
            // Get user's skills
            const skills = await prisma_1.default.userSkill.findMany({
                where: { userId: user.id },
            });
            // Calculate score based on:
            // 1. Workload (lower is better)
            // 2. Skill match (if skills exist)
            // 3. Past performance on similar tasks
            let score = 100;
            const reasons = [];
            // Workload factor (max 40 points deduction)
            const workloadPenalty = Math.min(activeTasks * 10, 40);
            score -= workloadPenalty;
            if (activeTasks === 0) {
                reasons.push('No active tasks');
            }
            else if (activeTasks < 3) {
                reasons.push(`Light workload (${activeTasks} tasks)`);
            }
            else {
                reasons.push(`Heavy workload (${activeTasks} tasks)`);
            }
            // Skill matching (simple keyword matching for now)
            if (skills.length > 0) {
                const taskText = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
                const matchingSkills = skills.filter(s => taskText.includes(s.skill.toLowerCase()));
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
    }
    catch (error) {
        console.error('Suggest assignees error:', error);
        return [];
    }
};
exports.suggestAssignees = suggestAssignees;
// Calculate user's current workload
const calculateWorkload = async (userId) => {
    try {
        const tasks = await prisma_1.default.task.findMany({
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
    }
    catch (error) {
        console.error('Calculate workload error:', error);
        return {
            total: 0,
            byPriority: { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            byStatus: { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0 },
            tasks: [],
        };
    }
};
exports.calculateWorkload = calculateWorkload;
