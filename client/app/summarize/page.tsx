'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SummarizePage() {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        if (!text) return;
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/api/ai/summarize', { text });
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error summarizing text:', error);
            setSummary('Failed to generate summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Meeting Summarizer</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Transcript</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your meeting transcript here..."
                                className="min-h-[400px] p-4"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <Button
                                onClick={handleSummarize}
                                disabled={loading || !text}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Summarizing...
                                    </>
                                ) : (
                                    'Generate Summary'
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg border min-h-[400px] prose">
                                {summary ? (
                                    <div className="whitespace-pre-wrap">{summary}</div>
                                ) : (
                                    <div className="text-gray-400 flex items-center justify-center h-full">
                                        Summary will appear here...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
