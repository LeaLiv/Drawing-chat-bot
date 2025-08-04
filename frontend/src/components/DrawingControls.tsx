// src/components/DrawingControls.tsx
import React from 'react';
import { Save, Plus, RotateCcw, Trash2, RotateCw, LogOut, LogIn } from 'lucide-react';
import type { Drawing } from '../types/drawing';

// The User type from AuthContext
interface User {
  id: string;
  name: string;
}

interface DrawingControlsProps {
  user: User | null; // 🔽 **תיקון: הוספנו את המאפיין user**
  onLogout: () => void; // 🔽 **תיקון: הוספנו פונקציה להתנתקות**
  onLoginClick: () => void;
  selectedDrawingId: string;
  drawings: Drawing[];
  onDrawingSelect: (id: string) => void;
  onNewDrawing: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  user,
  onLogout,
  onLoginClick,
  selectedDrawingId,
  drawings,
  onDrawingSelect,
  onNewDrawing,
  onSave,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white shadow-sm border-b">
      <div className="flex items-center gap-3">
        {user && (
          <select
            value={selectedDrawingId}
            onChange={(e) => onDrawingSelect(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {drawings.map((drawing) => (
              <option key={drawing.id} value={drawing.id}>
                {drawing.name}
              </option>
            ))}
          </select>
        )}
        <button onClick={onNewDrawing} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          <Plus size={16} /> New
        </button>
        <button onClick={onUndo} disabled={!canUndo} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300">
          <RotateCcw size={16} /> Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300">
          <RotateCw size={16} /> Redo
        </button>
        <button onClick={onClear} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
          <Trash2 size={16} /> Clear
        </button>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
          <Save size={16} /> Save
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="font-semibold text-gray-700">שלום, {user.name}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500">
              <LogOut size={16} /> התנתק
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md">
            <LogIn size={16} /> התחבר כדי לשמור
          </button>
        )}
      </div>
    </div>
  );
};
