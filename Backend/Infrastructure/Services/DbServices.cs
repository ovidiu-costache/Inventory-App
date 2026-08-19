using Application.DTOs;
using Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class DbServices {
    private readonly AppDbContext _db;

    public DbServices(AppDbContext db) {
        _db = db;
    }

    public async Task<IReadOnlyList<Domain.Entities.Category>> GetCategoriesAsync() {
        return await _db.Categories.OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<(IReadOnlyList<ProductDto>, bool)> GetProductsPageAsync(
        int page, int pageSize, bool active, int? categoryId, string? stockState, 
        decimal? minPrice, decimal? maxPrice, string? search, string? sortBy, string sortDir)
    {
        // SQL sp_GetProductsPage
        var items = await _db.Database.SqlQueryRaw<ProductDto>(
                @"EXEC sp_GetProductsPage
                    @Page, @PageSize, @Active, @CategoryId, @StockState,
                    @MinPrice, @MaxPrice, @Search, @SortBy, @SortDir",
                new SqlParameter("@Page", page),
                new SqlParameter("@PageSize", pageSize),
                new SqlParameter("@Active", active),
                new SqlParameter("@CategoryId", (object?)categoryId ?? DBNull.Value),
                new SqlParameter("@StockState", (object?)stockState ?? DBNull.Value),
                new SqlParameter("@MinPrice", (object?)minPrice ?? DBNull.Value),
                new SqlParameter("@MaxPrice", (object?)maxPrice ?? DBNull.Value),
                new SqlParameter("@Search", (object?)search ?? DBNull.Value),
                new SqlParameter("@SortBy", (object?)sortBy ?? DBNull.Value),
                new SqlParameter("@SortDir", sortDir))
            .ToListAsync();

        bool hasMore = items.Count > pageSize;
        if (items.Count > pageSize) {
            items.RemoveAt(items.Count - 1);
        }
        return (items, hasMore);
    }

    public async Task<ProductDto?> GetProductAsync(int id)
    {
        // SQL sp_GetProduct
        var results = await _db.Database.SqlQuery<ProductDto>(
                $"EXEC sp_GetProduct @Id = {id}")
            .ToListAsync();

        return results.FirstOrDefault();
    }

    public async Task<(IReadOnlyList<StockMovementDto>, bool)> GetMovementsPageAsync(
        int page, int pageSize, int? productId, string? movementType, DateTime? fromDate, DateTime? toDate,
        int? createdByUserId, string? createdBy, string sortBy, string sortDir)
    {
        // SQL sp_GetMovementsPage
        var items = await _db.Database.SqlQueryRaw<StockMovementDto>(
                @"EXEC sp_GetMovementsPage
                    @Page, @PageSize, @ProductId, @MovementType, @FromDate, @ToDate,
                    @CreatedByUserId, @SortBy, @SortDir",
                new SqlParameter("@Page", page),
                new SqlParameter("@PageSize", pageSize),
                new SqlParameter("@ProductId", (object?)productId ?? DBNull.Value),
                new SqlParameter("@MovementType", (object?)movementType ?? DBNull.Value),
                new SqlParameter("@FromDate", (object?)fromDate ?? DBNull.Value),
                new SqlParameter("@ToDate", (object?)toDate ?? DBNull.Value),
                new SqlParameter("@CreatedByUserId", (object?)createdByUserId ?? DBNull.Value),
                new SqlParameter("@SortBy", sortBy),
                new SqlParameter("@SortDir", sortDir))
            .ToListAsync();

        bool hasMore = items.Count > pageSize;
        if (items.Count > pageSize) {
            items.RemoveAt(items.Count - 1);
        }
        return (items, hasMore);
    }

    public async Task<IReadOnlyList<StockMovementDto>> GetMovementsForProductAsync(int productId)
    {
        // SQL sp_GetMovementsForProduct
        return await _db.Database.SqlQuery<StockMovementDto>(
                $"EXEC sp_GetMovementsForProduct @ProductId = {productId}")
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LowStockNotificationDto>> GetNotificationsAsync()
    {
        // SQL sp_GetNotifications
        return await _db.Database.SqlQuery<LowStockNotificationDto>(
                $"EXEC sp_GetNotifications")
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LowStockNotificationDto>> GetNotificationsForProductAsync(int productId)
    {
        // SQL sp_GetNotificationsForProduct
        return await _db.Database.SqlQuery<LowStockNotificationDto>(
                $"EXEC sp_GetNotificationsForProduct @ProductId = {productId}")
            .ToListAsync();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        // Basic validation
        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            throw new ArgumentException("Code is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException("Name is required.");
        }

        if (dto.CategoryId <= 0)
        {
            throw new ArgumentException("A valid CategoryId is required.");
        }

        // SQL sp_InsertProduct
        var results = await _db.Database.SqlQueryRaw<ProductDto>(
                "EXEC sp_InsertProduct @Code, @Name, @Description, @CategoryId, @UnitOfMeasure, @Price, @ReorderThreshold",
                new SqlParameter("@Code", dto.Code),
                new SqlParameter("@Name", dto.Name),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@CategoryId", dto.CategoryId),
                new SqlParameter("@UnitOfMeasure", dto.UnitOfMeasure),
                new SqlParameter("@Price", dto.Price),
                new SqlParameter("@ReorderThreshold", dto.ReorderThreshold))
            .ToListAsync();

        var result = results.FirstOrDefault();

        if (result == null)
        {
            throw new Exception("Failed to create product.");
        }

        return result;
    }

    public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        // Basic validation
        if (id <= 0)
        {
            throw new ArgumentException("Invalid product ID.");
        }

        // SQL sp_UpdateProduct
        var results = await _db.Database.SqlQueryRaw<ProductDto>(
                "EXEC sp_UpdateProduct @Id, @Code, @Name, @Description, @CategoryId, @UnitOfMeasure, @Price, @ReorderThreshold",
                new SqlParameter("@Id", id),
                new SqlParameter("@Code", (object?)dto.Code ?? DBNull.Value),
                new SqlParameter("@Name", (object?)dto.Name ?? DBNull.Value),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@CategoryId", (object?)dto.CategoryId ?? DBNull.Value),
                new SqlParameter("@UnitOfMeasure", (object?)dto.UnitOfMeasure ?? DBNull.Value),
                new SqlParameter("@Price", (object?)dto.Price ?? DBNull.Value),
                new SqlParameter("@ReorderThreshold", (object?)dto.ReorderThreshold ?? DBNull.Value))
            .ToListAsync();

        var result = results.FirstOrDefault();

        if (result == null)
        {
            throw new Exception("Failed to update product.");
        }

        return result;
    }

    public async Task DeleteProductAsync(int id)
    {
        // Basic validation
        if (id <= 0)
        {
            throw new ArgumentException("Invalid product ID.");
        }

        // SQL sp_SoftDeleteProduct
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC sp_SoftDeleteProduct @Id",
            new SqlParameter("@Id", id));
    }

    public async Task RestoreProductAsync(int id)
    {
        // Basic validation
        if (id <= 0)
        {
            throw new ArgumentException("Invalid product ID.");
        }

        // SQL sp_RestoreProduct
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC sp_RestoreProduct @Id",
            new SqlParameter("@Id", id));
    }

    public async Task<StockMovementDto> CreateStockMovementAsync(CreateStockMovementDto dto)
    {
        // Basic validation
        if (dto.ProductId <= 0)
        {
            throw new ArgumentException("Invalid product ID.");
        }

        if (dto.Quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.");
        }

        // SQL sp_InsertStockMovement
        var results = await _db.Database.SqlQueryRaw<StockMovementDto>(
                "EXEC sp_InsertStockMovement @ProductId, @MovementTypeId, @Quantity, @Reason, @ReferenceCode, @CreatedByUserId",
                new SqlParameter("@ProductId", dto.ProductId),
                new SqlParameter("@MovementTypeId", (int)dto.MovementTypeId),
                new SqlParameter("@Quantity", dto.Quantity),
                new SqlParameter("@Reason", (object?)dto.Reason ?? DBNull.Value),
                new SqlParameter("@ReferenceCode", (object?)dto.ReferenceCode ?? DBNull.Value),
                new SqlParameter("@CreatedByUserId", dto.CreatedByUserId))
            .ToListAsync();

        var result = results.FirstOrDefault();

        if (result == null)
        {
            throw new Exception("Failed to register stock movement.");
        }

        return result;
    }

    public async Task ResolveNotificationAsync(int id)
    {
        // Basic validation
        if (id <= 0)
        {
            throw new ArgumentException("Invalid notification ID.");
        }

        // SQL sp_ResolveNotification
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC sp_ResolveNotification @Id",
            new SqlParameter("@Id", id));
    }
}
