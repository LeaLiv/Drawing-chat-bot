// src/types/drawing.ts

// מתאר נקודה עם קואורדינטות X ו-Y
interface Point {
  x: number;
  y: number;
}

// מתאר צורת ציור בסיסית (רכיב)
export interface DrawingComponent {
  shape: 'rectangle' | 'circle' | 'line' | 'triangle' | 'ellipse';
  color: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  cx?: number; // מרכז X לעיגול
  cy?: number; // מרכז Y לעיגול
  radius?: number;
  x1?: number; // נקודת התחלה לקו
  y1?: number;
  x2?: number; // נקודת סוף לקו
  y2?: number;
  points?: Point[]; // מערך נקודות למשולש
  filled?: boolean; // אם למלא את הצורה בצבע
}

// מתאר אובייקט לוגי, כמו "בית" או "שמש"
export interface LogicalObject {
  type: string;
  components: DrawingComponent[];
}

// מתאר את כל מבנה הנתונים שמתקבל מהשרת
export interface DrawingData {
  canvasWidth: number;
  canvasHeight: number;
  objects: LogicalObject[];
}