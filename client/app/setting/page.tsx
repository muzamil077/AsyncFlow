"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";
import { SkillsManager } from "@/components/user/SkillsManager";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600 mb-8">Manage your account preferences and profile.</p>

                <div className="space-y-6">
                    <SkillsManager />
                </div>
            </div>
        </DashboardLayout>
    );
}