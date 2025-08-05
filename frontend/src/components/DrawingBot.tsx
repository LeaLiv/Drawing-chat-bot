// src/components/DrawingBot.tsx
import { useEffect, useRef, useState } from "react";
import { DrawingControls } from "./DrawingControls";
import { useAuth } from "../context/AuthContext";
import { LoginModal } from "./LoginModal";
import { useDrawingManager } from "../hooks/useDrawingState";
import { Canvas } from "./Canvas";

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

      <div >
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div id="app-container">

      {/* פאנל ימני (קנבס) */}
      <div id="canvas-panel">
        <Canvas drawingData={drawingData} />
      </div>

      {/* קו מפריד */}
      <div id="separator-line"></div>

      {/* פאנל שמאלי (צ'אט) */}
      <div id="chat-panel">

        <div id="chat-header">
          <h2 className="font-semibold">הצ'אט שלך עם הבוט</h2>
        </div>

        <div id="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>



        <div id="chat-input-area">
          <div className="flex gap-2 input-container">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddElement()}
              placeholder="כתוב הודעה..."
              className="flex-1 border p-2 rounded-lg input-field"
              disabled={isLoading}
            />
            <button
              id="send-button"
              onClick={handleAddElement}
              className="bg-green-500 text-white px-4 rounded-lg font-semibold disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? '...' : 'שלח'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}