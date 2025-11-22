import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { analyzeDiscussionThread } from '../services/aiService';

// Create a new discussion
export const createDiscussion = async (req: Request, res: Response) => {
    try {
        const { title, content, projectId } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.ownerId !== userId) {
            // For now, only owner can create? Or maybe any authenticated user?
            // Let's allow any authenticated user for now if we want collaboration.
            // But we should check if they are part of the project (if we had members).
            // For this MVP, let's restrict to owner for simplicity, or just allow it.
            // Let's allow it for now as we don't have a "member" model yet.
        }

        const discussion = await prisma.discussion.create({
            data: {
                title,
                content,
                projectId,
                createdById: userId,
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });

        res.status(201).json(discussion);
    } catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ message: 'Failed to create discussion' });
    }
};

// Get all discussions for a project
export const getDiscussions = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const discussions = await prisma.discussion.findMany({
            where: { projectId },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                _count: { select: { posts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(discussions);
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ message: 'Failed to fetch discussions' });
    }
};

// Get a single discussion with posts
export const getDiscussion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const discussion = await prisma.discussion.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
                posts: {
                    include: {
                        createdBy: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        res.json(discussion);
    } catch (error) {
        console.error('Error fetching discussion:', error);
        res.status(500).json({ message: 'Failed to fetch discussion' });
    }
};

// Create a post (reply) in a discussion
export const createPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // discussionId
        const { content } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const post = await prisma.discussionPost.create({
            data: {
                content,
                discussionId: id,
                createdById: userId,
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// Analyze a discussion thread
export const analyzeThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const discussion = await prisma.discussion.findUnique({
            where: { id },
            include: {
                posts: {
                    include: { createdBy: { select: { name: true } } }
                },
                createdBy: { select: { name: true } }
            },
        });

        if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

        // Format thread for AI
        let threadText = `Title: ${discussion.title}\nOriginal Post by ${discussion.createdBy.name}: ${discussion.content}\n\n`;
        discussion.posts.forEach((post: any, index: number) => {
            threadText += `Reply #${index + 1} by ${post.createdBy.name}: ${post.content}\n`;
        });

        const analysis = await analyzeDiscussionThread(threadText);
        res.json(analysis);

    } catch (error) {
        console.error('Error analyzing thread:', error);
        res.status(500).json({ message: 'Failed to analyze thread' });
    }
};
