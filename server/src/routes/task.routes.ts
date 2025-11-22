import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getMyTasks
} from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.get('/my-tasks', getMyTasks);  // Must be before /:id to avoid conflict
router.get('/project/:projectId', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
