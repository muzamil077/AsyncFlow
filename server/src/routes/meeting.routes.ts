import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createMeeting,
    getProjectMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting
} from '../controllers/meeting.controller';

const router = Router();
router.post('/', authenticate, createMeeting);
router.get('/project/:projectId', authenticate, getProjectMeetings);
router.get('/:id', authenticate, getMeetingById);
router.put('/:id', authenticate, updateMeeting);
router.delete('/:id', authenticate, deleteMeeting);

export default router;
