'use client';

import React, { useEffect, useState } from 'react';
import { useDiscussion } from '../../app/context/DiscussionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface DiscussionThreadProps {
    discussionId: string;
    onBack: () => void;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({ discussionId, onBack }) => {
    const { currentDiscussion, fetchDiscussion, createPost, analyzeThread, isLoading } = useDiscussion();
    const [replyContent, setReplyContent] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        fetchDiscussion(discussionId);
    }, [discussionId]);

    const handleReply = async () => {
        if (!replyContent) return;
        await createPost(discussionId, { content: replyContent });
        setReplyContent('');
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeThread(discussionId);
            setAnalysis(result);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!currentDiscussion) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discussions
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Post */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <h1 className="text-2xl font-bold">{currentDiscussion.title}</h1>
                            <div className="text-sm text-gray-500">
                                Posted by {currentDiscussion.createdBy.name} on {format(new Date(currentDiscussion.createdAt), 'PPP p')}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-800 whitespace-pre-wrap">{currentDiscussion.content}</p>
                        </CardContent>
                    </Card>

                    {/* Replies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Replies</h3>
                        {currentDiscussion.posts?.map((post) => (
                            <Card key={post.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-sm">{post.createdBy.name}</span>
                                        <span className="text-xs text-gray-500">{format(new Date(post.createdAt), 'MMM d, p')}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Reply Input */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <textarea
                            placeholder="Write a reply..."
                            className="w-full p-3 border rounded-md min-h-[100px] mb-2"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleReply} disabled={isLoading || !replyContent}>
                                <Send className="w-4 h-4 mr-2" /> Post Reply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar / AI Analysis */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-indigo-100">
                        <CardHeader>
                            <CardTitle className="flex items-center text-indigo-700">
                                <Sparkles className="w-5 h-5 mr-2" />
                                AI Thread Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!analysis ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Get a summary of the discussion, consensus points, and unresolved disagreements.
                                    </p>
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        variant="outline"
                                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze Thread'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Summary</h4>
                                        <p className="text-gray-700">{analysis.summary}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-1">Consensus</h4>
                                        <ul className="list-disc list-inside text-gray-700">
                                            {analysis.consensus.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-700 mb-1">Disagreements</h4>
                                        <ul className="list-disc list-inside text-gray-700">
                                            {analysis.disagreements.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
