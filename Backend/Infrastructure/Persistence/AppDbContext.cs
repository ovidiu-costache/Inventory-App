using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Application.DTOs;

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

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Product>()
            .Property(p => p.CurrentStock)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Product>()
            .Property(p => p.ReorderThreshold)
            .HasPrecision(18, 2);

        modelBuilder.Entity<StockMovement>()
            .Property(m => m.Quantity)
            .HasPrecision(18, 2);
        modelBuilder.Entity<StockMovement>()
            .Property(m => m.ResultingStock)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProductDto>().HasNoKey();
        modelBuilder.Entity<ProductDto>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
        modelBuilder.Entity<ProductDto>()
            .Property(p => p.CurrentStock)
            .HasPrecision(18, 2);
        modelBuilder.Entity<ProductDto>()
            .Property(p => p.ReorderThreshold)
            .HasPrecision(18, 2);

        modelBuilder.Entity<StockMovementDto>().HasNoKey();
        modelBuilder.Entity<StockMovementDto>()
            .Property(m => m.Quantity)
            .HasPrecision(18, 2);
        modelBuilder.Entity<StockMovementDto>()
            .Property(m => m.ResultingStock)
            .HasPrecision(18, 2);
    }
}
