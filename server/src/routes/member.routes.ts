import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    inviteMember,
    acceptInvitation,
    getMembers,
    updateMemberRole,
    removeMember,
    getInvitations,
    revokeInvitation,
} from '../controllers/member.controller';

const router = Router();

router.use(authenticate);

router.post('/invite', inviteMember);
router.post('/accept/:token', acceptInvitation);
router.get('/members/:projectId', getMembers);
router.get('/invitations/:projectId', getInvitations);
router.delete('/invitations/:invitationId', revokeInvitation);
router.patch('/members/:memberId', updateMemberRole);
router.delete('/members/:memberId', removeMember);

export default router;
