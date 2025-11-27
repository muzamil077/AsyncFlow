'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '../../types/task';
import { useAuth } from './AuthContext';

interface TaskContextType {
    tasks: Task[];
    userTasks: Task[];
    loading: boolean;
    error: string | null;
    fetchTasks: (projectId: string) => Promise<void>;
    fetchUserTasks: () => Promise<void>;
    createTask: (data: CreateTaskData) => Promise<void>;
    updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userTasks, setUserTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchTasks = useCallback(async (projectId: string) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tasks/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchUserTasks = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/tasks/my-tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch user tasks');
            const data = await response.json();
            setUserTasks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const createTask = useCallback(async (data: CreateTaskData) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create task');
            const newTask = await response.json();
            setTasks((prev) => [newTask, ...prev]);
            setUserTasks((prev) => [newTask, ...prev]);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    const updateTask = useCallback(async (id: string, data: UpdateTaskData) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update task');
            const updatedTask = await response.json();
            setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
            setUserTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    const deleteTask = useCallback(async (id: string) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete task');
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setUserTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token]);

    return (
        <TaskContext.Provider value={{ tasks, userTasks, loading, error, fetchTasks, fetchUserTasks, createTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTask = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};
