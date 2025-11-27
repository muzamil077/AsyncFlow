import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
} from '../controllers/project.controller';

const router = express.Router();
console.log('Project routes loaded.');
router.use(authenticate);
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
