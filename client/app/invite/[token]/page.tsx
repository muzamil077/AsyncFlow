'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ProjectInvitation } from '@/types/member';

export default function AcceptInvitationPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<ProjectInvitation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        fetchInvitationDetails();
    }, [token]);

    const fetchInvitationDetails = async () => {
        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                router.push(`/login?redirect=/invite/${token}`);
                return;
            }

            // Fetch invitation details by attempting to get it from the backend
            // Note: This would require a GET endpoint, for now we'll just proceed to accept
            setLoading(false);
        } catch (err) {
            setError('Failed to load invitation details');
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                router.push(`/login?redirect=/invite/${token}`);
                return;
            }

            const response = await fetch(`http://localhost:4000/api/team/accept/${token}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setAccepted(true);
                setTimeout(() => {
                    router.push(`/projects/${data.project.id}`);
                }, 2000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to accept invitation');
            }
        } catch (err) {
            setError('Failed to accept invitation. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p>Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
                    <p className="text-gray-600">Redirecting to project...</p>
                </div>
            </div>
        );
    }

    if (error && !accepting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Invitation</h1>

                {invitation?.project && (
                    <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">You've been invited to join:</p>
                        <p className="text-lg font-semibold text-gray-900">{invitation.project.name}</p>
                        {invitation.inviter && (
                            <p className="text-sm text-gray-600 mt-2">
                                Invited by: {invitation.inviter.name || invitation.inviter.email}
                            </p>
                        )}
                    </div>
                )}

                {!invitation?.project && (
                    <p className="text-gray-600 mb-6">
                        You've been invited to join a project. Click below to accept the invitation.
                    </p>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={handleAccept}
                        className="w-full"
                        disabled={accepting}
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Accepting...
                            </>
                        ) : (
                            'Accept Invitation'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="w-full"
                        disabled={accepting}
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    );
}
