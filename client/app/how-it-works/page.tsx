'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HowItWorksPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">How AsyncFlow Works</h1>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connect Your Meeting Platform</h2>
                    <p className="text-gray-700 mb-2">
                        You can link Zoom, Google Meet or Microsoft Teams to AsyncFlow using secure OAuth login. This gives the system permission to read your calendar and access your meeting recordings.
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Automatic Recording Detection</h2>
                    <p className="text-gray-700 mb-2">
                        AsyncFlow monitors your connected calendars. When a meeting ends and a recording becomes available, the system automatically picks it up from Zoom, Google Drive or Microsoft Teams.
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI Processing Pipeline</h2>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                        <li><strong>Transcription</strong>: The recording is converted into accurate text using a high‑quality speech‑to‑text model.</li>
                        <li><strong>Meeting Analysis</strong>: The transcript is processed by an advanced language model to generate:
                            <ul className="list-disc list-inside ml-4">
                                <li>A clear summary of the discussion</li>
                                <li>Action items with owners and deadlines</li>
                                <li>Decisions made during the meeting</li>
                            </ul>
                        </li>
                        <li><strong>Results in Your Dashboard</strong>: The final output is stored securely and displayed in your AsyncFlow dashboard so you and your team can review everything in one place, regardless of which meeting platform you used.</li>
                    </ol>
                </section>
            </div>
        </DashboardLayout>
    );
}
