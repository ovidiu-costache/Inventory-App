using Application.DTOs;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/login", async ([FromBody] LoginRequestDto dto, DbServices db) =>
        {
            var user = await db.LoginAsync(dto);
            return Results.Ok(user);
        });

        group.MapPost("/signup", async ([FromBody] SignUpRequestDto dto, DbServices db) =>
        {
            var user = await db.SignUpAsync(dto);
            return Results.Ok(user);
        });

        group.MapGet("/users", async (DbServices db) =>
        {
            var users = await db.GetAllUsersAsync();
            return Results.Ok(users);
        });

        return group;
    }
}
