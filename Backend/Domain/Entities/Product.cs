namespace Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal ReorderThreshold { get; set; }
    public bool IsActive { get; set; }

    // FK for Category
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}