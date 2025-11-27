"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateWiki = exports.updateWikiPage = exports.createWikiPage = exports.getWikiPage = exports.getProjectWikiPages = void 0;
const client_1 = require("@prisma/client");
const wiki_update_job_1 = require("../jobs/wiki-update.job");
const prisma = new client_1.PrismaClient();
// Get all wiki pages for a project
const getProjectWikiPages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const pages = await prisma.wikiPage.findMany({
            where: { projectId },
            orderBy: { title: 'asc' },
        });
        res.json(pages);
    }
    catch (error) {
        console.error('Error fetching wiki pages:', error);
        res.status(500).json({ error: 'Failed to fetch wiki pages' });
    }
};
exports.getProjectWikiPages = getProjectWikiPages;
// Get a single wiki page
const getWikiPage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await prisma.wikiPage.findUnique({
            where: { id },
        });
        if (!page) {
            return res.status(404).json({ error: 'Wiki page not found' });
        }
        res.json(page);
    }
    catch (error) {
        console.error('Error fetching wiki page:', error);
        res.status(500).json({ error: 'Failed to fetch wiki page' });
    }
};
exports.getWikiPage = getWikiPage;
// Create a new wiki page
const createWikiPage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error creating wiki page:', error);
        res.status(500).json({ error: 'Failed to create wiki page' });
    }
};
exports.createWikiPage = createWikiPage;
// Update a wiki page
const updateWikiPage = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error updating wiki page:', error);
        res.status(500).json({ error: 'Failed to update wiki page' });
    }
};
exports.updateWikiPage = updateWikiPage;
// Trigger manual regeneration of wiki
const regenerateWiki = async (req, res) => {
    try {
        const { projectId } = req.body;
        // Trigger background job
        await (0, wiki_update_job_1.updateProjectWiki)(projectId);
        res.json({ message: 'Wiki regeneration triggered' });
    }
    catch (error) {
        console.error('Error triggering wiki regeneration:', error);
        res.status(500).json({ error: 'Failed to trigger regeneration' });
    }
};
exports.regenerateWiki = regenerateWiki;
