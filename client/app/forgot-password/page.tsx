'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setStatus('success');
            setMessage(data.message);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                        <p className="text-gray-500">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                                {message}
                            </div>
                            <p className="text-sm text-gray-500">
                                Check your email for the reset link. It may take a few minutes to arrive.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Sending Link...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
