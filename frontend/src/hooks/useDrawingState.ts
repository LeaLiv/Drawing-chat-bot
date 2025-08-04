// src/hooks/useDrawingManager.ts
import { useState, useCallback, useEffect } from 'react';
import type { Drawing, DrawingData } from '../types/drawing';
import { useAuth } from '../context/AuthContext';

const generateNewDrawing = (name: string): Drawing => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  history: [[]],
  historyIndex: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const fetchNewElement = async (prompt: string): Promise<DrawingData> => {
    const res = await fetch("https://localhost:7292/api/drawing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }), 
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
};

export const useDrawingManager = () => {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentDrawing = drawings.find(d => d.id === currentDrawingId);
  const [mergedData, setMergedData] = useState<DrawingData | null>(null);

  useEffect(() => {
    const loadDrawings = async () => {
      // אם יש משתמש מחובר, טען את הציורים שלו
      if (user) {
        setIsLoading(true);
        try {
          const res = await fetch(`https://localhost:7292/api/drawings/user/${user.id}`);
          if (!res.ok) throw new Error("Failed to load drawings.");
          const userDrawings: {id: string, name: string}[] = await res.json();
          if (userDrawings.length > 0) {
            const loadedDrawings = userDrawings.map(d => ({ ...generateNewDrawing(d.name), id: d.id }));
            setDrawings(loadedDrawings);
            await selectDrawing(loadedDrawings[0].id, loadedDrawings);
          } else {
            const newDrawing = generateNewDrawing('הציור הראשון שלי');
            setDrawings([newDrawing]);
            setCurrentDrawingId(newDrawing.id);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // אם המשתמש אנונימי, צור ציור חדש וריק
        const anonymousDrawing = generateNewDrawing('ציור אנונימי');
        setDrawings([anonymousDrawing]);
        setCurrentDrawingId(anonymousDrawing.id);
      }
    };
    loadDrawings();
  }, [user]); // האפקט ירוץ מחדש כשהמשתמש מתחבר או מתנתק

  useEffect(() => {
    if (!currentDrawing) {
        setMergedData(null);
        return;
    };
    const currentLayers = currentDrawing.history[currentDrawing.historyIndex];
    if (currentLayers && currentLayers.length > 0) {
      const merged: DrawingData = {
        canvasWidth: 500, canvasHeight: 500,
        objects: currentLayers.flatMap(data => data.objects),
      };
      setMergedData(merged);
    } else {
      setMergedData(null);
    }
  }, [currentDrawing]);

  const updateCurrentDrawing = (updater: (drawing: Drawing) => Drawing) => {
    setDrawings(prev => prev.map(d => d.id === currentDrawingId ? updater(d) : d));
  };
  
  const selectDrawing = useCallback(async (drawingId: string, currentDrawingsList = drawings) => {
    setCurrentDrawingId(drawingId);
    const selected = currentDrawingsList.find(d => d.id === drawingId);
    if (!selected || !user) return; // טוענים רק עבור משתמשים מחוברים

    if (selected.history.length === 1 && selected.history[0].length === 0) {
        setIsLoading(true);
        try {
            const res = await fetch(`https://localhost:7292/api/drawings/${drawingId}`);
            if (!res.ok) throw new Error("Failed to load drawing content.");
            const drawingContent: DrawingData = await res.json();
            setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, history: [[drawingContent]], historyIndex: 0 } : d));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
  }, [drawings, user]);

  const addElement = useCallback(async (prompt: string) => {
    if (!prompt.trim() || !currentDrawingId) return;
    setIsLoading(true);
    try {
      const newElementData = await fetchNewElement(prompt);
      updateCurrentDrawing(drawing => {
        const currentLayers = drawing.history[drawing.historyIndex];
        const newLayers = [...currentLayers, newElementData];
        const newHistory = drawing.history.slice(0, drawing.historyIndex + 1);
        return { ...drawing, history: [...newHistory, newLayers], historyIndex: drawing.historyIndex + 1, updatedAt: new Date() };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDrawingId, drawings]);

  const undo = () => {
    if (!currentDrawing || currentDrawing.historyIndex <= 0) return;
    updateCurrentDrawing(drawing => ({ ...drawing, historyIndex: drawing.historyIndex - 1 }));
  };
  
  const redo = () => {
    if (!currentDrawing || currentDrawing.historyIndex >= currentDrawing.history.length - 1) return;
    updateCurrentDrawing(drawing => ({ ...drawing, historyIndex: drawing.historyIndex + 1 }));
  };

  const clear = () => {
    if (!currentDrawing) return;
    updateCurrentDrawing(drawing => {
        const newHistory = drawing.history.slice(0, drawing.historyIndex + 1);
        return { ...drawing, history: [...newHistory, []], historyIndex: drawing.historyIndex + 1 };
    });
  };

  const createNewDrawing = () => {
    const newDrawing = generateNewDrawing(`ציור #${drawings.length + 1}`);
    setDrawings(prev => [...prev, newDrawing]);
    setCurrentDrawingId(newDrawing.id);
  };

  const save = useCallback(async () => {
    if (!user) {
      // הפונקציה הזו תיקרא מהממשק, שיפתח את מודל ההתחברות
      return;
    }
    if (!currentDrawing) return;
    setIsLoading(true);
    try {
      await fetch("https://localhost:7292/api/drawings", { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawingId: currentDrawing.id,
          drawingName: currentDrawing.name,
          drawingData: mergedData,
          userId: user.id
        }),
      });
      alert(`הציור '${currentDrawing.name}' נשמר עבור ${user.name}!`);
    } catch (error) {
      alert("אירעה שגיאה בזמן השמירה.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDrawing, mergedData, user]);

  return {
    drawings, currentDrawingId, drawingData: mergedData, isLoading, addElement,
    undo, redo, clear, createNewDrawing, selectDrawing, save,
    canUndo: currentDrawing ? currentDrawing.historyIndex > 0 : false,
    canRedo: currentDrawing ? currentDrawing.historyIndex < currentDrawing.history.length - 1 : false,
  };
};
