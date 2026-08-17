using Infrastructure.Services;

namespace API.Endpoints
{
    public static class NotificationEndpoints
    {
        public static RouteGroupBuilder MapNotificationEndpoints(this RouteGroupBuilder group)
        {
            // GET /api/notifications
            group.MapGet("/", async (DbServices dbServices) =>
            {
                var notifications = await dbServices.GetNotificationsAsync();
                return Results.Ok(notifications);
            });
            
            // GET /api/notifications/{productId}
            group.MapGet("/{productId:int}", async (int productId, DbServices dbServices) =>
            {
                var notifications = await dbServices.GetNotificationsForProductAsync(productId);
                return Results.Ok(notifications);
            });

            // PATCH /api/notifications/{id}/resolve
            group.MapPatch("/{id:int}/resolve", async (int id, DbServices dbServices) =>
            {
                await dbServices.ResolveNotificationAsync(id);
                return Results.NoContent();
            });

            return group;
        }
    }
}
