'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';

interface Member {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');

    useEffect(() => {
        fetchMembers();
    }, [id]);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/team/project/${id}`, {
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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/team/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId: id, email: inviteEmail, role: inviteRole }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Invitation sent! Share this link: ${data.invitationLink}`);
                setShowInviteModal(false);
                setInviteEmail('');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to send invitation');
            }
        } catch (error) {
            console.error('Invite error:', error);
            alert('Failed to send invitation');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/team/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchMembers();
            }
        } catch (error) {
            console.error('Remove member error:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
                        <Button onClick={() => setShowInviteModal(true)}>
                            <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                        </Button>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Team Members ({members.length})</h2>
                    </div>
                    <div className="divide-y">
                        {members.map((member) => (
                            <div key={member.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {member.user.name || member.user.email}
                                        </p>
                                        <p className="text-sm text-gray-500">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                                        member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {member.role}
                                    </span>
                                    {member.role !== 'OWNER' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integration Settings */}
                <div className="bg-white rounded-lg shadow mt-6">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Integrations</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">Z</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Zoom</h3>
                                    <p className="text-sm text-gray-500">Sync meetings and transcripts</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => window.location.href = 'http://localhost:4000/api/integrations/oauth/zoom'}>
                                Connect
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold">G</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Google Meet</h3>
                                    <p className="text-sm text-gray-500">Import calendar events</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => window.location.href = 'http://localhost:4000/api/integrations/oauth/google'}>
                                Connect
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold">T</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Microsoft Teams</h3>
                                    <p className="text-sm text-gray-500">Sync calls and chats</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => window.location.href = 'http://localhost:4000/api/integrations/oauth/microsoft'}>
                                Connect
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="colleague@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowInviteModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Send Invitation</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
