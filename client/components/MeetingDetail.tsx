import React, { useState } from 'react';
import { Calendar, Clock, User, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Meeting {
    id: string;
    title: string | null;
    date: string;
    summary: string;
    transcript: string;
    provider: string | null;
    createdBy: {
        name: string | null;
        email: string;
    };
}

interface MeetingDetailProps {
    meeting: Meeting;
    onUpdate: (id: string, data: Partial<Meeting>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meeting, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: meeting.title || '',
        summary: meeting.summary || '',
        transcript: meeting.transcript || '',
    });

    const handleSave = async () => {
        await onUpdate(meeting.id, editForm);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this meeting?')) {
            await onDelete(meeting.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-2xl font-bold border rounded px-2 py-1 w-full mr-4"
                    />
                ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{meeting.title || 'Untitled Meeting'}</h1>
                )}

                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8 pb-6 border-b">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(meeting.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(meeting.date).toLocaleTimeString()}
                </div>
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {meeting.createdBy.name || meeting.createdBy.email}
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium uppercase">
                    {meeting.provider || 'Manual'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        {isEditing ? (
                            <textarea
                                value={editForm.summary}
                                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                                className="w-full h-32 border rounded p-2 text-sm"
                            />
                        ) : (
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {meeting.summary || 'No summary available.'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                    {isEditing ? (
                        <textarea
                            value={editForm.transcript}
                            onChange={(e) => setEditForm({ ...editForm, transcript: e.target.value })}
                            className="w-full h-96 border rounded p-2 font-mono text-sm"
                        />
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm text-gray-800 whitespace-pre-wrap">
                            {meeting.transcript || 'No transcript available.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingDetail;
