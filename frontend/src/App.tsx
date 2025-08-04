// src/App.tsx
import './App.css';
import DrawingBot from './components/DrawingBot';
import { AuthProvider } from './context/AuthContext'; // ייבוא הספק

function App() {
  return (
    <AuthProvider>
      <DrawingBot />
    </AuthProvider>
  );
}

export default App;
