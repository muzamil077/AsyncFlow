'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, Phone, Info, Loader2, ArrowRight } from 'lucide-react';

function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:4000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, jobTitle, company, phoneNumber, bio })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            // Auto-login after successful registration
            login(data.token, data.user);
            if (redirect) {
                router.push(redirect);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left side – illustration */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-70" />
                <div className="relative h-full flex flex-col justify-center p-12 text-white z-10">
                    <h2 className="text-4xl font-bold mb-4">Join AsyncFlow</h2>
                    <p className="text-lg mb-8">Collaborate, organize, and achieve more with a powerful project management platform.</p>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white opacity-20" />
                        <div className="w-10 h-10 rounded-full bg-white opacity-20" />
                        <div className="w-10 h-10 rounded-full bg-white opacity-20" />
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
            </div>
            {/* Right side – form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-lg space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Create your account</h1>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="********"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title
                            </label>
                            <input
                                id="jobTitle"
                                type="text"
                                placeholder="Product Manager"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                Company
                            </label>
                            <input
                                id="company"
                                type="text"
                                placeholder="Acme Corp"
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-5 w-5 text-gray-400" />
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1 555 123 4567"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Short Bio
                            </label>
                            <textarea
                                id="bio"
                                rows={3}
                                placeholder="Tell us a bit about yourself..."
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Register
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
