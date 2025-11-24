// src/jobs/wiki-update.job.ts – Background job to update wiki pages
import { PrismaClient } from '@prisma/client';
import { generateWikiContent, aggregateProjectContext } from '../services/wiki-generator.service';

const prisma = new PrismaClient();

export const updateProjectWiki = async (projectId: string) => {
    try {
        const context = await aggregateProjectContext(projectId);
        const content = await generateWikiContent(projectId, context);

        // Check if a "Home" page exists, otherwise create it
        const homePage = await prisma.wikiPage.findFirst({
            where: { projectId, title: 'Home' },
        });

        if (homePage) {
            await prisma.wikiPage.update({
                where: { id: homePage.id },
                data: { content, generatedAt: new Date() },
            });
        } else {
            await prisma.wikiPage.create({
                data: {
                    title: 'Home',
                    content,
                    projectId,
                    generatedAt: new Date(),
                },
            });
        }
    } catch (error) {
        console.error('Wiki update job failed', error);
    }
};
