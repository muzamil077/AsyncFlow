import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const Droppable: React.FC<DroppableProps> = ({ id, children, className }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        backgroundColor: isOver ? '#f3f4f6' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={className}>
            {children}
        </div>
    );
};
