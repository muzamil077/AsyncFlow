import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    getProjectWikiPages,
    getWikiPage,
    createWikiPage,
    updateWikiPage,
    regenerateWiki
} from '../controllers/wiki.controller';

const router = Router();

router.get('/project/:projectId', authenticate, getProjectWikiPages);
router.get('/:id', authenticate, getWikiPage);
router.post('/', authenticate, createWikiPage);
router.put('/:id', authenticate, updateWikiPage);
router.post('/regenerate', authenticate, regenerateWiki);

export default router;
