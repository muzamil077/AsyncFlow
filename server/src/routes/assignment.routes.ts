import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getAssigneeSuggestions,
    getUserWorkload,
    getMyWorkload,
} from '../controllers/assignment.controller';

const router = Router();

router.use(authenticate);

router.post('/suggest', getAssigneeSuggestions);
router.get('/workload/:userId', getUserWorkload);
router.get('/my-workload', getMyWorkload);

export default router;
