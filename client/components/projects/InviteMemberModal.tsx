'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Copy, Check } from 'lucide-react';
import { MemberRole, ProjectInvitation } from '@/types/member';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onInviteSent?: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    isOpen,
    onClose,
    projectId,
    onInviteSent,
}) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<MemberRole>(MemberRole.MEMBER);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<ProjectInvitation | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/team/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId, email, role }),
            });

            if (response.ok) {
                const data = await response.json();
                setInvitation(data);
                setEmail('');
                onInviteSent?.();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to send invitation');
            }
        } catch (err) {
            setError('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (invitation?.invitationLink) {
            navigator.clipboard.writeText(invitation.invitationLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setEmail('');
        setRole(MemberRole.MEMBER);
        setError(null);
        setInvitation(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Invite Team Member
                </h2>

                {!invitation ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as MemberRole)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={loading}
                            >
                                <option value={MemberRole.MEMBER}>Member</option>
                                <option value={MemberRole.ADMIN}>Admin</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                Members can view and edit tasks. Admins can also invite and manage members.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-green-800 font-medium mb-2">
                                ✓ Invitation sent successfully!
                            </p>
                            <p className="text-green-700 text-sm">
                                An invitation has been sent to <strong>{invitation.email}</strong>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Invitation Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={invitation.invitationLink || ''}
                                    readOnly
                                    className="flex-1 text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Share this link with the invited member. It expires in 7 days.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
