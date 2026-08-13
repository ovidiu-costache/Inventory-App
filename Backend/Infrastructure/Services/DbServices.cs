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
    
    // TO DO: call stored procedures
}
