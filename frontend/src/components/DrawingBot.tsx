// src/components/DrawingBot.tsx (גרסה מלאה ומתוקנת)

import { useState, useEffect } from "react";
import type { DrawingData } from "../types/drawing";
import { Canvas } from "./DrawingCanvas";

export default function DrawingBot() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  
  // State חדש שמחזיק את ההיסטוריה של כל הציורים שהתקבלו
  const [drawingHistory, setDrawingHistory] = useState<DrawingData[]>([]);
  // State שמחזיק את הציור הממוזג שיוצג על הקנבס
  const [mergedDrawingData, setMergedDrawingData] = useState<DrawingData | null>(null);

  // אפקט שרץ בכל פעם שההיסטוריה מתעדכנת
  useEffect(() => {
    if (drawingHistory.length > 0) {
      // ממזגים את כל האובייקטים מכל הציורים בהיסטוריה לאובייקט אחד
      const mergedData: DrawingData = {
        canvasWidth: drawingHistory[0].canvasWidth,
        canvasHeight: drawingHistory[0].canvasHeight,
        objects: drawingHistory.flatMap(data => data.objects)
      };
      setMergedDrawingData(mergedData);
    } else {
      // אם ההיסטוריה ריקה, מאפסים את הקנבס
      setMergedDrawingData(null);
    }
  }, [drawingHistory]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);

    try {
      const res = await fetch("https://localhost:7292/api/drawing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("שגיאה מהשרת");

      const newData: DrawingData = await res.json();
      // במקום להחליף את הציור, אנו מוסיפים את הציור החדש להיסטוריה
      setDrawingHistory((prevHistory) => [...prevHistory, newData]);

      setMessages((prev) => [...prev, { role: "bot", text: "הוספתי את זה לציור שלך ✨" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", text: "לא הצלחתי לצייר 😢" }]);
    }
    setPrompt("");
  };

  // פונקציה לניקוי הציור (איפוס ההיסטוריה)
  const clearDrawing = () => {
    setDrawingHistory([]);
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800">🎨 בוט הציור של ג'מיני</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* עמודת השליטה והצ'אט */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
            {/* צ'אט */}
            <div className="bg-gray-100 p-3 rounded-lg h-64 overflow-y-auto text-sm border">
                {messages.length === 0 && <div className="text-gray-500 text-center pt-8">היסטוריית הצ'אט תופיע כאן...</div>}
                {messages.map((msg, i) => (
                <div key={i} className={`p-2 rounded-lg mb-2 max-w-xs ${msg.role === "user" ? "bg-blue-100 text-blue-800 ml-auto" : "bg-gray-200 text-gray-800 mr-auto"}`}>
                    <strong>{msg.role === "user" ? "את/ה" : "בוט"}:</strong> {msg.text}
                </div>
                ))}
            </div>

            {/* שורת שליחה */}
            <div className="flex gap-2">
                <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
                placeholder="מה לצייר?"
                className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendPrompt} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                שלח
                </button>
            </div>
             <button onClick={clearDrawing} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                נקה ציור
            </button>
        </div>

        {/* עמודת הקנבס */}
        <div className="w-full md:w-2/3">
           <Canvas drawingData={mergedDrawingData} />
        </div>
      </div>
    </div>
  );
}