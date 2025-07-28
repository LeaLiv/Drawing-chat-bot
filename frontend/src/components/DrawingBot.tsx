import { useState } from "react";
import type { DrawingCommand } from "../types/drawing";
import { Canvas } from "./DrawingCanvas";

export default function DrawingBot() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [drawingCommands, setDrawingCommands] = useState<DrawingCommand[]>([]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    // הוספת הודעה של המשתמש
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);

    try {
      const res = await fetch("https://localhost:7292/api/drawing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("שגיאה מהשרת");

      const data = await res.json(); // אמור להיות מערך של פקודות ציור
      setDrawingCommands(data);

      setMessages((prev) => [...prev, { role: "bot", text: "הנה הציור שלך ✨" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", text: "לא הצלחתי לצייר 😢" }]);
    }

    setPrompt("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">🎨 בוט ציור</h1>

      {/* קנבס */}
      <Canvas commands={drawingCommands} width={500} height={400} />

      {/* צ'אט */}
      <div className="bg-gray-100 p-3 rounded-lg h-40 overflow-y-auto text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right text-blue-600" : "text-left text-green-700"}>
            <strong>{msg.role === "user" ? "את" : "בוט"}:</strong> {msg.text}
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
          className="flex-1 border p-2 rounded"
        />
        <button onClick={sendPrompt} className="bg-blue-500 text-white px-4 py-2 rounded">
          שלח
        </button>
      </div>
    </div>
  );
}
