import { useState, useCallback } from 'react';
import type { Drawing, DrawingCommand, DrawingState } from '../types/drawing';

const generateInitialDrawingObject = (name: string): Drawing => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  commands: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

export const useDrawingState = () => {
  const [state, setState] = useState<DrawingState>(() => {
    const initialDrawing = generateInitialDrawingObject('ציור #1');
    return {
      currentDrawing: initialDrawing,
      commandHistory: [[]],
      historyIndex: 0,
      drawings: [initialDrawing]
    };
  });

  const addCommands = useCallback((commands: DrawingCommand[]) => {
    setState(prevState => {
      if (!prevState.currentDrawing) return prevState;

      const newCommands = [...prevState.currentDrawing.commands, ...commands];
      const newHistory = prevState.commandHistory.slice(0, prevState.historyIndex + 1);
      newHistory.push(newCommands);

      const updatedDrawing = {
        ...prevState.currentDrawing,
        commands: newCommands,
        updatedAt: new Date()
      };

      return {
        ...prevState,
        currentDrawing: updatedDrawing,
        commandHistory: newHistory,
        historyIndex: newHistory.length - 1,
        drawings: prevState.drawings.map(d => 
          d.id === updatedDrawing.id ? updatedDrawing : d
        )
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex <= 0 || !prevState.currentDrawing) return prevState;

      const newIndex = prevState.historyIndex - 1;
      const commands = prevState.commandHistory[newIndex];

      const updatedDrawing = {
        ...prevState.currentDrawing,
        commands,
        updatedAt: new Date()
      };

      return {
        ...prevState,
        currentDrawing: updatedDrawing,
        historyIndex: newIndex,
        drawings: prevState.drawings.map(d => 
          d.id === updatedDrawing.id ? updatedDrawing : d
        )
      };
    });
  }, []);

  const clearDrawing = useCallback(() => {
    setState(prevState => {
      if (!prevState.currentDrawing) return prevState;

      const updatedDrawing = {
        ...prevState.currentDrawing,
        commands: [],
        updatedAt: new Date()
      };

      const newHistory = [...prevState.commandHistory, []];

      return {
        ...prevState,
        currentDrawing: updatedDrawing,
        commandHistory: newHistory,
        historyIndex: newHistory.length - 1,
        drawings: prevState.drawings.map(d => 
          d.id === updatedDrawing.id ? updatedDrawing : d
        )
      };
    });
  }, []);

  const createNewDrawing = useCallback(() => {
    setState(prevState => {
      const newDrawing = {
        id: Math.random().toString(36).substr(2, 9),
        name: `ציור #${prevState.drawings.length + 1}`,
        commands: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...prevState,
        currentDrawing: newDrawing,
        commandHistory: [[]],
        historyIndex: 0,
        drawings: [...prevState.drawings, newDrawing]
      };
    });
  }, []);

  const selectDrawing = useCallback((drawingId: string) => {
    setState(prevState => {
      const selectedDrawing = prevState.drawings.find(d => d.id === drawingId);
      if (!selectedDrawing) return prevState;

      return {
        ...prevState,
        currentDrawing: selectedDrawing,
        commandHistory: [selectedDrawing.commands],
        historyIndex: 0
      };
    });
  }, []);

  return {
    ...state,
    addCommands,
    undo,
    clearDrawing,
    createNewDrawing,
    selectDrawing,
    canUndo: state.historyIndex > 0
  };
};