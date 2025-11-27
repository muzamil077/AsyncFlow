'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Trash2, Crown, Shield, User as UserIcon, Eye, XCircle } from 'lucide-react';
import { ProjectMember, MemberRole, ProjectInvitation } from '@/types/member';
import { InviteMemberModal } from './InviteMemberModal';

interface MembersPanelProps {
    projectId: string;
    isOwner: boolean;
    isAdmin: boolean;
}

export const MembersPanel: React.FC<MembersPanelProps> = ({ projectId, isOwner, isAdmin }) => {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        fetchMembers();
        if (isOwner) {
            fetchInvitations();
        }
    }, [projectId]);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/members/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvitations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/invitations/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setInvitations(data);
            }
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/members/${memberId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (response.ok) {
                fetchMembers();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update member role');
            }
        } catch (error) {
            alert('Failed to update member role');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/members/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchMembers();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to remove member');
            }
        } catch (error) {
            alert('Failed to remove member');
        }
    };

    const handleRevokeInvitation = async (invitationId: string) => {
        if (!confirm('Are you sure you want to revoke this invitation?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/invitations/${invitationId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchInvitations();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to revoke invitation');
            }
        } catch (error) {
            alert('Failed to revoke invitation');
        }
    };

    const getRoleIcon = (role: MemberRole) => {
        switch (role) {
            case MemberRole.OWNER:
                return <Crown className="w-4 h-4 text-yellow-500" />;
            case MemberRole.ADMIN:
                return <Shield className="w-4 h-4 text-blue-500" />;
            case MemberRole.MEMBER:
                return <UserIcon className="w-4 h-4 text-gray-500" />;
            case MemberRole.VIEWER:
                return <Eye className="w-4 h-4 text-green-500" />;
        }
    };

    const getRoleBadgeColor = (role: MemberRole) => {
        switch (role) {
            case MemberRole.OWNER:
                return 'bg-yellow-100 text-yellow-800';
            case MemberRole.ADMIN:
                return 'bg-blue-100 text-blue-800';
            case MemberRole.MEMBER:
                return 'bg-gray-100 text-gray-800';
            case MemberRole.VIEWER:
                return 'bg-green-100 text-green-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading members...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-gray-700" />
                    <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {members.length}
                    </span>
                </div>
                {(isOwner || isAdmin) && (
                    <Button onClick={() => setIsInviteModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Members List */}
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {members.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
                                    {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    {member.user.name || member.user.email}
                                </p>
                                <p className="text-sm text-gray-500">{member.user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Role Badge/Selector */}
                            {member.role === MemberRole.OWNER ? (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                    {getRoleIcon(member.role)}
                                    <span className="text-sm font-medium">Owner</span>
                                </div>
                            ) : isOwner ? (
                                <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as MemberRole)}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={MemberRole.VIEWER}>Viewer</option>
                                    <option value={MemberRole.MEMBER}>Member</option>
                                    <option value={MemberRole.ADMIN}>Admin</option>
                                </select>
                            ) : (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                    {getRoleIcon(member.role)}
                                    <span className="text-sm font-medium capitalize">{member.role.toLowerCase()}</span>
                                </div>
                            )}

                            {/* Remove Button */}
                            {member.role !== MemberRole.OWNER && (isOwner || isAdmin) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Invitations */}
            {isOwner && invitations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
                    <div className="bg-yellow-50 rounded-lg border border-yellow-200 divide-y divide-yellow-200">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{invitation.email}</p>
                                    <p className="text-sm text-gray-600">
                                        Invited as {invitation.role.toLowerCase()} •
                                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full ${getRoleBadgeColor(invitation.role)}`}>
                                        <span className="text-sm font-medium capitalize">{invitation.role.toLowerCase()}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevokeInvitation(invitation.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={projectId}
                onInviteSent={() => {
                    fetchInvitations();
                }}
            />
        </div>
    );
};
