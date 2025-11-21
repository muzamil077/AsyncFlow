"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }
        const project = await prisma_1.default.project.create({
            data: {
                name,
                description,
                ownerId: userId,
            },
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const projects = await prisma_1.default.project.findMany({
            where: {
                ownerId: userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        res.json(projects);
    }
    catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProjects = getProjects;
const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = await prisma_1.default.project.findUnique({
            where: { id },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProject = getProject;
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = await prisma_1.default.project.findUnique({
            where: { id },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedProject = await prisma_1.default.project.update({
            where: { id },
            data: {
                name,
                description,
            },
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = await prisma_1.default.project.findUnique({
            where: { id },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await prisma_1.default.project.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteProject = deleteProject;
