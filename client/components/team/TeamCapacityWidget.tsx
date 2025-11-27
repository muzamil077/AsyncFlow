import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TeamMember {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    role: string;
    workload?: number;
}

interface TeamCapacityWidgetProps {
    projectId: string;
}

export const TeamCapacityWidget: React.FC<TeamCapacityWidgetProps> = ({ projectId }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamCapacity();
    }, [projectId]);

    const fetchTeamCapacity = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch team members
            const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/team/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (membersResponse.ok) {
                const membersData = await membersResponse.json();

                // Fetch workload for each member
                const membersWithWorkload = await Promise.all(
                    membersData.map(async (member: TeamMember) => {
                        try {
                            const tasksResponse = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tasks?projectId=${projectId}&assigneeId=${member.userId}&status=TODO,IN_PROGRESS`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );

                            if (tasksResponse.ok) {
                                const tasks = await tasksResponse.json();
                                return { ...member, workload: tasks.length };
                            }
                        } catch (error) {
                            console.error(`Failed to fetch workload for ${member.user.email}:`, error);
                        }
                        return { ...member, workload: 0 };
                    })
                );

                setMembers(membersWithWorkload);
            }
        } catch (error) {
            console.error('Failed to fetch team capacity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCapacityColor = (workload: number) => {
        if (workload === 0) return 'text-gray-400';
        if (workload <= 3) return 'text-green-600';
        if (workload <= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCapacityBg = (workload: number) => {
        if (workload === 0) return 'bg-gray-100';
        if (workload <= 3) return 'bg-green-100';
        if (workload <= 5) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getCapacityLabel = (workload: number) => {
        if (workload === 0) return 'Available';
        if (workload <= 3) return 'Light';
        if (workload <= 5) return 'Moderate';
        return 'Heavy';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        Team Capacity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    const totalWorkload = members.reduce((sum, m) => sum + (m.workload || 0), 0);
    const avgWorkload = members.length > 0 ? (totalWorkload / members.length).toFixed(1) : '0';
    const overloadedCount = members.filter(m => (m.workload || 0) > 5).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    Team Capacity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs font-medium">Avg Load</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">{avgWorkload}</p>
                    </div>
                    {overloadedCount > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-xs font-medium">Overloaded</span>
                            </div>
                            <p className="text-lg font-bold text-red-900">{overloadedCount}</p>
                        </div>
                    )}
                </div>

                {/* Team Members List */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 uppercase">Team Members</p>
                    {members.length === 0 ? (
                        <p className="text-sm text-gray-500">No team members yet</p>
                    ) : (
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {(member.user.name?.[0] || member.user.email[0]).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {member.user.name || member.user.email}
                                        </p>
                                        <p className="text-xs text-gray-500">{member.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-xs font-medium ${getCapacityColor(member.workload || 0)}`}>
                                        {member.workload || 0} tasks
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCapacityBg(member.workload || 0)} ${getCapacityColor(member.workload || 0)}`}>
                                        {getCapacityLabel(member.workload || 0)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
