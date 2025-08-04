// src/components/LoginModal.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const { login } = useAuth();

  const handleLogin = () => {
    if (username.trim()) {
      // באפליקציה אמיתית, ה-ID יגיע מהשרת. כאן נייצר אחד פשוט.
      const userId = username.toLowerCase().replace(/\s+/g, '-');
      login(userId, username);
      onClose(); // סוגרים את המודל אחרי התחברות
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">התחברות לשמירה</h2>
        <p className="mb-6 text-gray-600">הכנס שם משתמש כדי לשמור ולטעון את הציורים שלך.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="שם משתמש"
            className="flex-1 border p-2 rounded-lg"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold"
          >
            התחבר
          </button>
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline">
          המשך כאורח
        </button>
      </div>
    </div>
  );
};
