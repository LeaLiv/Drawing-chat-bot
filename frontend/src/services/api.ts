const API_BASE_URL = 'https://localhost:7292/api';

export interface ApiDrawingCommand {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
  points?: { x: number; y: number }[];
  color: string;
  filled: boolean;
}

export interface ApiDrawing {
  id: number;
  name: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  commands: ApiDrawingCommand[];
}

export interface ApiDrawingSummary {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  commandCount: number;
}

export class ApiService {
  private static async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // LLM Service
  static async parsePrompt(prompt: string): Promise<ApiDrawingCommand[]> {
    return this.fetchWithErrorHandling<ApiDrawingCommand[]>(`${API_BASE_URL}/drawing/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Drawing Service
  static async getDrawings(userId?: string): Promise<ApiDrawingSummary[]> {
    const url = userId ? `${API_BASE_URL}/drawings?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/drawing/generate`;
    return this.fetchWithErrorHandling<ApiDrawingSummary[]>(url);
  }

  static async getDrawing(id: number): Promise<ApiDrawing> {
    return this.fetchWithErrorHandling<ApiDrawing>(`${API_BASE_URL}/drawings/${id}`);
  }

  static async createDrawing(name: string, userId?: string): Promise<ApiDrawing> {
    return this.fetchWithErrorHandling<ApiDrawing>(`${API_BASE_URL}/drawings`, {
      method: 'POST',
      body: JSON.stringify({ name, userId }),
    });
  }

  static async updateDrawing(id: number, name: string): Promise<ApiDrawing> {
    return this.fetchWithErrorHandling<ApiDrawing>(`${API_BASE_URL}/drawings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  static async deleteDrawing(id: number): Promise<void> {
    await this.fetchWithErrorHandling<void>(`${API_BASE_URL}/drawings/${id}`, {
      method: 'DELETE',
    });
  }

  static async addCommands(drawingId: number, commands: ApiDrawingCommand[]): Promise<ApiDrawing> {
    return this.fetchWithErrorHandling<ApiDrawing>(`${API_BASE_URL}/drawings/${drawingId}/commands`, {
      method: 'POST',
      body: JSON.stringify(commands),
    });
  }
}