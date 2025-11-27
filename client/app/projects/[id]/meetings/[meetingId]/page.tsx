'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MeetingDetail from '@/components/MeetingDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string; meetingId: string }> }) {
    const { id, meetingId } = use(params);
    const router = useRouter();
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeeting();
    }, [meetingId]);

    const fetchMeeting = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/meetings/${meetingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMeeting(data);
            } else {
                router.push(`/projects/${id}/meetings`);
            }
        } catch (error) {
            console.error('Failed to fetch meeting:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (meetingId: string, data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/meetings/${meetingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const updated = await response.json();
                setMeeting(updated);
            }
        } catch (error) {
            console.error('Failed to update meeting:', error);
        }
    };

    const handleDelete = async (meetingId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/meetings/${meetingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            router.push(`/projects/${id}/meetings`);
        } catch (error) {
            console.error('Failed to delete meeting:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading meeting details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!meeting) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Meetings
                </Button>
                <MeetingDetail
                    meeting={meeting}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            </div>
        </DashboardLayout>
    );
}
