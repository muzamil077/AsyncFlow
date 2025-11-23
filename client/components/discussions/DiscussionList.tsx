'use client';

import React, { useEffect, useState } from 'react';
import { useDiscussion } from '../../app/context/DiscussionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface DiscussionListProps {
    projectId: string;
    onSelectDiscussion: (id: string) => void;
}

export const DiscussionList: React.FC<DiscussionListProps> = ({ projectId, onSelectDiscussion }) => {
    const { discussions, fetchDiscussions, createDiscussion, isLoading } = useDiscussion();
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchDiscussions(projectId);
    }, [projectId]);

    const handleCreate = async () => {
        if (!newTitle || !newContent) return;
        await createDiscussion({ title: newTitle, content: newContent, projectId });
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Discussions</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Discussion
                </Button>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>Start a New Discussion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            type="text"
                            placeholder="Topic Title"
                            className="w-full p-2 border rounded"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="What's on your mind?"
                            className="w-full p-2 border rounded min-h-[100px]"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isLoading}>Post Discussion</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {discussions.map((discussion) => (
                    <Card
                        key={discussion.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onSelectDiscussion(discussion.id)}
                    >
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{discussion.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Started by {discussion.createdBy.name} on {format(new Date(discussion.createdAt), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center text-gray-500">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{discussion._count?.posts || 0} replies</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {discussions.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        No discussions yet. Start one to collaborate!
                    </div>
                )}
            </div>
        </div>
    );
};
