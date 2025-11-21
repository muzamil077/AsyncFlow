'use client';

import React, { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
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
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        New Project
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/projects/${project.id}`} key={project.id} className="block">
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                                <h2 className="text-xl font-semibold mb-2 text-gray-800">{project.name}</h2>
                                <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                                <div className="text-sm text-gray-500">
                                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {projects.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No projects found. Create one to get started!</p>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
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
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Create
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
