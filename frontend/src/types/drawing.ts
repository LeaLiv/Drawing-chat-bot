// src/types/drawing.ts

// Represents a point with X and Y coordinates
interface Point {
  x: number;
  y: number;
}

// 🔽 THIS IS THE CORRECTED INTERFACE 🔽
// It now includes all optional properties for every shape type.
export interface DrawingComponent {
  shape: 'rectangle' | 'circle' | 'line' | 'triangle' | 'ellipse';
  color: string;
  filled?: boolean;
  
  // Properties for rectangle & ellipse
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Properties for circle
  cx?: number;
  cy?: number;
  radius?: number;

  // Properties for line
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  
  // Properties for triangle
  points?: Point[];
}

// A logical object in the scene, like a "house"
export interface LogicalObject {
  type: string;
  components: DrawingComponent[];
}

// The complete drawing data object from the server
export interface DrawingData {
  canvasWidth: number;
  canvasHeight: number;
  objects: LogicalObject[];
}

// A complete, named drawing with its own history
export interface Drawing {
  id: string;
  name: string;
  history: DrawingData[][];
  historyIndex: number;
  createdAt: Date;
  updatedAt: Date;
}