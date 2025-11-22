import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createDiscussion,
    getDiscussions,
    getDiscussion,
    createPost,
    analyzeThread
} from '../controllers/discussion.controller';

const router = express.Router();

router.use(authenticate);

router.post('/', createDiscussion);
router.get('/project/:projectId', getDiscussions);
router.get('/:id', getDiscussion);
router.post('/:id/posts', createPost);
router.post('/:id/analyze', analyzeThread);

export default router;
