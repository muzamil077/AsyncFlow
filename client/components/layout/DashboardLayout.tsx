
"use client"

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Search,
    ShoppingBag,
    Mail,
    Flag,
    Calendar,
    Users,
    Bell,
    MessageSquare,
    LogOut,
    FolderKanban,
    CheckSquare
} from 'lucide-react';
import { useAuth } from '../../app/context/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F2F6FF]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F2F6FF] flex flex-col md:flex-row">
            {/* Mobile Header with menu button */}
            <header className="flex items-center justify-between bg-white p-4 md:hidden shadow-sm">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">AsyncFlow</h1>
            </header>
            {/* Sidebar for md+ */}
            <aside className="hidden md:block w-72 bg-white flex flex-col shadow-sm h-[calc(100vh-2rem)] fixed bottom-0 left-0 top-0 z-50 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-gray-800">AsyncFlow </span>
                        </div>
                    </div>
                </div>



                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
                    <div className="space-y-1 mb-2">
                        <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                            <LayoutDashboard className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link href="/projects" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                            <FolderKanban className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Projects</span>
                        </Link>
                        <Link href="/summarize" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                            <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">AI Summary</span>
                        </Link>
                        <Link href="/my-tasks" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                            <CheckSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">My Tasks</span>
                        </Link>

                    </div>

                    <div className="space-y-1">

                        <Link href="/setting" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                            <Settings className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Settings</span>
                        </Link>
                    </div>
                </div>

                {/* User Profile */}
                <div className="fixed bottom-10 left-5">
                    <div className="mt-auto">
                        <div className="bg-gray-50 p-3 rounded-[20px] flex items-center justify-between border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[100px]">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[100px]">{user?.email}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors p-2">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            )}
            {sidebarOpen && (
                <aside className="fixed inset-y-0 left-0 w-72 bg-white rounded-r-[40px] shadow-lg z-50 p-4 overflow-y-auto">
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <X className="w-5 h-5" />
                    </button>
                    {/* Reuse the same navigation content as the desktop sidebar */}
                    <div className="px-8 pt-8 pb-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg text-gray-800">AsyncFlow <span className="text-gray-400 text-xs font-normal">v1.0</span></span>
                            </div>
                        </div>
                        {/* Navigation (same as desktop) */}
                        <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
                            <div className="space-y-1 mb-2">
                                <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <LayoutDashboard className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                                <Link href="/projects" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <FolderKanban className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Projects</span>
                                </Link>
                                <Link href="/summarize" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">AI Summary</span>
                                </Link>
                                <Link href="/my-tasks" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <CheckSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">My Tasks</span>
                                </Link>
                                <Link href="/calendar" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Calendar</span>
                                </Link>
                                <Link href="/team" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Contacts</span>
                                </Link>
                            </div>

                            <div className="space-y-1">
                                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                                <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                                    <div className="flex items-center">
                                        <Bell className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Notifications</span>
                                    </div>
                                    <span className="bg-[#C4F0C4] text-[#2E7D32] text-xs font-bold px-2 py-1 rounded-lg">24</span>
                                </button>
                                <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group">
                                    <div className="flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Chat</span>
                                    </div>
                                    <span className="bg-[#FFE0B2] text-[#EF6C00] text-xs font-bold px-2 py-1 rounded-lg">8</span>
                                </button>
                                <Link href="/setting" className="flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group" onClick={() => setSidebarOpen(false)}>
                                    <Settings className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Settings</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* User Profile */}
                    <div className="p-6 mt-auto">
                        <div className="bg-gray-50 p-3 rounded-[20px] flex items-center justify-between border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[100px]">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[100px]">{user?.email}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </aside>
            )}
            {/* Main Content */}
            <main className="flex-1 md:ml-[20rem] ml-0 p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}

