import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '../../types/task';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
    initialData?: Task;
    projectId: string;
    defaultTitle?: string;
    viewOnly?: boolean;
}

interface ProjectMember {
    id: string;
    name: string | null;
    email: string;
}

interface AssigneeSuggestion {
    userId: string;
    userName: string | null;
    email: string;
    score: number;
    reasons: string[];
    currentWorkload: number;
}

export const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    projectId,
    defaultTitle,
    viewOnly = false,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('');
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [suggestions, setSuggestions] = useState<AssigneeSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Populate fields when editing or creating
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setStatus(initialData.status);
            setPriority(initialData.priority);
            setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
            setAssigneeId(initialData.assigneeId || '');
        } else {
            setTitle(defaultTitle || '');
            setDescription('');
            setStatus(TaskStatus.TODO);
            setPriority(TaskPriority.MEDIUM);
            setDueDate('');
            setAssigneeId('');
        }
    }, [initialData, isOpen, defaultTitle]);

    // Load project members when modal opens
    useEffect(() => {
        if (isOpen && projectId) {
            fetchProjectMembers();
        }
    }, [isOpen, projectId]);

    const fetchProjectMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/members/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch project members:', error);
        }
    };

    const fetchAISuggestions = async () => {
        if (!title) {
            alert('Please enter a task title first');
            return;
        }
        setLoadingSuggestions(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/assignments/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId, title, description }),
            });
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Failed to fetch AI suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                title,
                description,
                status,
                priority,
                dueDate: dueDate || undefined,
                assigneeId: assigneeId || undefined,
                projectId,
            };
            await onSubmit(data);
            onClose();
        } catch (error) {
            console.error('Failed to submit task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {viewOnly ? 'View Task' : initialData ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title"
                            required
                            disabled={viewOnly}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Task description"
                            rows={3}
                            disabled={viewOnly}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={viewOnly}
                            >
                                {Object.values(TaskStatus).map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                disabled={viewOnly}
                            >
                                {Object.values(TaskPriority).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="assignee">Assignee</Label>
                            {!viewOnly && (
                                <button
                                    type="button"
                                    onClick={fetchAISuggestions}
                                    disabled={loadingSuggestions}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    {loadingSuggestions ? '🤖 Loading...' : '🤖 AI Suggestions'}
                                </button>
                            )}
                        </div>
                        <select
                            id="assignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            disabled={viewOnly}
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name || member.email}
                                </option>
                            ))}
                        </select>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="mt-2 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                <p className="text-sm font-medium text-indigo-900 mb-2">AI Recommendations:</p>
                                <div className="space-y-2">
                                    {suggestions.slice(0, 3).map((suggestion) => (
                                        <div
                                            key={suggestion.userId}
                                            onClick={() => {
                                                setAssigneeId(suggestion.userId);
                                                setShowSuggestions(false);
                                            }}
                                            className="flex justify-between items-center p-2 bg-white rounded cursor-pointer hover:bg-indigo-100"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {suggestion.userName || suggestion.email}
                                                </p>
                                                <p className="text-xs text-gray-600">{suggestion.reasons.join(', ')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-indigo-600">{suggestion.score}%</p>
                                                <p className="text-xs text-gray-500">{suggestion.currentWorkload} tasks</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={viewOnly}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {!viewOnly && (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
