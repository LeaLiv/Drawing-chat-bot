import React from 'react';
import { Save, Plus, RotateCcw, Trash2 } from 'lucide-react';

interface DrawingControlsProps {
  selectedDrawingId: string;
  drawingNames: string[];
  onDrawingSelect: (id: string) => void;
  onNewDrawing: () => void;
  onSave: () => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  selectedDrawingId,
  drawingNames,
  onDrawingSelect,
  onNewDrawing,
  onSave,
  onUndo,
  onClear,
  canUndo
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg shadow-sm border">
      <select
        value={selectedDrawingId}
        onChange={(e) => onDrawingSelect(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {drawingNames.map((name, index) => (
          <option key={`drawing-${index}`} value={`drawing-${index}`}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={onNewDrawing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        <Plus size={16} />
        ציור חדש
      </button>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <RotateCcw size={16} />
        בטל
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        <Trash2 size={16} />
        נקה
      </button>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
      >
        <Save size={16} />
        שמור
      </button>
    </div>
  );
};