import { Request, Response } from 'express';
import { suggestAssignees, calculateWorkload } from '../services/assignment.service';

// Get AI-powered assignee suggestions for a task
export const getAssigneeSuggestions = async (req: Request, res: Response) => {
    try {
        const { projectId, title, description } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and title are required' });
        }

        const suggestions = await suggestAssignees(projectId, title, description);
        res.json(suggestions);
    } catch (error) {
        console.error('Get assignee suggestions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's workload
export const getUserWorkload = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const requesterId = req.user?.userId;

        if (!requesterId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workload = await calculateWorkload(userId || requesterId);
        res.json(workload);
    } catch (error) {
        console.error('Get user workload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get current user's workload
export const getMyWorkload = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const workload = await calculateWorkload(userId);
        res.json(workload);
    } catch (error) {
        console.error('Get my workload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
