// Controllers/DrawingsController.cs
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using System.Linq;

// אובייקט לקבלת הבקשה מהלקוח
public class SaveDrawingRequest
{
    public string DrawingId { get; set; } = string.Empty;
    public string DrawingName { get; set; } = string.Empty;
    public object? DrawingData { get; set; }
    public string UserId { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class DrawingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DrawingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // --- פונקציית השמירה הקיימת (ללא שינוי) ---
    [HttpPost]
    public async Task<IActionResult> SaveDrawing([FromBody] SaveDrawingRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.DrawingId) || string.IsNullOrEmpty(request.UserId))
        {
            return BadRequest("Invalid data.");
        }
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
        {
            user = new User { Id = request.UserId, Name = $"User {request.UserId}" };
            _context.Users.Add(user);
        }
        var existingDrawing = await _context.Drawings.FindAsync(request.DrawingId);
        if (existingDrawing == null)
        {
            var newDrawing = new Drawing {
                Id = request.DrawingId,
                Name = request.DrawingName,
                DrawingDataJson = JsonSerializer.Serialize(request.DrawingData),
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Drawings.Add(newDrawing);
        }
        else
        {
            existingDrawing.Name = request.DrawingName;
            existingDrawing.DrawingDataJson = JsonSerializer.Serialize(request.DrawingData);
            existingDrawing.UpdatedAt = DateTime.UtcNow;
            _context.Drawings.Update(existingDrawing);
        }
        await _context.SaveChangesAsync();
        return Ok(new { message = "Drawing saved!" });
    }

    // --- 🔽 פונקציה חדשה: שליפת כל הציורים של משתמש 🔽 ---
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserDrawings(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID is required.");
        }

        var drawings = await _context.Drawings
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UpdatedAt)
            // נחזיר רק את המידע הדרוש לרשימה, לא את כל ה-JSON
            .Select(d => new { d.Id, d.Name, d.UpdatedAt }) 
            .ToListAsync();

        return Ok(drawings);
    }

    // --- 🔽 פונקציה חדשה: טעינת ציור ספציפי לפי מזהה 🔽 ---
    [HttpGet("{drawingId}")]
    public async Task<IActionResult> GetDrawingById(string drawingId)
    {
        if (string.IsNullOrEmpty(drawingId))
        {
            return BadRequest("Drawing ID is required.");
        }

        var drawing = await _context.Drawings.FindAsync(drawingId);

        if (drawing == null)
        {
            return NotFound();
        }

        // נחזיר את ה-JSON המלא של הציור
        return Ok(JsonSerializer.Deserialize<object>(drawing.DrawingDataJson));
    }
}
// "ApiKey": "AIzaSyAWRF3GRDRRpFCeCSV0lJlGkxVjHHnPE1c",
