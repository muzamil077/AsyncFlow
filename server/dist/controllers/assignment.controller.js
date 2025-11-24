"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyWorkload = exports.getUserWorkload = exports.getAssigneeSuggestions = void 0;
const assignment_service_1 = require("../services/assignment.service");
// Get AI-powered assignee suggestions for a task
const getAssigneeSuggestions = async (req, res) => {
    try {
        const { projectId, title, description } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and title are required' });
        }
        const suggestions = await (0, assignment_service_1.suggestAssignees)(projectId, title, description);
        res.json(suggestions);
    }
    catch (error) {
        console.error('Get assignee suggestions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAssigneeSuggestions = getAssigneeSuggestions;
// Get user's workload
const getUserWorkload = async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterId = req.user?.userId;
        if (!requesterId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const workload = await (0, assignment_service_1.calculateWorkload)(userId || requesterId);
        res.json(workload);
    }
    catch (error) {
        console.error('Get user workload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserWorkload = getUserWorkload;
// Get current user's workload
const getMyWorkload = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const workload = await (0, assignment_service_1.calculateWorkload)(userId);
        res.json(workload);
    }
    catch (error) {
        console.error('Get my workload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyWorkload = getMyWorkload;
