// src/components/Login.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const { login } = useAuth();

  const handleLogin = () => {
    if (username.trim()) {
      // באפליקציה אמיתית, ה-ID יגיע מהשרת. כאן נייצר אחד פשוט.
      const userId = username.toLowerCase().replace(/\s+/g, '-');
      login(userId, username);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">ברוכים הבאים לבוט הציור</h1>
        <p className="mb-6 text-gray-600">התחבר כדי לשמור ולטעון את הציורים שלך.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="הכנס שם משתמש"
            className="flex-1 border p-2 rounded-lg"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold"
          >
            התחבר
          </button>
        </div>
      </div>
    </div>
  );
};
