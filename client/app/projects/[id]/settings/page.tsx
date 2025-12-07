// 'use client' directive for Next.js client component
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Define the Member interface
interface Member {
    id: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
}

export default function ProjectSettingsPage() {
    // Extract project ID
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
    const [integrations, setIntegrations] = useState<{ google: boolean; zoom: boolean; microsoft: boolean }>({ google: false, zoom: false, microsoft: false });

    // Fetch members and integration status
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                // Real API call would go here
                // const res = await fetch(`/api/projects/${id}/members`);
                // if (!res.ok) throw new Error('Failed to fetch members');
                // const data: Member[] = await res.json();
                // setMembers(data);
                // Mock data
                setMembers([
                    { id: '1', email: 'admin@example.com', role: 'ADMIN' },
                    { id: '2', email: 'member1@example.com', role: 'MEMBER' },
                ]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchIntegrationStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/integrations/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIntegrations(data);
                }
            } catch (err) {
                console.error('Failed to fetch integration status', err);
            }
        };

        if (id) {
            fetchMembers();
            fetchIntegrationStatus();
        }
    }, [id]);

    // Invite handler
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Real API call to invite member would go here
            // const res = await fetch(`/api/projects/${id}/invite`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            // });
            // if (!res.ok) throw new Error('Failed to invite');
            // const newMember: Member = await res.json();
            // setMembers(prev => [...prev, newMember]);

            // Mock success handling
            alert('Invitation sent successfully!');
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('MEMBER');
            setMembers(prev => [...prev, { id: Date.now().toString(), email: inviteEmail, role: inviteRole }]);
        } catch (err: any) {
            alert(`Error sending invitation: ${err.message}`);
        }
    };

    // Remove handler
    const handleRemoveMember = async (memberId: string) => {
        try {
            // Real API call to remove member would go here
            // const res = await fetch(`/api/projects/${id}/members/${memberId}`, { method: 'DELETE' });
            // if (!res.ok) throw new Error('Failed to remove');

            // Mock removal
            setMembers(prev => prev.filter(m => m.id !== memberId));
            alert('Member removed successfully!');
        } catch (err: any) {
            alert(`Error removing member: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto p-6">
                    <p>Loading project settings...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="container mx-auto p-6">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Project Settings for {id}</h1>
                {/* Integrations */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
                    <div className="space-y-6">
                        {/* Google Meet */}
                        <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold">G</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Google Meet</h3>
                                    <p className="text-sm text-gray-500">Import calendar events</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (!user?.id) {
                                            alert('User ID not found. Please log in again.');
                                            return;
                                        }
                                        console.log('Initiating Google OAuth for user:', user.id);
                                        window.location.href =
                                            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') +
                                            `/api/integrations/oauth/google?userId=${user.id}`;
                                    }}
                                >
                                    {integrations.google ? 'Reconnect' : 'Connect'}
                                </Button>
                                {integrations.google && (
                                    <span className="flex items-center text-sm text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Connected
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Zoom */}
                        <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">Z</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Zoom</h3>
                                    <p className="text-sm text-gray-500">Import meeting recordings</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (!user?.id) {
                                            alert('User ID not found. Please log in again.');
                                            return;
                                        }
                                        window.location.href =
                                            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') +
                                            `/api/integrations/oauth/zoom?userId=${user.id}`;
                                    }}
                                >
                                    {integrations.zoom ? 'Reconnect' : 'Connect'}
                                </Button>
                                {integrations.zoom && (
                                    <span className="flex items-center text-sm text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Connected
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Microsoft Teams */}
                        <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold">T</span>
                                </div>
                                <div>
                                    <h3 className="font-medium">Microsoft Teams</h3>
                                    <p className="text-sm text-gray-500">Sync calls and chats</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                    (window.location.href =
                                        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') +
                                        '/api/integrations/oauth/microsoft')
                                    }
                                >
                                    {integrations.microsoft ? 'Reconnect' : 'Connect'}
                                </Button>
                                {integrations.microsoft && (
                                    <span className="flex items-center text-sm text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Connected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Team Members */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-medium">Current Members</h3>
                            <Button onClick={() => setShowInviteModal(true)}>Invite Member</Button>
                        </div>
                        {members.length === 0 ? (
                            <p className="text-gray-600">No members yet. Invite someone!</p>
                        ) : (
                            <ul className="space-y-3">
                                {members.map(member => (
                                    <li key={member.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                        <div>
                                            <p className="font-medium">{member.email}</p>
                                            <p className="text-sm text-gray-500">{member.role}</p>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(member.id)}>
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="colleague@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
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
