import type { DrawingCommand } from "../types/drawing";
import { ApiService } from "./api";

export class LLMService {
  static async parsePrompt(prompt: string): Promise<DrawingCommand[]> {
    try {
      const apiCommands = await ApiService.parsePrompt(prompt);
      return apiCommands.map(cmd => ({
        id: cmd.id,
        type: cmd.type as 'circle' | 'rectangle' | 'line' | 'triangle' | 'ellipse',
        x: cmd.x,
        y: cmd.y,
        width: cmd.width,
        height: cmd.height,
        radius: cmd.radius,
        x2: cmd.x2,
        y2: cmd.y2,
        points: cmd.points,
        color: cmd.color,
        filled: cmd.filled
      }));
    } catch (error) {
      console.error('Failed to parse prompt with API, using fallback:', error);
      return this.getFallbackCommands(prompt);
    }
  }

  private static getFallbackCommands(prompt: string): DrawingCommand[] {
    // Fallback to simple local parsing if API fails
    const commands: DrawingCommand[] = [];
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('פרח') || lowerPrompt.includes('flower')) {
      commands.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'circle',
        x: 150,
        y: 200,
        radius: 20,
        color: '#FF69B4',
        filled: true
      });
    }

    if (lowerPrompt.includes('שמש') || lowerPrompt.includes('sun')) {
      commands.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'circle',
        x: 200,
        y: 120,
        radius: 50,
        color: '#FFD700',
        filled: true
      });
    }

    return commands;
  }
}