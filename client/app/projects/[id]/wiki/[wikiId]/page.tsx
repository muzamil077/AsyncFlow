'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WikiEditor from '@/components/WikiEditor';

export default function WikiDetailPage({ params }: { params: Promise<{ id: string; wikiId: string }> }) {
    const { id, wikiId } = use(params);
    const router = useRouter();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (wikiId === 'new') {
            setLoading(false);
            return;
        }
        fetchPage();
    }, [wikiId]);

    const fetchPage = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:4000/api/wiki/${wikiId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPage(data);
            } else {
                router.push(`/projects/${id}/wiki`);
            }
        } catch (error) {
            console.error('Failed to fetch wiki page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const url = wikiId === 'new'
                ? 'http://localhost:4000/api/wiki'
                : `http://localhost:4000/api/wiki/${wikiId}`;

            const method = wikiId === 'new' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.push(`/projects/${id}/wiki`);
            }
        } catch (error) {
            console.error('Failed to save wiki page:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading editor...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto p-6 h-full">
                <WikiEditor
                    page={page}
                    projectId={id}
                    onSave={handleSave}
                />
            </div>
        </DashboardLayout>
    );
}
