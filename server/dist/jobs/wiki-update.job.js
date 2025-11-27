"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectWiki = void 0;
// src/jobs/wiki-update.job.ts – Background job to update wiki pages
const client_1 = require("@prisma/client");
const wiki_generator_service_1 = require("../services/wiki-generator.service");
const prisma = new client_1.PrismaClient();
const updateProjectWiki = async (projectId) => {
    try {
        const context = await (0, wiki_generator_service_1.aggregateProjectContext)(projectId);
        const content = await (0, wiki_generator_service_1.generateWikiContent)(projectId, context);
        // Check if a "Home" page exists, otherwise create it
        const homePage = await prisma.wikiPage.findFirst({
            where: { projectId, title: 'Home' },
        });
        if (homePage) {
            await prisma.wikiPage.update({
                where: { id: homePage.id },
                data: { content, generatedAt: new Date() },
            });
        }
        else {
            await prisma.wikiPage.create({
                data: {
                    title: 'Home',
                    content,
                    projectId,
                    generatedAt: new Date(),
                },
            });
        }
    }
    catch (error) {
        console.error('Wiki update job failed', error);
    }
};
exports.updateProjectWiki = updateProjectWiki;
