export enum MemberRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

export interface User {
    id: string;
    name: string | null;
    email: string;
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: MemberRole;
    joinedAt: string;
    user: User;
}

export interface ProjectInvitation {
    id: string;
    projectId: string;
    email: string;
    role: MemberRole;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    invitedBy: string;
    expiresAt: string;
    createdAt: string;
    inviter?: {
        name: string | null;
        email: string;
    };
    project?: {
        name: string;
    };
    invitationLink?: string;
}

export interface InviteMemberData {
    projectId: string;
    email: string;
    role?: MemberRole;
}
