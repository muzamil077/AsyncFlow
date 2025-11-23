'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckSquare, FileText, List, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useTask } from '@/app/context/TaskContext';
import { CreateTaskData, UpdateTaskData } from '@/types/task';
import { useProject } from '@/app/context/ProjectContext';

interface MeetingInsights {
    summary: string;
    actionItems: string[];
    decisions: string[];
    discussionPoints: string[];
    meetingId?: string;
}

export default function SummarizePage() {
    const [text, setText] = useState('');
    const [insights, setInsights] = useState<MeetingInsights | null>(null);
    const [loading, setLoading] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState('');

    // We need a project context to create tasks. 
    // For now, we'll try to use the first available project or ask user to select one.
    // To simplify, let's assume we are in a global context or just pick the current one if available.
    // But wait, this page is global. We might need a project selector.
    // For this iteration, let's fetch projects and default to the first one, or handle it in the modal if possible.
    // The TaskModal requires a projectId.

    const { projects } = useProject();
    const { createTask } = useTask();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const handleSummarize = async () => {
        if (!text) return;
        setLoading(true);
        try {
            // Pass the first project ID if available to link the meeting
            const projectId = selectedProjectId || (projects.length > 0 ? projects[0].id : undefined);
            const response = await axios.post('http://localhost:4000/api/ai/summarize', {
                text,
                projectId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming token is in localStorage
                }
            });
            setInsights(response.data);
        } catch (error) {
            console.error('Error summarizing text:', error);
            // Fallback for demo if API fails or auth missing
            // setInsights({
            //     summary: 'Failed to generate summary.',
            //     actionItems: [],
            //     decisions: [],
            //     discussionPoints: []
            // });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTaskClick = (actionItem: string) => {
        if (projects.length === 0) {
            alert('Please create a project first to assign tasks.');
            return;
        }
        setSelectedActionItem(actionItem);
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
        setIsTaskModalOpen(true);
    };

    const handleTaskSubmit = async (data: CreateTaskData | UpdateTaskData) => {
        await createTask(data as CreateTaskData);
        setIsTaskModalOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">AI Meeting Assistant</h1>
                    {projects.length > 0 && (
                        <select
                            className="border rounded p-2"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            <option value="">Select Project (Optional)</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Transcript Input
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your meeting transcript here..."
                                className="min-h-[500px] p-4 font-mono text-sm"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <Button
                                onClick={handleSummarize}
                                disabled={loading || !text}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Generate Insights'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Output Section */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <List className="w-5 h-5" />
                                    Executive Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights ? (
                                    <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                                ) : (
                                    <div className="text-gray-400 text-center py-8">
                                        Summary will appear here...
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-600">
                                    <CheckSquare className="w-5 h-5" />
                                    Action Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights?.actionItems?.length ? (
                                    <ul className="space-y-3">
                                        {insights.actionItems.map((item, index) => (
                                            <li key={index} className="flex items-start justify-between gap-4 p-3 bg-blue-50 rounded-lg group">
                                                <span className="text-gray-800 text-sm mt-1">{item}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleCreateTaskClick(item)}
                                                >
                                                    Create Task <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-400 text-center py-4">
                                        No action items detected.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Decisions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <CheckSquare className="w-5 h-5" />
                                    Key Decisions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights?.decisions?.length ? (
                                    <ul className="space-y-2">
                                        {insights.decisions.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-400 text-center py-4">
                                        No decisions detected.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {projects.length > 0 && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSubmit={handleTaskSubmit}
                    projectId={selectedProjectId || projects[0].id}
                    defaultTitle={selectedActionItem}
                />
            )}
        </DashboardLayout>
    );
}
