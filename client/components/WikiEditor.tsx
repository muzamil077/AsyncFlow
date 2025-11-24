import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface WikiPage {
    id?: string;
    title: string;
    content: string;
    projectId: string;
}

interface WikiEditorProps {
    page?: WikiPage;
    projectId: string;
    onSave: (data: Partial<WikiPage>) => Promise<void>;
}

const WikiEditor: React.FC<WikiEditorProps> = ({ page, projectId, onSave }) => {
    const router = useRouter();
    const [title, setTitle] = useState(page?.title || '');
    const [content, setContent] = useState(page?.content || '');
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        if (page) {
            setTitle(page.title);
            setContent(page.content);
        }
    }, [page]);

    const handleSave = async () => {
        await onSave({ title, content, projectId });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-4 flex-1">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Page Title"
                        className="text-xl font-bold bg-transparent border-none focus:ring-0 w-full"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        onClick={() => setIsPreview(!isPreview)}
                    >
                        {isPreview ? 'Edit' : 'Preview'}
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {isPreview ? (
                    <div className="w-full h-full p-6 overflow-y-auto prose max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm"
                        placeholder="# Start writing your documentation..."
                    />
                )}
            </div>
        </div>
    );
};

export default WikiEditor;
