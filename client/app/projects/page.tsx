'use client';

import React, { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProjectsPage() {
    const { projects, fetchProjects, createProject, isLoading } = useProject();
    const { user } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        await createProject({ name: newProjectName, description: newProjectDescription });
        setIsModalOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
    };

    if (isLoading && projects.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        New Project
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id} className="block group">
                            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group-hover:border-blue-200 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {project.name[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        {new Date(project.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h2>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{project.description || 'No description provided.'}</p>
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-400">
                                    <span>View Details</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {projects.length === 0 && !isLoading && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📂</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h3>
                        <p className="text-gray-500 mb-6">Create your first project to get started with AsyncFlow.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Create Project
                        </button>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Project</h2>
                            <form onSubmit={handleCreateProject}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Project Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="e.g. Website Redesign"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={newProjectDescription}
                                        onChange={(e) => setNewProjectDescription(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        placeholder="Briefly describe your project..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
