import { useState } from "react";
import { Canvas } from "./Canvas";
import type { DrawingCommand, Point } from "../types/drawing";

// פונקציה שמתרגמת נתונים מהשרת לפורמט הנכון
const convertServerDataToCommands = (serverData: any[]): DrawingCommand[] => {
  // מציאת גבולות הציור
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  serverData.forEach(item => {
    const dims = item.dimensions || {};
    const x = dims.x ?? dims.x1 ?? 0;
    const y = dims.y ?? dims.y1 ?? 0;
    const width = dims.width || dims.base || (dims.radius ? dims.radius * 2 : 50);
    const height = dims.height || (dims.radius ? dims.radius * 2 : 50);

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  });

  if (!isFinite(minX)) minX = 0;
  if (!isFinite(maxX)) maxX = 200;
  if (!isFinite(minY)) minY = 0;
  if (!isFinite(maxY)) maxY = 200;

  const drawingWidth = maxX - minX;
  const drawingHeight = maxY - minY;
  const canvasWidth = 500;
  const canvasHeight = 400;

  const scale = Math.min(
    (canvasWidth * 0.7) / Math.max(drawingWidth, 1),
    (canvasHeight * 0.7) / Math.max(drawingHeight, 1),
    3
  );

  const offsetX = (canvasWidth - drawingWidth * scale) / 2 - minX * scale;
  const offsetY = (canvasHeight - drawingHeight * scale) / 2 - minY * scale;

  return serverData.map((item, index) => {
    const dims = item.dimensions || {};
    const xRaw = dims.x ?? dims.x1 ?? 0;
    const yRaw = dims.y ?? dims.y1 ?? 0;

    const x = xRaw * scale + offsetX;
    const y = yRaw * scale + offsetY;

    const baseCommand = {
      id: `shape-${index}`,
      x: x,
      y: y,
      color: item.color || 'black',
      filled: true,
    };

    switch (item.shape) {
      case 'rectangle':
        return {
          ...baseCommand,
          type: 'rectangle' as const,
          width: (dims.width || 50) * scale,
          height: (dims.height || 50) * scale,
        };

      case 'triangle':
        const base = dims.base || dims.width || 50;
        const height = dims.height || 50;
        const trianglePoints: Point[] = [
          { x: x, y: y + height * scale },
          { x: x + (base * scale) / 2, y: y },
          { x: x + base * scale, y: y + height * scale },
        ];
        return {
          ...baseCommand,
          type: 'triangle' as const,
          points: trianglePoints,
        };

      case 'circle':
        return {
          ...baseCommand,
          type: 'circle' as const,
          radius: (dims.radius || Math.min(dims.width || 50, dims.height || 50) / 2) * scale,
        };

      case 'line':
        return {
          ...baseCommand,
          type: 'line' as const,
          x2: (dims.x2 ?? xRaw + 50) * scale + offsetX,
          y2: (dims.y2 ?? yRaw + 50) * scale + offsetY,
        };

      default:
        return {
          ...baseCommand,
          type: 'rectangle' as const,
          width: (dims.width || 50) * scale,
          height: (dims.height || 50) * scale,
        };
    }
  });
};
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

      const serverData = await res.json(); // הנתונים המקוריים מהשרת
      console.log("נתונים מהשרת:", serverData); // לדיבוג
      
      // המרת הנתונים לפורמט הנכון
      const convertedCommands = convertServerDataToCommands(serverData);
      console.log("נתונים לאחר המרה:", convertedCommands); // לדיבוג
      
      setDrawingCommands(convertedCommands);

      setMessages((prev) => [...prev, { role: "bot", text: "הנה הציור שלך ✨" }]);
    } catch (err) {
      console.error("שגיאה:", err);
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