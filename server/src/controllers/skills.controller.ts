import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { SkillLevel } from '@prisma/client';

// Get user skills
export const getUserSkills = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const targetUserId = req.params.userId || userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const skills = await prisma.userSkill.findMany({
            where: { userId: targetUserId },
            orderBy: { skill: 'asc' },
        });

        res.json(skills);
    } catch (error) {
        console.error('Get user skills error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a skill
export const addSkill = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { skill, level } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!skill) {
            return res.status(400).json({ message: 'Skill name is required' });
        }

        // Check if skill already exists for user
        const existingSkill = await prisma.userSkill.findUnique({
            where: {
                userId_skill: {
                    userId,
                    skill,
                },
            },
        });

        if (existingSkill) {
            return res.status(400).json({ message: 'Skill already added' });
        }

        const newSkill = await prisma.userSkill.create({
            data: {
                userId,
                skill,
                level: level || SkillLevel.INTERMEDIATE,
            },
        });

        res.status(201).json(newSkill);
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove a skill
export const removeSkill = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { skillId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const skill = await prisma.userSkill.findUnique({
            where: { id: skillId },
        });

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        if (skill.userId !== userId) {
            return res.status(403).json({ message: 'You can only remove your own skills' });
        }

        await prisma.userSkill.delete({
            where: { id: skillId },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Remove skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
