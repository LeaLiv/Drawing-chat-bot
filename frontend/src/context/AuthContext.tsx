// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';

// הגדרת המידע שנשמור על המשתמש
interface User {
  id: string;
  name: string;
}

// הגדרת מה שה-Context שלנו יספק
interface AuthContextType {
  user: User | null;
  login: (id: string, name: string) => void;
  logout: () => void;
}

// יצירת ה-Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// יצירת ה"ספק" שיעטוף את האפליקציה ויספק את המידע
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (id: string, name: string) => {
    setUser({ id, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// יצירת הוק מותאם אישית כדי לגשת בקלות למידע
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
