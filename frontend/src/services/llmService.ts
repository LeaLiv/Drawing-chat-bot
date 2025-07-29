import { getDrawingsFrompost } from './api';
import type { DrawingCommand } from '../types/drawing';

export class LLMService {
  static async parsePrompt(prompt: string): Promise<DrawingCommand[]> {
    try {
      const serverData = await getDrawingsFrompost(prompt);
      console.log('נתונים מהשרת:', serverData);
      
      if (!Array.isArray(serverData)) {
        console.error('הנתונים מהשרת אינם מערך:', serverData);
        return [];
      }
      
      // המר את הנתונים מהשרת לפורמט של DrawingCommand
      return serverData.map((item: any, index: number) => ({
        id: `cmd-${Date.now()}-${index}`,
        type: item.shape?.toLowerCase() || item.Shape?.toLowerCase() || 'rectangle',
        x: item.x || item.X || 50,
        y: item.y || item.Y || 50,
        width: item.width || item.Width || 100,
        height: item.height || item.Height || 100,
        color: item.color || item.Color || 'black',
        filled: false
      }));
    } catch (error) {
      console.error('שגיאה בעיבוד הפרומפט:', error);
      throw error;
    }
  }
}