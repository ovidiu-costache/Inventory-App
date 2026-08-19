using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Infrastructure.Services;
using API.Endpoints;
using API.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<DbServices>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors("AllowAngular");

app.UseSwagger();
app.UseSwaggerUI();

// Products
var productsGroup = app.MapGroup("/api/products");
productsGroup.MapProductReadEndpoints();
productsGroup.MapProductWriteEndpoints();

// Categories
var categoriesGroup = app.MapGroup("/api/categories");
categoriesGroup.MapCategoryEndpoints();

// Stock Movements
var stockMovementsGroup = app.MapGroup("/api/stock-movements");
stockMovementsGroup.MapStockMovementReadEndpoints();
stockMovementsGroup.MapStockMovementWriteEndpoints();

// Notifications
var notificationsGroup = app.MapGroup("/api/notifications");
notificationsGroup.MapNotificationEndpoints();

app.Run();
