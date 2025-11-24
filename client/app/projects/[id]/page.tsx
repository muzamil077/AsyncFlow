'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useProject } from '@/app/context/ProjectContext';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Project } from '@/types/project';
import { Edit, Trash2, LayoutGrid, List, MessageSquare, Users, Video, BookOpen, Settings } from 'lucide-react';
import { TaskList } from '@/components/tasks/TaskList';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { useTask } from '@/app/context/TaskContext';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import { DiscussionThread } from '@/components/discussions/DiscussionThread';
import { TaskModal } from '@/components/tasks/TaskModal';
import { MembersPanel } from '@/components/projects/MembersPanel';
import { useAuth } from '@/app/context/AuthContext';

export default function ProjectPage() {
    const params = useParams();
    const id = params.id as string;
    const { projects, currentProject, fetchProject, deleteProject } = useProject();
    const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTask();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'board' | 'discussions' | 'members'>('list');
    const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(undefined);

    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchProject(id);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchTasks(id);
        }
    }, [id]);

    const project = currentProject;

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(id);
            router.push('/dashboard');
        }
    };

    if (!project) return <div>Loading...</div>;

    // Task Handlers
    const handleCreateTask = async (data: any) => {
        await createTask(data);
        setIsTaskModalOpen(false);
    };

    const handleUpdateTask = async (data: any) => {
        if (editingTask) {
            await updateTask(editingTask.id, data);
            setIsTaskModalOpen(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: any) => {
        await updateTask(taskId, { status: newStatus });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
        }
    };

    const openCreateTaskModal = () => {
        setEditingTask(undefined);
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task: any) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    if (!project) return <div>Loading...</div>;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-gray-500 mt-1">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/projects/${id}/settings`)}>
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Project
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex space-x-2">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            onClick={() => { setViewMode('list'); setSelectedDiscussionId(null); }}
                            className="flex items-center gap-2"
                        >
                            <List className="w-4 h-4" /> List View
                        </Button>
                        <Button
                            variant={viewMode === 'board' ? 'default' : 'ghost'}
                            onClick={() => { setViewMode('board'); setSelectedDiscussionId(null); }}
                            className="flex items-center gap-2"
                        >
                            <LayoutGrid className="w-4 h-4" /> Kanban Board
                        </Button>
                        <Button
                            variant={viewMode === 'discussions' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('discussions')}
                            className="flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Discussions
                        </Button>
                        <Button
                            variant={viewMode === 'members' ? 'default' : 'ghost'}
                            onClick={() => { setViewMode('members'); setSelectedDiscussionId(null); }}
                            className="flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" /> Members
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/projects/${id}/meetings`)}
                            className="flex items-center gap-2"
                        >
                            <Video className="w-4 h-4" /> Meetings
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/projects/${id}/wiki`)}
                            className="flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" /> Wiki
                        </Button>
                    </div>
                    {viewMode !== 'discussions' && viewMode !== 'members' && (
                        <Button onClick={openCreateTaskModal}>
                            + New Task
                        </Button>
                    )}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {viewMode === 'list' && (
                        <TaskList
                            tasks={tasks}
                            onEdit={openEditTaskModal}
                            onDelete={handleDeleteTask}
                        />
                    )}
                    {viewMode === 'board' && (
                        <KanbanBoard
                            tasks={tasks}
                            onStatusChange={handleStatusChange}
                            onEdit={openEditTaskModal}
                            onDelete={handleDeleteTask}
                        />
                    )}
                    {viewMode === 'discussions' && (
                        selectedDiscussionId ? (
                            <DiscussionThread
                                discussionId={selectedDiscussionId}
                                onBack={() => setSelectedDiscussionId(null)}
                            />
                        ) : (
                            <DiscussionList
                                projectId={id}
                                onSelectDiscussion={setSelectedDiscussionId}
                            />
                        )
                    )}
                    {viewMode === 'members' && project && user && (
                        <MembersPanel
                            projectId={id}
                            isOwner={project.ownerId === user.id}
                            isAdmin={false}
                        />
                    )}
                </div>

                {/* Edit Project Modal */}
                <ProjectModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    initialData={project}
                    mode="edit"
                />

                {/* Task Modal */}
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    initialData={editingTask}
                    projectId={id}
                />
            </div>
        </DashboardLayout>
    );
}
