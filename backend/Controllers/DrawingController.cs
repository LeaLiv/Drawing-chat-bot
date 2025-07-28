using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Text; // נדרש עבור StringContent

[ApiController]

[Route("api/[controller]")]
public class DrawingController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public DrawingController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDrawing([FromBody] PromptRequest request)
    {
        // קבל את מפתח ה-API של Gemini מהקונפיגורציה.
        // ודא שהוספת אותו ל-appsettings.json או לסודות משתמש (לדוגמה, "GoogleAI:ApiKey").
        var apiKey = _configuration["GoogleAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            return StatusCode(500, "GoogleAI:ApiKey לא הוגדר.");
        }

        var httpClient = _httpClientFactory.CreateClient();

        // מפתח ה-API של Gemini מועבר בדרך כלל כפרמטר שאילתה או בכותרת מותאמת אישית,
        // ולא כ-Bearer token בכותרת Authorization לשימוש בסיסי.
        // לצורך פשטות בקריאות HTTP ישירות, נוסיף אותו ל-URL.
        // נקודת הקצה משתמשת ב-'gemini-pro' כמודל לדוגמה. ייתכן שתשתמש ב-'gemini-1.5-pro-latest' וכו'.
        var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b-latest:generateContent?key={apiKey}";

        // גוף הבקשה עבור Gemini שונה מ-OpenAI.
        // הוא משתמש ב-'contents' עם 'parts' ו-'text'.
        // אין מקבילה ישירה לתפקיד "system" בנקודת הקצה generateContent;
        // בדרך כלל משלבים הוראות מערכת בהודעת המשתמש או משתמשים בדוגמאות Few-shot.
        // עבור דוגמה זו, נשלב את הוראת המערכת עם בקשת המשתמש.
        // var combinedPrompt = $"אתה בוט ציור. החזר רק מערך של פקודות ציור בפורמט JSON (עיגול, מלבן, קו), כל אחת עם צבע ומאפיינים. הנה בקשת המשתמש: {request.Prompt}";
        // שלב 1: תרגום פרומפט לעברית לאנגלית
        var translatedPrompt = $"Translate the following Hebrew instruction to English and convert it into drawing commands as JSON array with shape, color and dimensions only. Return only the raw JSON array: {request.Prompt}";

        var body = new
        {
            contents = new[]
            {
                new {
                    role = "user",
                    parts = new[] {
                        new { text = translatedPrompt }
                    }
                }
            },
            // המקבילה של Gemini ל-temperature היא 'temperature'
            generationConfig = new
            {
                temperature = 0.3
            }
        };

        // המר את גוף הבקשה ל-JSON
        var jsonBody = JsonSerializer.Serialize(body, new JsonSerializerOptions { WriteIndented = false });
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        Console.WriteLine($"גוף בקשת Gemini: {jsonBody}"); // לצורך דיבוג

        var response = await httpClient.PostAsync(geminiApiUrl, content);
        var json = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"תגובת Gemini: {json}"); // לצורך דיבוג

        if (!response.IsSuccessStatusCode)
        {
            // רשום את השגיאה או החזר הודעת שגיאה ספציפית יותר מ-Gemini API
            return StatusCode((int)response.StatusCode, $"שגיאה מ-Gemini API: {json}");
        }

        // נתח את תגובת Gemini
        using var doc = JsonDocument.Parse(json);
        JsonElement root = doc.RootElement;

        // מבנה התגובה של Gemini מכיל בדרך כלל "candidates" -> "content" -> "parts" -> "text"
        if (!root.TryGetProperty("candidates", out JsonElement candidates) ||
            candidates.ValueKind != JsonValueKind.Array ||
            candidates.GetArrayLength() == 0)
        {
            return BadRequest("לא נמצאו מועמדים בתגובת Gemini.");
        }

        var firstCandidate = candidates[0];
        if (!firstCandidate.TryGetProperty("content", out JsonElement candidateContent) ||
            !candidateContent.TryGetProperty("parts", out JsonElement parts) ||
            parts.ValueKind != JsonValueKind.Array ||
            parts.GetArrayLength() == 0)
        {
            return BadRequest("לא ניתן למצוא חלקי תוכן בתגובת Gemini.");
        }

        // תוכן הטקסט בפועל נמצא במאפיין "text" של החלק הראשון
        var generatedText = parts[0].TryGetProperty("text", out JsonElement textElement) ? textElement.GetString() : string.Empty;
        generatedText = generatedText
            .Replace("\"מלבן\"", "\"rectangle\"")
            .Replace("\"עיגול\"", "\"circle\"")
            .Replace("\"קו\"", "\"line\"")
            .Replace("\"משולש\"", "\"triangle\"")
            .Replace("שחור", "black")
            .Replace("אדום", "red")
            .Replace("ירוק", "green")
            .Replace("כחול", "blue")
            .Replace("צהוב", "yellow");
        if (string.IsNullOrEmpty(generatedText))
        {
            return BadRequest("התוכן שנוצר ריק.");
        }

        try
        {
            // ה-generatedText אמור להכיל את פקודות הציור בפורמט JSON.
            // נסה לנתח אותו כמסמך JSON.
            // ניקוי במידה והטקסט עטוף ב-```json ... ``` 
            var cleanedJson = generatedText
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            try
            {
                var commands = JsonDocument.Parse(cleanedJson);
                return Ok(commands.RootElement);
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"שגיאת ניתוח JSON: {ex.Message}");
                Console.WriteLine($"ניסיון לנתח (אחרי ניקוי): {cleanedJson}");
                return BadRequest("לא ניתן לנתח פקודות ציור מהתגובה של Gemini (גם אחרי ניקוי). ודא שהמודל מחזיר JSON חוקי.");
            }

        }
        catch (JsonException ex)
        {
            Console.WriteLine($"שגיאת ניתוח JSON: {ex.Message}");
            Console.WriteLine($"ניסיון לנתח: {generatedText}");
            return BadRequest("לא ניתן לנתח פקודות ציור מהתגובה של Gemini. הטקסט שנוצר עשוי להיות JSON לא חוקי.");
        }
    }
}

public class PromptRequest
{
    public string Prompt { get; set; } = string.Empty;
}