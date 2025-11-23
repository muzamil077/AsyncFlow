"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProjectAdmin = exports.requireProjectMember = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Middleware to check if user is a project member
const requireProjectMember = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId || req.body.projectId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Check if user is owner
        if (project.ownerId === userId) {
            req.user = { userId, role: 'OWNER' };
            return next();
        }
        // Check if user is a member
        const member = await prisma_1.default.projectMember.findUnique({
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
        req.user = { userId, role: member.role };
        next();
    }
    catch (error) {
        console.error('Project member check error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireProjectMember = requireProjectMember;
// Middleware to check if user is project admin or owner
const requireProjectAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId || req.body.projectId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Check if user is owner
        if (project.ownerId === userId) {
            req.user = { userId, role: 'OWNER' };
            return next();
        }
        // Check if user is admin
        const member = await prisma_1.default.projectMember.findUnique({
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
        req.user = { userId, role: member.role };
        next();
    }
    catch (error) {
        console.error('Project admin check error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireProjectAdmin = requireProjectAdmin;
