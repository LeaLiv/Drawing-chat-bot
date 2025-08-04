// Data/Drawing.cs
using System.ComponentModel.DataAnnotations;

public class Drawing
{
    [Key]
    public string Id { get; set; } = string.Empty; // אתחול

    public string Name { get; set; } = string.Empty; // אתחול

    public string DrawingDataJson { get; set; } = string.Empty; // אתחול

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string UserId { get; set; } = string.Empty; // אתחול

    // שימוש בסימן קריאה כדי להגיד לקומפיילר: "סמוך עליי, EF יטפל בזה"
    public User User { get; set; } = null!; 
}