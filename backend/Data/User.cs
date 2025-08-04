// Data/User.cs
using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public string Id { get; set; } = string.Empty; // אתחול

    public string Name { get; set; } = string.Empty; // אתחול

    public ICollection<Drawing> Drawings { get; set; } = new List<Drawing>();
}