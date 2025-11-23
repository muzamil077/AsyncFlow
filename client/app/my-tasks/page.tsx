'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useTask } from '@/app/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

export default function MyTasksPage() {
    const { updateTask, deleteTask } = useTask();
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | TaskStatus>('all');

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/tasks/my-tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMyTasks(data);
            }
        } catch (error) {
            console.error('Failed to fetch my tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleUpdate = async (data: any) => {
        if (editingTask) {
            await updateTask(editingTask.id, data);
            setIsModalOpen(false);
            fetchMyTasks();
        }
    };

    const handleDelete = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
            fetchMyTasks();
        }
    };

    const filteredTasks = filter === 'all'
        ? myTasks
        : myTasks.filter(task => task.status === filter);

    const tasksByProject = filteredTasks.reduce((acc, task) => {
        const projectName = task.project?.name || 'Unknown Project';
        if (!acc[projectName]) {
            acc[projectName] = [];
        }
        acc[projectName].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading your tasks...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
                    <p className="text-gray-600">Tasks assigned to you across all projects</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        All ({myTasks.length})
                    </Button>
                    <Button
                        variant={filter === TaskStatus.TODO ? 'default' : 'outline'}
                        onClick={() => setFilter(TaskStatus.TODO)}
                    >
                        To Do ({myTasks.filter(t => t.status === TaskStatus.TODO).length})
                    </Button>
                    <Button
                        variant={filter === TaskStatus.IN_PROGRESS ? 'default' : 'outline'}
                        onClick={() => setFilter(TaskStatus.IN_PROGRESS)}
                    >
                        In Progress ({myTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length})
                    </Button>
                    <Button
                        variant={filter === TaskStatus.IN_REVIEW ? 'default' : 'outline'}
                        onClick={() => setFilter(TaskStatus.IN_REVIEW)}
                    >
                        In Review ({myTasks.filter(t => t.status === TaskStatus.IN_REVIEW).length})
                    </Button>
                    <Button
                        variant={filter === TaskStatus.DONE ? 'default' : 'outline'}
                        onClick={() => setFilter(TaskStatus.DONE)}
                    >
                        Done ({myTasks.filter(t => t.status === TaskStatus.DONE).length})
                    </Button>
                </div>

                {/* Tasks by Project */}
                {Object.keys(tasksByProject).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No tasks assigned to you yet</p>
                        <p className="text-gray-400 text-sm mt-2">Tasks will appear here when they're assigned to you</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(tasksByProject).map(([projectName, tasks]) => (
                            <div key={projectName}>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="w-1 h-6 bg-indigo-500 mr-3 rounded"></span>
                                    {projectName}
                                    <span className="ml-2 text-sm text-gray-500 font-normal">({tasks.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Task Modal */}
                {editingTask && (
                    <TaskModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleUpdate}
                        initialData={editingTask}
                        projectId={editingTask.projectId}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
