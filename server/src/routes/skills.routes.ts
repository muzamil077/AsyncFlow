import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUserSkills, addSkill, removeSkill } from '../controllers/skills.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', getUserSkills);
router.get('/:userId', getUserSkills);
router.post('/', addSkill);
router.delete('/:skillId', removeSkill);

export default router;
