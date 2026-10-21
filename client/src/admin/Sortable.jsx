import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/** Drag-to-reorder list wrapper. `ids` is the current order; `onReorder(newIds)` fires after a drop. */
export function Sortable({ ids, onReorder, children }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const end = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>{children}</SortableContext>
    </DndContext>
  );
}

/** Render-prop row: children({ setNodeRef, style, handle }) where `handle` spreads onto the drag handle button. */
export function SortItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative', zIndex: isDragging ? 10 : undefined };
  return children({ setNodeRef, style, handle: { ...attributes, ...listeners, 'aria-label': 'Drag to reorder', type: 'button' } });
}

export const Handle = (p) => <button {...p} className="cursor-grab touch-none rounded px-2 text-lg leading-none text-black/50 hover:text-wine active:cursor-grabbing">⋮⋮</button>;
