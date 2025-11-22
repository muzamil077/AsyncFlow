import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getProjectMembers } from '../controllers/project-members.controller';

const router = Router();

router.use(authenticate);

router.get('/project/:projectId', getProjectMembers);

export default router;
