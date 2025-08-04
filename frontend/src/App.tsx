import React, { useState } from 'react';
import { Canvas } from './components/Canvas';
import { DrawingControls } from './components/DrawingControls';
import { ChatInterface } from './components/ChatInterface';
import { useDrawingState } from './hooks/useDrawingState';
import { LLMService } from './services/llmService';
import { Palette } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  commandCount?: number;
}

interface HistoryItem {
  prompt: string;
  timestamp: Date;
  commandCount: number;
}

function App() {
  const {
    currentDrawing,
    drawings,
    addCommands,
    undo,
    clearDrawing,
    createNewDrawing,
    selectDrawing,
    canUndo
  } = useDrawingState();

  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handlePromptSubmit = async (prompt: string) => {
    // Add user message
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
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: `ציירתי ${commands.length} אלמנטים בהתאם לבקשתך!`,
        timestamp: new Date(),
        commandCount: commands.length
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing prompt:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: 'מצטער, אירעה שגיאה בעיבוד הבקשה. נסה שוב.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawingSelect = (selectionValue: string) => {
    const index = parseInt(selectionValue.replace('drawing-', ''));
    const drawing = drawings[index];
    if (drawing) {
      selectDrawing(drawing.id);
    }
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log('Saving drawing:', currentDrawing);
    alert('הציור נשמר בהצלחה!');
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const drawingNames = drawings.map((d, index) => `ציור #${index + 1}`);
  const currentDrawingIndex = currentDrawing ? drawings.findIndex(d => d.id === currentDrawing.id) : 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Palette className="text-blue-500" size={32} />
            <h1 className="text-2xl font-bold text-gray-900">בוט ציור בשפה טבעית</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls and Input */}
          <div className="lg:col-span-1 order-2 lg:order-1 h-96 lg:h-[600px]">
            <ChatInterface 
              onSubmit={handlePromptSubmit} 
              isLoading={isLoading}
              messages={chatMessages}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
            <DrawingControls
              selectedDrawingId={`drawing-${currentDrawingIndex}`}
              drawingNames={drawingNames}
              onDrawingSelect={handleDrawingSelect}
              onNewDrawing={createNewDrawing}
              onSave={handleSave}
              onUndo={undo}
              onClear={clearDrawing}
              canUndo={canUndo}
            />

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Canvas
                commands={currentDrawing?.commands || []}
                width={800}
                height={400}
              />
            </div>

          </div>
        </div>
      </main>

     
    </div>
  );
}

export default App;