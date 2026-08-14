using Application.DTOs;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Services;

public class DbServices {
    private readonly AppDbContext _db;

    public DbServices(AppDbContext db)
    {
        _db = db;
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
}
