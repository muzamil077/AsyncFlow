import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all users who have tasks in a project (temporary solution for Quick Wins)
export const getProjectMembers = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Get unique users who are either:
        // 1. Project owner
        // 2. Assigned to tasks in this project
        // 3. Created tasks in this project
        const tasks = await prisma.task.findMany({
            where: { projectId },
            select: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Collect unique users
        const userMap = new Map();

        // Add project owner
        const owner = await prisma.user.findUnique({
            where: { id: project.ownerId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (owner) {
            userMap.set(owner.id, owner);
        }

        // Add assignees and creators
        tasks.forEach(task => {
            if (task.assignee) {
                userMap.set(task.assignee.id, task.assignee);
            }
            if (task.createdBy) {
                userMap.set(task.createdBy.id, task.createdBy);
            }
        });

        const members = Array.from(userMap.values());
        res.json(members);
    } catch (error) {
        console.error('Get project members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
