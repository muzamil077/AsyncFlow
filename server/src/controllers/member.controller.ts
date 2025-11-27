import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import { sendInvitationEmail } from '../services/email.service';

// Invite a member to a project
export const inviteMember = async (req: Request, res: Response) => {
    try {
        const { projectId, email, role } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!email || !projectId) {
            return res.status(400).json({ message: 'Email and project ID are required' });
        }

        // Verify user is project owner or admin
        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isOwner = project.ownerId === userId;
        const isAdmin = member?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only project owners and admins can invite members' });
        }

        // Check if user is already a member
        const invitedUser = await prisma.user.findUnique({
            where: { email },
        });

        if (invitedUser) {
            const existingMember = await prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId,
                        userId: invitedUser.id,
                    },
                },
            });

            if (existingMember) {
                return res.status(400).json({ message: 'User is already a member of this project' });
            }
        }

        // Check for existing pending invitation
        const existingInvitation = await prisma.projectInvitation.findFirst({
            where: {
                projectId,
                email,
                status: 'PENDING',
            },
        });

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this email' });
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const invitation = await prisma.projectInvitation.create({
            data: {
                projectId,
                email,
                role: role || 'MEMBER',
                token,
                invitedBy: userId,
                expiresAt,
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Send invitation email
        const invitationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/invite/${token}`;

        try {
            await sendInvitationEmail({
                to: email,
                projectName: invitation.project.name,
                inviterName: invitation.inviter.name || invitation.inviter.email,
                invitationLink,
                expiresAt,
            });
            console.log(`Invitation email sent to ${email}`);
        } catch (emailError) {
            // Log error but don't fail the invitation creation
            console.error('Failed to send invitation email, but invitation was created:', emailError);
        }

        res.status(201).json({
            ...invitation,
            invitationLink,
        });
    } catch (error) {
        console.error('Invite member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Accept invitation
export const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const invitation = await prisma.projectInvitation.findUnique({
            where: { token },
            include: {
                project: true,
            },
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ message: 'Invitation is no longer valid' });
        }

        if (new Date() > invitation.expiresAt) {
            await prisma.projectInvitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            return res.status(400).json({ message: 'Invitation has expired' });
        }


        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if the logged-in user matches the invitation email
        if (user.email !== invitation.email) {
            return res.status(403).json({ message: 'This invitation is for a different email address. Please log in with the correct account.' });
        }


        // Check if already a member
        const existingMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: invitation.projectId,
                    userId,
                },
            },
        });

        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of this project' });
        }

        // Add user as member
        const member = await prisma.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId,
                role: invitation.role,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update invitation status
        await prisma.projectInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
        });

        res.json(member);
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get project members
export const getMembers = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify user has access to this project
        const member = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!member && project.ownerId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });

        // Include owner
        const owner = await prisma.user.findUnique({
            where: { id: project.ownerId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        const allMembers = [
            {
                id: 'owner',
                projectId,
                userId: project.ownerId,
                role: 'OWNER',
                joinedAt: project.createdAt,
                user: owner,
            },
            ...members,
        ];

        res.json(allMembers);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        const { role } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { project: true },
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Only owner can change roles
        if (member.project.ownerId !== userId) {
            return res.status(403).json({ message: 'Only project owner can change member roles' });
        }

        const updatedMember = await prisma.projectMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(updatedMember);
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove member
export const removeMember = async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { project: true },
        });

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Owner or admin can remove members
        const requesterMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: member.projectId,
                    userId,
                },
            },
        });

        const isOwner = member.project.ownerId === userId;
        const isAdmin = requesterMember?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Only project owner or admin can remove members' });
        }

        await prisma.projectMember.delete({
            where: { id: memberId },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get pending invitations for a project
export const getInvitations = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Only project owner can view invitations' });
        }

        const invitations = await prisma.projectInvitation.findMany({
            where: {
                projectId,
                status: 'PENDING',
            },
            include: {
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(invitations);
    } catch (error) {
        console.error('Get invitations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Revoke invitation
export const revokeInvitation = async (req: Request, res: Response) => {
    try {
        const { invitationId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const invitation = await prisma.projectInvitation.findUnique({
            where: { id: invitationId },
            include: { project: true },
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Only owner can revoke invitations
        if (invitation.project.ownerId !== userId) {
            return res.status(403).json({ message: 'Only project owner can revoke invitations' });
        }

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ message: 'Only pending invitations can be revoked' });
        }

        await prisma.projectInvitation.update({
            where: { id: invitationId },
            data: { status: 'REVOKED' },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Revoke invitation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
