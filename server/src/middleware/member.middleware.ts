import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Middleware to check if user is a project member
export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId || req.body.projectId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner
        if (project.ownerId === userId) {
            req.user = { ...req.user, role: 'OWNER' };
            return next();
        }

        // Check if user is a member
        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        if (!member) {
            return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
        }

        req.user = { ...req.user, role: member.role };
        next();
    } catch (error) {
        console.error('Project member check error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to check if user is project admin or owner
export const requireProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId || req.body.projectId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is owner
        if (project.ownerId === userId) {
            req.user = { ...req.user, role: 'OWNER' };
            return next();
        }

        // Check if user is admin
        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        if (!member || member.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }

        req.user = { ...req.user, role: member.role };
        next();
    } catch (error) {
        console.error('Project admin check error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
