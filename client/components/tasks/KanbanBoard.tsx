import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import { Droppable } from './Droppable'; // We'll need to create this or define it here
import { Draggable } from './Draggable'; // We'll need to create this or define it here

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const columns = [
    { id: TaskStatus.TODO, title: 'To Do' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
    { id: TaskStatus.IN_REVIEW, title: 'In Review' },
    { id: TaskStatus.DONE, title: 'Done' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onStatusChange, onEdit, onDelete }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find the task
            const task = tasks.find(t => t.id === active.id);
            if (task) {
                // If dropped over a container (column)
                if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
                    if (task.status !== over.id) {
                        onStatusChange(task.id, over.id as TaskStatus);
                    }
                }
                // If dropped over another item, we might want to reorder (not implemented yet) or just change status if different column
                else {
                    // Find the status of the item we dropped over
                    const overTask = tasks.find(t => t.id === over.id);
                    if (overTask && task.status !== overTask.status) {
                        onStatusChange(task.id, overTask.status);
                    }
                }
            }
        }

        setActiveId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 h-full">
                {columns.map((col) => (
                    <div key={col.id} className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4 flex flex-col h-full">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                            {col.title}
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </h3>
                        <Droppable id={col.id} className="flex-1 flex flex-col gap-3 min-h-[100px]">
                            {tasks
                                .filter((task) => task.status === col.id)
                                .map((task) => (
                                    <Draggable key={task.id} id={task.id}>
                                        <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                                    </Draggable>
                                ))}
                        </Droppable>
                    </div>
                ))}
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                        <TaskCard
                            task={tasks.find(t => t.id === activeId)!}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
