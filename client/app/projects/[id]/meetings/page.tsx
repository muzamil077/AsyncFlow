'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MeetingList from '@/components/MeetingList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MeetingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, [id]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/meetings/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateManual = async () => {
        const title = prompt('Enter meeting title:');
        if (!title) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    date: new Date().toISOString(),
                    projectId: id,
                    provider: 'manual',
                }),
            });

            if (response.ok) {
                fetchMeetings();
            }
        } catch (error) {
            console.error('Failed to create meeting:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
                    <Button onClick={handleCreateManual}>
                        <Plus className="w-4 h-4 mr-2" /> Add Manual Meeting
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading meetings...</div>
                ) : (
                    <MeetingList meetings={meetings} projectId={id} />
                )}
            </div>
        </DashboardLayout>
    );
}
