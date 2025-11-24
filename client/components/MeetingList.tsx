import React from 'react';
import { Calendar, Clock, Video } from 'lucide-react';
import Link from 'next/link';

interface Meeting {
    id: string;
    title: string | null;
    date: string;
    summary: string;
    provider: string | null;
    createdBy: {
        name: string | null;
        email: string;
    };
}

interface MeetingListProps {
    meetings: Meeting[];
    projectId: string;
}

const MeetingList: React.FC<MeetingListProps> = ({ meetings, projectId }) => {
    if (meetings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No meetings yet</h3>
                <p className="text-gray-500">Connect a provider or manually add a meeting.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting) => (
                <Link
                    key={meeting.id}
                    href={`/projects/${projectId}/meetings/${meeting.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.title || 'Untitled Meeting'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${meeting.provider === 'zoom' ? 'bg-blue-100 text-blue-800' :
                                meeting.provider === 'google' ? 'bg-green-100 text-green-800' :
                                    meeting.provider === 'teams' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {meeting.provider || 'Manual'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(meeting.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                            By {meeting.createdBy.name || meeting.createdBy.email}
                        </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">
                        {meeting.summary || 'No summary available yet...'}
                    </p>
                </Link>
            ))}
        </div>
    );
};

export default MeetingList;
