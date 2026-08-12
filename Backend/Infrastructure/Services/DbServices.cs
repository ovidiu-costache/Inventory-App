using Application.DTOs;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace Infrastructure.Services;

public class DbServices {
    private readonly AppDbContext _db;

    public DbServices(AppDbContext db) {
        _db = db;
    }
    
    public async Task<TicketDto> CreateAsync(CreateTicketDto dto) {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title is required.");
        if (dto.Title.Length > 100)
            throw new ArgumentException("Title must be less than 100 characters.");
        if (dto.Description?.Length > 1000)
            throw new ArgumentException("Description must be less than 1000 characters.");

        var results = await _db.Database.SqlQueryRaw<TicketDto>(
                "EXEC sp_CreateTicket @Title, @Description, @PriorityId",
                new SqlParameter("@Title", dto.Title),
                new SqlParameter("@Description", dto.Description),
                new SqlParameter("@PriorityId", dto.PriorityId))
            .ToListAsync();

        var result = results.FirstOrDefault();
        if (result == null)
            throw new Exception("Failed to create ticket");

        return result;
    }

    public async Task<TicketDto> UpdateAsync(string ticketKey, UpdateTicketDto dto) {
        if (string.IsNullOrWhiteSpace(ticketKey))
            throw new ArgumentException("TicketKey is required.");
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title is required.");
        
        var results = await _db.Database.SqlQueryRaw<TicketDto>(
                "EXEC sp_UpdateTicket @TicketKey, @Title, @Description, @StatusId, @PriorityId",
                new SqlParameter("@TicketKey", ticketKey),
                new SqlParameter("@Title", (object?)dto.Title ?? DBNull.Value),
                new SqlParameter("@Description", (object?)dto.Description ?? DBNull.Value),
                new SqlParameter("@StatusId", (object?)dto.StatusId ?? DBNull.Value),
                new SqlParameter("@PriorityId", (object?)dto.PriorityId ?? DBNull.Value))
            .ToListAsync();
    
        var result = results.FirstOrDefault();
        if (result == null)
            throw new Exception("Failed to update ticket");
        return result;
    }

    public async Task<List<TicketDto>> GetAllAsync()
    {
        // SQL View
        return await _db.Database
            .SqlQuery<TicketDto>($"SELECT * FROM vw_TicketDetails")
            .ToListAsync();
    }

    public async Task<TicketDto?> GetTicketAsync(string ticketKey)
    {
        // SQL sp_GetTicketByKey
        var tickets = await _db.Database
            .SqlQuery<TicketDto>($"EXEC sp_GetTicketByKey @TicketKey = {ticketKey}")
            .ToListAsync();

        return tickets.FirstOrDefault();
    }

    public async Task DeleteAsync(string ticketKey)
    {
        await _db.Database.ExecuteSqlRawAsync("EXEC sp_DeleteTicket @TicketKey",
            new SqlParameter("@TicketKey", ticketKey));
    }

    public async Task<List<TicketAuditDto>> GetAuditAsync(string ticketKey)
    {
        // SQL sp_GetTicketAuditLog
        return await _db.Database
            .SqlQuery<TicketAuditDto>($"EXEC sp_GetTicketAuditLog @TicketKey = {ticketKey}")
            .ToListAsync();
    }
    
    public async Task<List<TicketMixedStatsDto>> GetTicketMixedStatsAsync()
    {
        return await _db.Database
            .SqlQuery<TicketMixedStatsDto>($"EXEC sp_GetTicketMixedStats")
            .ToListAsync();
    }

    public async Task<List<TicketStatusCountsDto>> GetTicketStatusCountsAsync()
    {
        return await _db.Database
            .SqlQuery<TicketStatusCountsDto>($"EXEC sp_GetTicketStatusCounts")
            .ToListAsync();
    }
}
