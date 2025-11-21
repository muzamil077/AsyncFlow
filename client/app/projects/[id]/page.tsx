'use client';

import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { currentProject, fetchProject, updateProject, deleteProject, isLoading, error } = useProject();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        if (id) {
            fetchProject(id);
        }
    }, [id]);

    useEffect(() => {
        if (currentProject) {
            setEditName(currentProject.name);
            setEditDescription(currentProject.description || '');
        }
    }, [currentProject]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProject(id, { name: editName, description: editDescription });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(id);
            router.push('/dashboard');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
    if (!currentProject) return <div className="text-center mt-10">Project not found</div>;

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    {isEditing ? (
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Project Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
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
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    rows={5}
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProject.name}</h1>
                                    <p className="text-gray-500 text-sm">
                                        Created: {new Date(currentProject.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="prose max-w-none">
                                <h3 className="text-xl font-semibold mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {currentProject.description || 'No description provided.'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
