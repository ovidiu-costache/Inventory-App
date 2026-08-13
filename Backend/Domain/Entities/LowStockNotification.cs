namespace Domain.Entities;

public class LowStockNotification
{
    public int Id { get; set; }
    public DateTime TriggeredAt { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }

    // FK for Product
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}