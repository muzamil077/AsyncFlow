'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '../../app/context/AuthContext';
import { ProjectProvider } from '../../app/context/ProjectContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ProjectProvider>
                    {children}
                </ProjectProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
