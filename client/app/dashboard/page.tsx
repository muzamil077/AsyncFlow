'use client';

import React, { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Clock,
    CheckCircle2,
    FolderKanban,
    ArrowRight,
    Plus,
    Loader2
} from 'lucide-react';

export default function DashboardPage() {
    const { projects, fetchProjects, isLoading: projectsLoading } = useProject();
    const { userTasks, fetchUserTasks, loading: tasksLoading } = useTask();
    const { user } = useAuth();

    useEffect(() => {
        fetchProjects();
        fetchUserTasks();
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (projectsLoading || tasksLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F2F6FF]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const pendingTasks = userTasks.filter(t => t.status !== 'DONE').length;
    const completedTasks = userTasks.filter(t => t.status === 'DONE').length;

    return (
        <DashboardLayout>
            <div className="max-w-full mx-auto px-4">
                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-500">Here's what's happening with your projects today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Recent Projects */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                            <Link href="/projects" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.slice(0, 4).map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="bg-white p-5 rounded-[20px] border border-gray-100 hover:shadow-md transition-all group cursor-pointer h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <FolderKanban className="w-5 h-5" />
                                            </div>
                                            <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                                Active
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description'}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {projects.length === 0 && (
                                <div className="col-span-2 text-center py-12 bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
                                    <p className="text-gray-500 mb-4">No projects yet</p>
                                    <Link href="/projects" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Project
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Tasks Summary */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
                            <Link href="/my-tasks" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                            <div className="space-y-4">
                                {userTasks.slice(0, 5).map((task) => (
                                    <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'HIGH' ? 'bg-red-500' :
                                            task.priority === 'MEDIUM' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{task.project?.name || 'Unknown Project'}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                                {userTasks.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 text-sm">No tasks assigned to you</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
