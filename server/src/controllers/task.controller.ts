import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assigneeId, tags } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!title || !projectId) {
            return res.status(400).json({ message: 'Title and Project ID are required' });
        }

        // Verify project ownership (since we only have owner-based access for now)
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this project' });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status as TaskStatus || TaskStatus.TODO,
                priority: priority as TaskPriority || TaskPriority.MEDIUM,
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId,
                assigneeId,
                createdById: userId,
                tags: tags || [],
            },
            include: {
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

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTasks = async (req: Request, res: Response) => {
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

        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                project: true,
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user owns the project the task belongs to
        if (task.project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(task);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate, assigneeId, tags } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const existingTask = await prisma.task.findUnique({
            where: { id },
            include: { project: true },
        });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (existingTask.project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                status: status as TaskStatus,
                priority: priority as TaskPriority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assigneeId,
                tags,
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

        res.json(updatedTask);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const existingTask = await prisma.task.findUnique({
            where: { id },
            include: { project: true },
        });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (existingTask.project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.task.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tasks = await prisma.task.findMany({
            where: { assigneeId: userId },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
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
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
            ],
        });

        res.json(tasks);
    } catch (error) {
        console.error('Get my tasks error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
