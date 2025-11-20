"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';
import { useAuth } from '../../app/context/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}



export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                            {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-sm text-center text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
