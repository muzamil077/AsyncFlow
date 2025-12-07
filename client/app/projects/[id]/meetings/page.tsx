'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MeetingList from '@/components/MeetingList';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Video } from 'lucide-react';

interface GoogleEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    htmlLink: string;
    hangoutLink?: string;
}

export default function MeetingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [meetings, setMeetings] = useState([]);
    const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
    const [importableMeetings, setImportableMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importingId, setImportingId] = useState<string | null>(null);
    const [googleError, setGoogleError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'import'>('upcoming');

    useEffect(() => {
        if (id) {
            fetchMeetings();
            fetchGoogleEvents();
            fetchImportableMeetings();
        }
    }, [id]);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/meetings/project/${id}`, {
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

    const fetchGoogleEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/integrations/google/events`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setGoogleEvents(data);
                setGoogleError(null);
            } else {
                const errorData = await response.json();
                setGoogleError(errorData.error || 'Failed to fetch Google events');
            }
        } catch (error) {
            console.error('Failed to fetch Google events:', error);
            setGoogleError('Failed to connect to Google Calendar');
        }
    };

    const fetchImportableMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/integrations/meetings/importable`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setImportableMeetings(data);
            }
        } catch (error) {
            console.error('Failed to fetch importable meetings:', error);
        }
    };

    const handleImportMeeting = async (meeting: any) => {
        try {
            setImportingId(meeting.id);
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/integrations/meetings/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    meetingId: meeting.id,
                    provider: meeting.provider,
                    projectId: id,
                }),
            });

            if (response.ok) {
                alert('Meeting imported successfully! Summary and action items generated.');
                fetchMeetings(); // Refresh the main list
                setActiveTab('upcoming'); // Switch back to main tab
            } else {
                alert('Failed to import meeting');
            }
        } catch (error) {
            console.error('Error importing meeting:', error);
            alert('Error importing meeting');
        } finally {
            setImportingId(null);
        }
    };

    const handleCreateManual = async () => {
        const title = prompt('Enter meeting title:');
        if (!title) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/meetings', {
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
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
                    <div className="space-y-8">
                        {/* Tabs */}
                        <div className="flex space-x-4 border-b mb-6">
                            <button
                                className={`pb-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('upcoming')}
                            >
                                Upcoming & Past Meetings
                            </button>
                            <button
                                className={`pb-2 px-4 ${activeTab === 'import' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('import')}
                            >
                                Import Recordings
                            </button>
                        </div>

                        {activeTab === 'upcoming' ? (
                            <>
                                {/* Project Meetings */}
                                <section className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">Project Meetings</h2>
                                    <MeetingList meetings={meetings} projectId={id as string} />
                                </section>

                                {/* Google Calendar Events */}
                                <section>
                                    <div className="flex items-center mb-4">
                                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                        <h2 className="text-xl font-semibold">Upcoming Google Calendar Events</h2>
                                    </div>

                                    {googleError ? (
                                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                                            <p className="text-yellow-800 mb-2">{googleError}</p>
                                            <Button variant="outline" onClick={() => router.push(`/projects/${id}/settings`)}>
                                                Go to Settings
                                            </Button>
                                        </div>
                                    ) : googleEvents.length === 0 ? (
                                        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                            No upcoming events found or Google Calendar not connected.
                                            <div className="mt-2">
                                                <Button variant="link" onClick={() => router.push(`/projects/${id}/settings`)}>
                                                    Connect Google Calendar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg shadow overflow-hidden">
                                            <ul className="divide-y divide-gray-200">
                                                {googleEvents.map((event) => (
                                                    <li key={event.id} className="p-4 hover:bg-gray-50">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">{event.summary}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    {formatDate(event.start.dateTime || event.start.date)} -
                                                                    {formatDate(event.end.dateTime || event.end.date)}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                {event.hangoutLink && (
                                                                    <Button size="sm" variant="outline" onClick={() => window.open(event.hangoutLink, '_blank')}>
                                                                        <Video className="w-4 h-4 mr-2" />
                                                                        Join Meet
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="ghost" onClick={() => window.open(event.htmlLink, '_blank')}>
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </section>
                            </>
                        ) : (
                            /* Import Tab */
                            <section>
                                <div className="flex items-center mb-4">
                                    <Video className="w-5 h-5 mr-2 text-purple-600" />
                                    <h2 className="text-xl font-semibold">Available Recordings</h2>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Import past meetings from Zoom and Google Meet to automatically generate summaries and action items.
                                </p>

                                {importableMeetings.length === 0 ? (
                                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                                        <p className="text-gray-500 mb-4">No recordings found from the last 7 days.</p>
                                        <Button variant="outline" onClick={() => router.push(`/projects/${id}/settings`)}>
                                            Check Integrations
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <ul className="divide-y divide-gray-200">
                                            {importableMeetings.map((meeting) => (
                                                <li key={meeting.id} className="p-4 hover:bg-gray-50">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${meeting.provider === 'zoom' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {meeting.provider === 'zoom' ? 'Zoom' : 'Google Meet'}
                                                                </span>
                                                                <h3 className="font-medium text-gray-900">{meeting.topic}</h3>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {formatDate(meeting.startTime)}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleImportMeeting(meeting)}
                                                            disabled={importingId === meeting.id}
                                                        >
                                                            {importingId === meeting.id ? 'Processing...' : 'Import & Summarize'}
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
