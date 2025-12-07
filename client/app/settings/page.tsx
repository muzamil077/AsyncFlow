'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | null>(null);
    const [provider, setProvider] = useState<string | null>(null);

    useEffect(() => {
        const statusParam = searchParams.get('status');
        const providerParam = searchParams.get('provider');

        setStatus(statusParam);
        setProvider(providerParam);
    }, [searchParams]);

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                {/* OAuth Callback Status */}
                {status && (
                    <div className={`p-6 rounded-lg mb-6 ${status === 'success'
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-red-50 border-2 border-red-500'
                        }`}>
                        <div className="flex items-center space-x-3 mb-4">
                            {status === 'success' ? (
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {status === 'success'
                                        ? `${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Integration'} Connected Successfully!`
                                        : 'Connection Failed'
                                    }
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {status === 'success'
                                        ? `Your ${provider || 'account'} has been successfully connected to AsyncFlow.`
                                        : 'There was an error connecting your account. Please try again.'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant={status === 'success' ? 'default' : 'outline'}
                            >
                                Go to Dashboard
                            </Button>
                            {status !== 'success' && (
                                <Button onClick={() => router.back()} variant="default">
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* General Settings - Always visible */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="text-gray-600 mb-4">
                            Manage your account settings and integrations here.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Profile Settings</h3>
                                    <p className="text-sm text-gray-500">Update your personal information</p>
                                </div>
                                <Button variant="outline" onClick={() => router.push('/profile')}>
                                    Edit Profile
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Integrations</h3>
                                    <p className="text-sm text-gray-500">Manage your connected services</p>
                                </div>
                                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                    View Projects
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
