'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/app/context/ProjectContext';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Project;
    mode: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, initialData, mode }) => {
    const { createProject, updateProject } = useProject();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setName(initialData.name);
                setDescription(initialData.description || '');
            } else {
                setName('');
                setDescription('');
            }
            setError(null);
        }
    }, [isOpen, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'create') {
                await createProject({ name, description });
            } else if (mode === 'edit' && initialData) {
                await updateProject(initialData.id, { name, description });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save project');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    {mode === 'create' ? 'Create New Project' : 'Edit Project'}
                </h2>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter project description (optional)"
                            rows={4}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Project' : 'Save Changes')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
