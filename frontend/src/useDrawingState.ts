import { useState, useCallback } from 'react';
import type { Drawing, DrawingCommand } from './types/drawing';

export const useDrawingState = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([
    {
      id: '1',
      name: 'ציור ראשון',
      commands: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string>('1');

  const currentDrawing = drawings.find(d => d.id === currentDrawingId) || null;

  const addCommands = useCallback((commands: DrawingCommand[]) => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands, updatedAt: new Date() }
        : drawing
    ));
  }, [currentDrawingId]);

  const undo = useCallback(() => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands: drawing.commands.slice(0, -1), updatedAt: new Date() }
        : drawing
    ));
  }, [currentDrawingId]);

  const clearDrawing = useCallback(() => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands: [], updatedAt: new Date() }
        : drawing
    ));
  }, [currentDrawingId]);

  const createNewDrawing = useCallback(() => {
    const newDrawing: Drawing = {
      id: Date.now().toString(),
      name: `ציור #${drawings.length + 1}`,
      commands: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDrawings(prev => [...prev, newDrawing]);
    setCurrentDrawingId(newDrawing.id);
  }, [drawings.length]);

  const selectDrawing = useCallback((id: string) => {
    setCurrentDrawingId(id);
  }, []);

  const canUndo = currentDrawing ? currentDrawing.commands.length > 0 : false;

  return {
    currentDrawing,
    drawings,
    addCommands,
    undo,
    clearDrawing,
    createNewDrawing,
    selectDrawing,
    canUndo
  };
};