// src/components/DrawingBot.tsx
import { useState } from "react";
import { Canvas } from "./DrawingCanvas";
import { DrawingControls } from "./DrawingControls";
import { useAuth } from "../context/AuthContext";
import { LoginModal } from "./LoginModal";
import { useDrawingManager } from "../hooks/useDrawingState";

export default function DrawingBot() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const { user, logout } = useAuth(); 
  const { drawings, currentDrawingId, addElement, ...manager } = useDrawingManager();

  const handleSaveClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      manager.save();
    }
  };

  if (!currentDrawingId) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }

  return (
    <>
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      
      <div className="flex flex-col h-screen font-sans bg-gray-50">
        <DrawingControls
          user={user}
          onLogout={logout}
          onLoginClick={() => setIsLoginModalOpen(true)}
          selectedDrawingId={currentDrawingId}
          drawings={drawings}
          onDrawingSelect={manager.selectDrawing}
          onNewDrawing={manager.createNewDrawing}
          onSave={handleSaveClick}
          onUndo={manager.undo}
          onRedo={manager.redo}
          onClear={manager.clear}
          canUndo={manager.canUndo}
          canRedo={manager.canRedo}
        />
        
        <DrawingApplicationContent 
          addElement={addElement}
          isLoading={manager.isLoading}
          drawingData={manager.drawingData}
        />
      </div>
    </>
  );
}

// רכיב פנימי לאפליקציית הציור עצמה
const DrawingApplicationContent = ({ addElement, isLoading, drawingData }: any) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);

  const handleAddElement = async () => {
    if (!prompt.trim()) return;
    
    const currentPrompt = prompt;
    setMessages(prev => [...prev, { role: 'user', text: currentPrompt }]);
    setPrompt("");
    
    // קוראים לפונקציה מההוק כדי להוסיף את האובייקט
    await addElement(currentPrompt);

    // מוסיפים תגובת בוט אחרי שהפעולה הסתיימה
    setMessages(prev => [...prev, { role: 'bot', text: 'ציירתי את זה!' }]);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 🔽 **תיקון: פאנל שמאלי עם היסטוריית צ'אט וקלט** 🔽 */}
      <div className="w-1/3 flex flex-col border-r bg-white">
          <div className="p-3 border-b">
              <h2 className="font-semibold">הצ'אט שלך עם הבוט </h2>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg max-w-xs text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
          </div>
          <div className="p-2 border-t bg-gray-50">
              <div className="flex gap-2">
                  <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddElement()}
                      placeholder="כתוב הודעה..." className="flex-1 border p-2 rounded-lg" disabled={isLoading} />
                  <button onClick={handleAddElement} className="bg-green-500 text-white px-4 rounded-lg font-semibold disabled:bg-gray-400" disabled={isLoading}>
                      {isLoading ? '...' : 'שלח'}
                  </button>
              </div>
          </div>
      </div>
      
      {/* פאנל ימני עם הקנבס */}
      <div className="flex-1 p-4 flex items-center justify-center bg-gray-100">
           <Canvas drawingData={drawingData} />
      </div>
    </div>
  );
}
