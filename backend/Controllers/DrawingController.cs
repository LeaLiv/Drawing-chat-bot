using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

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
        var apiKey = _configuration["GoogleAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            return StatusCode(500, "GoogleAI:ApiKey is not configured.");
        }

        var httpClient = _httpClientFactory.CreateClient();
        var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";

        var systemInstruction = BuildAdvancedPrompt(request.Prompt);

        var body = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = systemInstruction } } }
            },
            generationConfig = new
            {
                temperature = 0.2, // טמפרטורה נמוכה יותר למבנה צפוי
                // --- זו התוספת החשובה ביותר: אכיפת פלט JSON ---
                responseMimeType = "application/json" 
            }
        };

        var jsonBody = JsonSerializer.Serialize(body);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync(geminiApiUrl, content);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            // החזרת השגיאה המלאה מ-Gemini עוזרת מאוד לדיבוג
            return StatusCode((int)response.StatusCode, $"Error from Gemini API: {responseJson}");
        }

        // --- פיענוח התשובה ---
        // מכיוון שאנו ב-JSON Mode, אין צורך בבדיקות וניקיונות מסורבלים
        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            JsonElement root = doc.RootElement;

            if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var textContent = candidates[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                // הטקסט הוא כבר מחרוזת JSON נקייה, נפענח אותה ונחזיר את התוכן
                using var finalJsonDoc = JsonDocument.Parse(textContent!);
                return Ok(finalJsonDoc.RootElement.Clone());
            }
            
            return BadRequest("Invalid response structure from Gemini.");
        }
        catch (JsonException ex)
        {
            return BadRequest($"Failed to parse JSON response: {ex.Message}. Response was: {responseJson}");
        }
    }

    /// <summary>
    /// בונה את הפרומפט המתקדם עבור מודל השפה.
    /// </summary>
    private string BuildAdvancedPrompt(string userPrompt)
    {
        // כאן אנו מסבירים למודל בדיוק מה אנחנו רוצים, כולל דוגמה (Few-shot prompt)
        return $@"
You are a helpful assistant that translates natural language into a structured JSON object for a drawing application.

Your task is to convert the user's request into a JSON object that strictly follows this schema:
- The root object must contain 'canvasWidth' and 'canvasHeight' (use 500 for both).
- It must contain an 'objects' array.
- Each item in 'objects' is a logical group (like 'house' or 'person') and has a 'type' and a 'components' array.
- Each item in 'components' is a primitive shape object.

The available shapes and their properties are:
1.  {{ ""shape"": ""rectangle"", ""color"": ""(css color)"", ""x"": (number), ""y"": (number), ""width"": (number), ""height"": (number) }}
2.  {{ ""shape"": ""circle"", ""color"": ""(css color)"", ""cx"": (number), ""cy"": (number), ""radius"": (number) }}
3.  {{ ""shape"": ""line"", ""color"": ""(css color)"", ""x1"": (number), ""y1"": (number), ""x2"": (number), ""y2"": (number) }}
4.  {{ ""shape"": ""triangle"", ""color"": ""(css color)"", ""points"": [{{""x"":(number),""y"":(number)}}, {{""x"":(number),""y"":(number)}}, {{""x"":(number),""y"":(number)}}] }}

IMPORTANT RULES:
- The output MUST be a single, raw JSON object. Do NOT wrap it in markdown like ```json.
- All keywords (""shape"", ""color"", etc.) and all color names must be in English.
- Every shape must have explicit coordinates.
-please locate the object in the rational location (for example sky only in small part of the top, grass or grounde only in small part of bottom,person in the side, tree in other side etc. )

EXAMPLE:
User request: ""A simple house with a sun next to it""
Your JSON output:
{{
  ""canvasWidth"": 500,
  ""canvasHeight"": 500,
  ""objects"": [
    {{
      ""type"": ""house"",
      ""components"": [
        {{ ""shape"": ""rectangle"", ""color"": ""brown"", ""x"": 150, ""y"": 250, ""width"": 200, ""height"": 150 }},
        {{ ""shape"": ""triangle"", ""color"": ""red"", ""points"": [{{""x"":150,""y"":250}},{{""x"":350,""y"":250}},{{""x"":250,""y"":150}}] }}
      ]
    }},
    {{
      ""type"": ""sun"",
      ""components"": [
        {{ ""shape"": ""circle"", ""color"": ""gold"", ""cx"": 400, ""cy"": 100, ""radius"": 40 }}
      ]
    }}
  ]
}}

Now, process the following user request:
""{userPrompt}""
";
    }
}

public class PromptRequest
{
    public string Prompt { get; set; } = string.Empty;
}