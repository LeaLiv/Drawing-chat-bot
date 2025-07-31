using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;
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
            return StatusCode(500, "GoogleAI:ApiKey לא הוגדר.");
        }

        var httpClient = _httpClientFactory.CreateClient();

        // ✨ Prompt מותאם שדורש מבנה תואם ל־DrawingCommand
   var translatedPrompt = $@"You are a drawing assistant bot. Based on the following Hebrew instruction, generate a JSON array of drawing commands. 

Each command must be a flat object with these fields:

- ""type"": one of ""circle"", ""rectangle"", ""triangle"", ""line""
- shape-specific required fields:
   * circle: ""x"", ""y"", ""radius""
   * rectangle: ""x"", ""y"", ""width"", ""height""
   * triangle: ""x"", ""y"", ""points"" (array of 3 {{x,y}})
   * line: ""x"", ""y"", ""x2"", ""y2""
- ""color"": string (e.g. ""black"", ""#FF0000"")
- ""filled"": true or false

DO NOT use a 'dimensions' field or 'ellipse'. Use only flat objects. Return only the JSON array.

Hebrew instruction: {request.Prompt}";



        var body = new
        {
            contents = new[] {
                new {
                    role = "user",
                    parts = new[] {
                        new { text = translatedPrompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.3
            }
        };

        var jsonBody = JsonSerializer.Serialize(body);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        Console.WriteLine($"request body Gemini:\n{jsonBody}");

        var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b-latest:generateContent?key={apiKey}";
        var response = await httpClient.PostAsync(geminiApiUrl, content);
        var json = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"response Gemini:\n{json}");

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, $"error from Gemini API: {json}");
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates) ||
                candidates.ValueKind != JsonValueKind.Array ||
                candidates.GetArrayLength() == 0)
            {
                return BadRequest("No candidates found in the Gemini response.");
            }

            var firstCandidate = candidates[0];
            if (!firstCandidate.TryGetProperty("content", out var candidateContent) ||
                !candidateContent.TryGetProperty("parts", out var parts) ||
                parts.ValueKind != JsonValueKind.Array ||
                parts.GetArrayLength() == 0)
            {
                return BadRequest("No content parts found in the Gemini response.");
            }

            var generatedText = parts[0].TryGetProperty("text", out var textElement) ? textElement.GetString() : string.Empty;
            if (string.IsNullOrWhiteSpace(generatedText))
            {
                return BadRequest("The generated content is empty.");
            }

            // ✂️ ניקוי טקסט מג'מיני (```json ... ```)
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
                Console.WriteLine($"❌ JSON parse error: {ex.Message}");
                Console.WriteLine($"⛔ cleanedJson: {cleanedJson}");
                return BadRequest("Failed to parse drawing commands from Gemini.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Unexpected error: {ex.Message}");
            return StatusCode(500, "Unexpected error while parsing Gemini response.");
        }
    }
}

public class PromptRequest
{
    public string Prompt { get; set; } = string.Empty;
}
