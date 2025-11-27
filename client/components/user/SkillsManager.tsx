import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSkill, SkillLevel } from '@/types/user';

export const SkillsManager = () => {
    const [skills, setSkills] = useState<UserSkill[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/skills', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSkills(data);
            }
        } catch (error) {
            console.error('Failed to fetch skills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;

        setAdding(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    skill: newSkill.trim(),
                    level: SkillLevel.INTERMEDIATE, // Default level
                }),
            });

            if (response.ok) {
                const addedSkill = await response.json();
                setSkills([...skills, addedSkill]);
                setNewSkill('');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add skill');
            }
        } catch (error) {
            console.error('Failed to add skill:', error);
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveSkill = async (skillId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/skills/${skillId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setSkills(skills.filter(s => s.id !== skillId));
            }
        } catch (error) {
            console.error('Failed to remove skill:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Skills</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Add skills to your profile to help AI assign relevant tasks to you.
            </p>

            <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
                <div className="flex-1">
                    <Label htmlFor="skill" className="sr-only">Add a skill</Label>
                    <Input
                        id="skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. React, Python, Design..."
                        disabled={adding}
                    />
                </div>
                <Button type="submit" disabled={adding || !newSkill.trim()}>
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Add
                </Button>
            </form>

            <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No skills added yet.</p>
                ) : (
                    skills.map(skill => (
                        <div
                            key={skill.id}
                            className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100"
                        >
                            <span>{skill.skill}</span>
                            <button
                                onClick={() => handleRemoveSkill(skill.id)}
                                className="ml-2 text-indigo-400 hover:text-indigo-600 focus:outline-none"
                                aria-label={`Remove ${skill.skill}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
