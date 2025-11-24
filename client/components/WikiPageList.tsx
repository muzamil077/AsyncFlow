import React from 'react';
import { FileText, Clock } from 'lucide-react';
import Link from 'next/link';

interface WikiPage {
    id: string;
    title: string;
    generatedAt: string;
}

interface WikiPageListProps {
    pages: WikiPage[];
    projectId: string;
}

const WikiPageList: React.FC<WikiPageListProps> = ({ pages, projectId }) => {
    if (pages.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No wiki pages yet</h3>
                <p className="text-gray-500">Create a page or generate one from project activity.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
                <Link
                    key={page.id}
                    href={`/projects/${projectId}/wiki/${page.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                    <div className="flex items-center mb-4">
                        <FileText className="w-8 h-8 text-indigo-500 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {page.title}
                        </h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Updated {new Date(page.generatedAt).toLocaleDateString()}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default WikiPageList;
