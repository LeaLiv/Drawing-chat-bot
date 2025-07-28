export interface Point {
  x: number;
  y: number;
}

export interface DrawingCommand {
  id: string;
  type: 'circle' | 'rectangle' | 'line' | 'triangle' | 'ellipse';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  points?: Point[];
  color: string;
  filled: boolean;
}

export interface Drawing {
  id: string;
  name: string;
  commands: DrawingCommand[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingState {
  currentDrawing: Drawing | null;
  commandHistory: DrawingCommand[][];
  historyIndex: number;
  drawings: Drawing[];
}