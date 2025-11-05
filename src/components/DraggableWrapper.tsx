import React, { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableWrapperProps {
  id: string;
  children: ReactNode;
  handle?: boolean;
  disabled?: boolean;
}

export const DraggableWrapper: React.FC<DraggableWrapperProps> = ({
  id,
  children,
  handle = true,
  disabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {handle && !disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-colors z-10"
          title="Drag to reorder"
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>
      )}
      {children}
    </div>
  );
};

interface DraggableItemProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  children,
  disabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
    >
      {children}
    </div>
  );
};
