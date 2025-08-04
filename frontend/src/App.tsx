// src/App.tsx

import './App.css';
import DrawingBot from './components/DrawingBot';

function App() {
  return (
    // The main App component now only needs to render the DrawingBot.
    // All the logic is handled inside DrawingBot.
    <DrawingBot />
  );
}

export default App;