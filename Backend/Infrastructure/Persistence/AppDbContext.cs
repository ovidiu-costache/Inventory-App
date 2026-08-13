using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Category> Categories { get; set; }
    public DbSet<MovementType> MovementTypes { get; set; }
    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }
    public DbSet<LowStockNotification> LowStockNotifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>().ToTable("Category");
        modelBuilder.Entity<MovementType>().ToTable("MovementType");
        modelBuilder.Entity<AppUser>().ToTable("AppUser");
        modelBuilder.Entity<Product>().ToTable("Product");
        modelBuilder.Entity<StockMovement>().ToTable("StockMovement");
        modelBuilder.Entity<LowStockNotification>().ToTable("LowStockNotification");
    }
}
