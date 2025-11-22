import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const priorityColors = {
    [TaskPriority.LOW]: 'bg-blue-100 text-blue-800',
    [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
    [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
};

const statusColors = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TaskStatus.IN_REVIEW]: 'bg-purple-100 text-purple-800',
    [TaskStatus.DONE]: 'bg-green-100 text-green-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                </span>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center">
                    {task.assignee ? (
                        <span className="flex items-center" title={task.assignee.email}>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-1 font-bold">
                                {task.assignee.name?.[0] || task.assignee.email[0].toUpperCase()}
                            </div>
                            {task.assignee.name || task.assignee.email.split('@')[0]}
                        </span>
                    ) : (
                        <span className="italic">Unassigned</span>
                    )}
                </div>
                {task.dueDate && (
                    <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                )}
            </div>
        </div>
    );
};
