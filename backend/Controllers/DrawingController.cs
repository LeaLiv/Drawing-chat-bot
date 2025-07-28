using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;

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
        var apiKey = _configuration["OpenAI:ApiKey"];
        var httpClient = _httpClientFactory.CreateClient();

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var body = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "You are a drawing bot. Return only an array of JSON drawing commands (circle, rect, line), each with color and properties." },
                new { role = "user", content = request.Prompt }
            },
            temperature = 0.3
        };

        var response = await httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", body);
        var json = await response.Content.ReadAsStringAsync();
Console.WriteLine(json);
        using var doc = JsonDocument.Parse(json);
        var content = doc.RootElement
                         .GetProperty("choices")[0]
                         .GetProperty("message")
                         .GetProperty("content")
                         .GetString();

        try
        {
            var commands = JsonDocument.Parse(content);
            return Ok(commands.RootElement);
        }
        catch
        {
            return BadRequest("Could not parse drawing commands.");
        }
    }
}

public class PromptRequest
{
    public string Prompt { get; set; } = string.Empty;
}
