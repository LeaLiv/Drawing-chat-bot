
import { useState } from 'react';
import './App.css'
import { getDrawingsFrompost } from './services/api';
import type { DrawingCommand } from './types/drawing';
import DrawingBot from './components/DrawingBot';

function App() {
  const [prompt, setPrompt] = useState('');
  const [, setCommand] = useState<DrawingCommand[]>([]);

  const handleSubmit = async ()=>{
    try {
      const result = await getDrawingsFrompost(prompt);
      setCommand(result);
    } catch (error) {
      console.error('Error generating drawing:', error);
      alert('error in generating drawing: ');
    }
  }

  return (
   <div>
      {/* <h1>בוט ציור</h1>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="כתוב כאן פרומפט..." />
      <button onClick={handleSubmit}>שלח</button> */}
      {/* <DrawingCanvas commands={command} /> */}
      {/* <Canvas commands={command} width={600} height={400} /> */}
      <DrawingBot></DrawingBot>
    </div>
  )
}

export default App
