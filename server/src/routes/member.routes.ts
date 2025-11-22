import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    inviteMember,
    acceptInvitation,
    getMembers,
    updateMemberRole,
    removeMember,
    getInvitations,
} from '../controllers/member.controller';

const router = Router();

router.use(authenticate);

router.post('/invite', inviteMember);
router.post('/accept/:token', acceptInvitation);
router.get('/project/:projectId', getMembers);
router.get('/invitations/:projectId', getInvitations);
router.put('/:memberId/role', updateMemberRole);
router.delete('/:memberId', removeMember);

export default router;
