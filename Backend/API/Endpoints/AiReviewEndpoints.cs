using Application.DTOs;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Endpoints
{
    public static class AiReviewEndpoints
    {
        public static RouteGroupBuilder MapAiReviewEndpoints(this RouteGroupBuilder group)
        {
            group.MapPost("/review-adjustment", async ([FromBody] AiReviewRequestDto dto, AiReviewService aiService) =>
            {
                var result = await aiService.EvaluateAdjustmentAsync(dto);
                return Results.Ok(result);
            });

            return group;
        }
    }
}
