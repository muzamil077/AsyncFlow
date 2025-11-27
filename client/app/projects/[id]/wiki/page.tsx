'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WikiPageList from '@/components/WikiPageList';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export default function WikiPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, [id]);

    const fetchPages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/wiki/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPages(data);
            }
        } catch (error) {
            console.error('Failed to fetch wiki pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = () => {
        router.push(`/projects/${id}/wiki/new`);
    };

    const handleRegenerate = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/wiki/regenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId: id }),
            });
            alert('Wiki regeneration triggered. Check back in a few moments.');
            fetchPages();
        } catch (error) {
            console.error('Failed to regenerate wiki:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Project Wiki</h1>
                        <p className="text-gray-500 mt-1">Living documentation for your project</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={handleRegenerate}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Auto-Generate
                        </Button>
                        <Button onClick={handleCreatePage}>
                            <Plus className="w-4 h-4 mr-2" /> New Page
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading wiki pages...</div>
                ) : (
                    <WikiPageList pages={pages} projectId={id} />
                )}
            </div>
        </DashboardLayout>
    );
}
