'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Discussion, CreateDiscussionData, CreatePostData, ThreadAnalysis } from '../../types/discussion';

interface DiscussionContextType {
    discussions: Discussion[];
    currentDiscussion: Discussion | null;
    isLoading: boolean;
    error: string | null;
    fetchDiscussions: (projectId: string) => Promise<void>;
    fetchDiscussion: (id: string) => Promise<void>;
    createDiscussion: (data: CreateDiscussionData) => Promise<void>;
    createPost: (discussionId: string, data: CreatePostData) => Promise<void>;
    analyzeThread: (discussionId: string) => Promise<ThreadAnalysis>;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export const DiscussionProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [currentDiscussion, setCurrentDiscussion] = useState<Discussion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDiscussions = async (projectId: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/discussions/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch discussions');
            const data = await response.json();
            setDiscussions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDiscussion = async (id: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/discussions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch discussion');
            const data = await response.json();
            setCurrentDiscussion(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const createDiscussion = async (data: CreateDiscussionData) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:4000/api/discussions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create discussion');
            const newDiscussion = await response.json();
            setDiscussions(prev => [newDiscussion, ...prev]);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createPost = async (discussionId: string, data: CreatePostData) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/discussions/${discussionId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create post');
            const newPost = await response.json();

            if (currentDiscussion && currentDiscussion.id === discussionId) {
                setCurrentDiscussion(prev => prev ? {
                    ...prev,
                    posts: [...(prev.posts || []), newPost]
                } : null);
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeThread = async (discussionId: string): Promise<ThreadAnalysis> => {
        if (!token) throw new Error('Unauthorized');
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/discussions/${discussionId}/analyze`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to analyze thread');
            return await response.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DiscussionContext.Provider
            value={{
                discussions,
                currentDiscussion,
                isLoading,
                error,
                fetchDiscussions,
                fetchDiscussion,
                createDiscussion,
                createPost,
                analyzeThread,
            }}
        >
            {children}
        </DiscussionContext.Provider>
    );
};

export const useDiscussion = () => {
    const context = useContext(DiscussionContext);
    if (context === undefined) {
        throw new Error('useDiscussion must be used within a DiscussionProvider');
    }
    return context;
};
