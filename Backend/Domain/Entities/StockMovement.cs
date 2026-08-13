namespace Domain.Entities;

public class StockMovement
{
    public int Id { get; set; }
    public decimal Quantity { get; set; }
    public decimal ResultingStock { get; set; }
    public string? Reason { get; set; }
    public string? ReferenceCode { get; set; }
    public DateTime CreatedAt { get; set; }

    // FK for Product
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // FK for MovementType
    public byte MovementTypeId { get; set; }
    public MovementType MovementType { get; set; } = null!;

    // FK for AppUser
    public int CreatedByUserId { get; set; }
    public AppUser CreatedByUser { get; set; } = null!;
}