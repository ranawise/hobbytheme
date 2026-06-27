import React, { useRef } from 'react';
import { useDndMonitor } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import tw from 'twin.macro';
import { Server } from '@/api/server/getServer';
import ServerCard from '@/components/dashboard/ServerCard';

export default ({ server, onStatusChange }: { server: Server; onStatusChange?: (uuid: string, isOnline: boolean) => void }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
        useSortable({ id: server.uuid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    // useDndMonitor fires synchronously inside dnd-kit's event pipeline, before
    // the browser's click event that follows pointer-up. That guarantees the ref
    // is already true when onClickCapture runs and can block navigation.
    const dragging = useRef(false);
    useDndMonitor({
        onDragStart() { dragging.current = true; },
        // setTimeout(0) defers the reset until after the click event fires.
        onDragEnd()   { setTimeout(() => { dragging.current = false; }, 0); },
        onDragCancel(){ dragging.current = false; },
    });

    const dragHandle = (
        <span
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
            css={tw`flex-shrink-0 text-neutral-600 hover:text-neutral-300`}
        >
            <GripVertical size={16} />
        </span>
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClickCapture={(e) => {
                if (dragging.current) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}
        >
            <ServerCard server={server} dragHandle={dragHandle} onStatusChange={onStatusChange} />
        </div>
    );
};
