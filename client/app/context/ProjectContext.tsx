'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    fetchProject: (id: string) => Promise<void>;
    createProject: (data: { name: string; description?: string }) => Promise<void>;
    updateProject: (id: string, data: { name: string; description?: string }) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        console.log('ProjectContext: fetchProjects called', { token: !!token });
        if (!token) {
            console.log('ProjectContext: No token, skipping fetch');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log('ProjectContext: Fetching from API...');
            const response = await fetch('http://localhost:4000/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch projects');
            const data = await response.json();
            console.log('ProjectContext: fetchProjects success', data);
            setProjects(data);
        } catch (err: any) {
            console.error('ProjectContext: fetchProjects error', err);
            setError(err.message);
        } finally {
            console.log('ProjectContext: fetchProjects finished');
            setIsLoading(false);
        }
    };

    const fetchProject = async (id: string) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch project');
            const data = await response.json();
            setCurrentProject(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async (data: { name: string; description?: string }) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:4000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create project failed:', response.status, errorText);
                throw new Error(`Failed to create project: ${response.status} ${errorText}`);
            }
            const newProject = await response.json();
            console.log('createProject response:', newProject);
            setProjects((prev) => [newProject, ...prev]);
        } catch (err: any) {
            console.error('Create project error:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProject = async (id: string, data: { name: string; description?: string }) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update project');
            const updatedProject = await response.json();
            setProjects((prev) =>
                prev.map((p) => (p.id === id ? updatedProject : p))
            );
            if (currentProject?.id === id) {
                setCurrentProject(updatedProject);
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete project');
            setProjects((prev) => prev.filter((p) => p.id !== id));
            if (currentProject?.id === id) {
                setCurrentProject(null);
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                currentProject,
                isLoading,
                error,
                fetchProjects,
                fetchProject,
                createProject,
                updateProject,
                deleteProject,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
