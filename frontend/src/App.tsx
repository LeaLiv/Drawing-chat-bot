import React, { useState } from 'react';
import { Canvas } from './components/DrawingCanvas';
import { LLMService } from './services/llmService';
import './App.css';
import type { DrawingCommand } from './types/drawing';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

function App() {
  const [drawings, setDrawings] = useState<{id: string, commands: DrawingCommand[]}[]>([{ id: '1', commands: [] }]);
  const [currentDrawingId, setCurrentDrawingId] = useState('1');
  
  const currentDrawing = drawings.find(d => d.id === currentDrawingId) || null;

  const addCommands = (commands: DrawingCommand[]) => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands }
        : drawing
    ));
  };
  
  const undo = () => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands: drawing.commands.slice(0, -1) }
        : drawing
    ));
  };
  
  const clearDrawing = () => {
    setDrawings(prev => prev.map(drawing => 
      drawing.id === currentDrawingId 
        ? { ...drawing, commands: [] }
        : drawing
    ));
  };
  
  const createNewDrawing = () => {
    const newId = Date.now().toString();
    setDrawings(prev => [...prev, { id: newId, commands: [] }]);
    setCurrentDrawingId(newId);
  };
  
  const canUndo = currentDrawing ? currentDrawing.commands.length > 0 : false;

  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    try {
      const commands = await LLMService.parsePrompt(prompt);
      addCommands(commands);
      
      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: `ציור נוצר בהצלחה עם ${commands.length} אלמנטים`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing prompt:', error);
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: 'שגיאה בעיבוד הבקשה',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleDrawingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value.replace('drawing-', ''));
    const drawing = drawings[index];
    if (drawing) {
      setCurrentDrawingId(drawing.id);
    }
  };

  const drawingNames = drawings.map((d, index) => `Drawing #${index + 1}`);
  const currentDrawingIndex = currentDrawing ? drawings.findIndex(d => d.id === currentDrawing.id) : 0;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Controls */}
      <div className="bg-white border-b p-3 flex items-center gap-2">
        <select
          value={`drawing-${currentDrawingIndex}`}
          onChange={handleDrawingSelect}
          className="px-3 py-1 border rounded"
        >
          {drawingNames.map((name, index) => (
            <option key={`drawing-${index}`} value={`drawing-${index}`}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={createNewDrawing}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + New Drawing
        </button>
        <button
          onClick={() => handlePromptSubmit()}
          disabled={!prompt.trim() || isLoading}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Send
        </button>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300"
        >
          Undo
        </button>
        <button
          onClick={clearDrawing}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
        <button
          onClick={() => alert('הציור נשמר!')}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Save
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Chat Panel */}
        <div className="w-1/3 bg-white border-r flex flex-col">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold">צ'אט עם הבוט</h3>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded max-w-xs ${
                  message.type === 'user'
                    ? 'bg-green-100 ml-auto text-right'
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-sm">{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-2 rounded max-w-xs">
                <div className="text-sm">מעבד...</div>
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                placeholder="מה לצייר?"
                className="flex-1 px-3 py-2 border rounded"
                disabled={isLoading}
              />
              <button
                onClick={handlePromptSubmit}
                disabled={!prompt.trim() || isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                שלח
              </button>
            </div>
          </div>
        </div>

        {/* Right Canvas Panel */}
        <div className="flex-1 bg-white p-6">
          <Canvas
            commands={currentDrawing?.commands || []}
            width={800}
            height={500}
          />
        </div>
      </div>
    </div>
  );
}

export default App