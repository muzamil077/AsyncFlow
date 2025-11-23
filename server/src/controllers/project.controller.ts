import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const userId = req.user?.userId;

        console.log('createProject request body:', req.body);
        console.log('createProject user:', req.user);

        if (!userId) {
            console.log('createProject: Unauthorized - No userId');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: userId,
            },
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch projects where user is either the owner OR a member
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId }, // Projects owned by user
                    {
                        members: {
                            some: {
                                userId: userId // Projects where user is a member
                            }
                        }
                    }
                ]
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
        });

        console.log(`getProject: Fetching id=${id}, found=${!!project}`);
        if (project) {
            console.log(`getProject: Project owner=${project.ownerId}, Request user=${userId}`);
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner or member
        const isOwner = project.ownerId === userId;
        const isMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: id,
                    userId: userId,
                }
            }
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                description,
            },
        });

        res.json(updatedProject);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.project.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
