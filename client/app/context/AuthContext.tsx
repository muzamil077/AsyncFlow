'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string | null;
    jobTitle?: string | null;
    company?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('AuthContext: Checking localStorage', {
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            tokenLength: storedToken?.length
        });

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('AuthContext: Restoring session for user', parsedUser.email);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error('AuthContext: Failed to parse stored user', error);
                // Optional: Clear invalid storage
                localStorage.removeItem('user');
            }
        } else {
            console.log('AuthContext: No complete session found');
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        console.log('AuthContext: Logging in', { email: newUser.email });
        setToken(newToken);
        setUser(newUser);
        try {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            console.log('AuthContext: Session saved to localStorage');
        } catch (error) {
            console.error('AuthContext: Failed to save session', error);
        }
        router.push('/');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
