import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { updateProjectWiki } from '../jobs/wiki-update.job';

const prisma = new PrismaClient();

// Get all wiki pages for a project
export const getProjectWikiPages = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const pages = await prisma.wikiPage.findMany({
            where: { projectId },
            orderBy: { title: 'asc' },
        });
        res.json(pages);
    } catch (error) {
        console.error('Error fetching wiki pages:', error);
        res.status(500).json({ error: 'Failed to fetch wiki pages' });
    }
};

// Get a single wiki page
export const getWikiPage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = await prisma.wikiPage.findUnique({
            where: { id },
        });
        if (!page) {
            return res.status(404).json({ error: 'Wiki page not found' });
        }
        res.json(page);
    } catch (error) {
        console.error('Error fetching wiki page:', error);
        res.status(500).json({ error: 'Failed to fetch wiki page' });
    }
};

// Create a new wiki page
export const createWikiPage = async (req: Request, res: Response) => {
    try {
        const { title, content, projectId } = req.body;
        const page = await prisma.wikiPage.create({
            data: {
                title,
                content,
                projectId,
            },
        });
        res.status(201).json(page);
    } catch (error) {
        console.error('Error creating wiki page:', error);
        res.status(500).json({ error: 'Failed to create wiki page' });
    }
};

// Update a wiki page
export const updateWikiPage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const page = await prisma.wikiPage.update({
            where: { id },
            data: {
                title,
                content,
                generatedAt: new Date(), // Manually edited pages also update timestamp
            },
        });
        res.json(page);
    } catch (error) {
        console.error('Error updating wiki page:', error);
        res.status(500).json({ error: 'Failed to update wiki page' });
    }
};

// Trigger manual regeneration of wiki
export const regenerateWiki = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        // Trigger background job
        await updateProjectWiki(projectId);
        res.json({ message: 'Wiki regeneration triggered' });
    } catch (error) {
        console.error('Error triggering wiki regeneration:', error);
        res.status(500).json({ error: 'Failed to trigger regeneration' });
    }
};
