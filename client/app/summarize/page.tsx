'use client';

import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, List, CheckSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { CreateTaskData, UpdateTaskData } from '@/types/task';
import { TaskModal } from '@/components/tasks/TaskModal';

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
    const [showBulkPreview, setShowBulkPreview] = useState(false);
    const [creatingBulkTasks, setCreatingBulkTasks] = useState(false);

    const { projects } = useProject();
    const { createTask } = useTask();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const handleSummarize = async () => {
        if (!text) return;
        setLoading(true);
        try {
            const projectId = selectedProjectId || (projects.length > 0 ? projects[0].id : undefined);
            const response = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/ai/summarize', {
                text,
                projectId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setInsights(response.data);
        } catch (error) {
            console.error('Error summarizing text:', error);
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

    const handleCreateAllTasks = async () => {
        if (!insights?.actionItems || insights.actionItems.length === 0) {
            alert('No action items to create tasks from');
            return;
        }

        if (!selectedProjectId && projects.length === 0) {
            alert('Please select a project first');
            return;
        }

        setCreatingBulkTasks(true);
        try {
            const projectId = selectedProjectId || projects[0].id;
            const token = localStorage.getItem('token');

            const taskPromises = insights.actionItems.map(async (actionItem) => {
                return await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/tasks', {
                    title: actionItem,
                    description: `Auto-generated from meeting summary`,
                    projectId,
                    status: 'TODO',
                    priority: 'MEDIUM',
                    aiGenerated: true
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            });

            await Promise.all(taskPromises);
            alert(`Successfully created ${insights.actionItems.length} tasks!`);
            setShowBulkPreview(false);
        } catch (error) {
            console.error('Error creating bulk tasks:', error);
            alert('Failed to create some tasks. Please try again.');
        } finally {
            setCreatingBulkTasks(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-9xl mx-auto space-y-6 p-6">
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
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 text-blue-600">
                                        <CheckSquare className="w-5 h-5" />
                                        Action Items
                                    </CardTitle>
                                    {(insights?.actionItems?.length ?? 0) > 0 && selectedProjectId && (
                                        <Button
                                            size="sm"
                                            onClick={() => setShowBulkPreview(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Create All Tasks ({insights?.actionItems?.length ?? 0})
                                        </Button>
                                    )}
                                </div>
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

            {/* Bulk Task Creation Preview Modal */}
            {showBulkPreview && insights?.actionItems && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Create {insights.actionItems.length} Tasks
                            </h2>
                            <button
                                onClick={() => setShowBulkPreview(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-600 text-sm">
                                The following tasks will be created in <strong>{projects.find(p => p.id === selectedProjectId)?.name || projects[0]?.name}</strong>:
                            </p>
                        </div>

                        <div className="space-y-2 mb-6">
                            {insights.actionItems.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-gray-800 text-sm">{item}</p>
                                        <p className="text-xs text-gray-500 mt-1">Status: TODO • Priority: MEDIUM</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowBulkPreview(false)}
                                disabled={creatingBulkTasks}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateAllTasks}
                                disabled={creatingBulkTasks}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {creatingBulkTasks ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    `Create ${insights.actionItems?.length || 0} Tasks`
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
