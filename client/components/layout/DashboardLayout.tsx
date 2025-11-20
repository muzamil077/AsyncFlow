import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-blue-400">AsyncFlow</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    Dashboard
                </Link>
                <Link href="/summarize" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                    <FileText className="w-5 h-5 mr-3" />
                    Summarize
                </Link>
                <Link href="/settings" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                        U
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">User Name</p>
                        <p className="text-xs text-gray-500">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
