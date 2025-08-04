// src/components/DrawingControls.tsx
import React from 'react';
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
  onClear,
  canUndo,
}) => {
  return (
    // className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white shadow-sm border-b"className="flex items-center gap-3"
    <div style={{ backgroundColor: '#f3f4f6', padding: '7px' }}>
      <div className='inline-container'>
        {user && (
          <select
            value={selectedDrawingId}
            onChange={(e) => onDrawingSelect(e.target.value)}
          // className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {drawings.map((drawing) => (
              <option key={drawing.id} value={drawing.id}>
                {drawing.name}
              </option>
            ))}
          </select>
        )}
        <button onClick={onNewDrawing}
          style={{ background: '#3b82f6' }}
        // className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          + New Drawing
        </button>
        <button onClick={onSave} style={{ background: '#22c55e' }}>
          Send
        </button>
        <button onClick={onUndo} disabled={!canUndo} style={{ background: '#eab308' }}>
          Undo
        </button>
        <button onClick={onClear} style={{ background: '#ef4444' }}>
          Clear
        </button>
        <button onClick={onSave} style={{ background: '#a855f7' }}>
          Save
        </button>

      </div>

      <div className='inline-container' >
        {user ? (
          <>
            <span className="font-semibold text-gray-700">שלום, {user.name}</span>
            <button onClick={onLogout} >
              התנתק
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} >
            התחבר כדי לשמור
          </button>
        )}
      </div>
    </div>
  );
};
