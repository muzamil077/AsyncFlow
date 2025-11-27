"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSkill = exports.addSkill = exports.getUserSkills = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
// Get user skills
const getUserSkills = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const targetUserId = req.params.userId || userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const skills = await prisma_1.default.userSkill.findMany({
            where: { userId: targetUserId },
            orderBy: { skill: 'asc' },
        });
        res.json(skills);
    }
    catch (error) {
        console.error('Get user skills error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserSkills = getUserSkills;
// Add a skill
const addSkill = async (req, res) => {
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
        const existingSkill = await prisma_1.default.userSkill.findUnique({
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
        const newSkill = await prisma_1.default.userSkill.create({
            data: {
                userId,
                skill,
                level: level || client_1.SkillLevel.INTERMEDIATE,
            },
        });
        res.status(201).json(newSkill);
    }
    catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addSkill = addSkill;
// Remove a skill
const removeSkill = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { skillId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const skill = await prisma_1.default.userSkill.findUnique({
            where: { id: skillId },
        });
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        if (skill.userId !== userId) {
            return res.status(403).json({ message: 'You can only remove your own skills' });
        }
        await prisma_1.default.userSkill.delete({
            where: { id: skillId },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Remove skill error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.removeSkill = removeSkill;
