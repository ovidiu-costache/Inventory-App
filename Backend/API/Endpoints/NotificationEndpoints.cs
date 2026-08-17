using Infrastructure.Services;

namespace API.Endpoints
{
    public static class NotificationEndpoints
    {
        public static RouteGroupBuilder MapNotificationEndpoints(this RouteGroupBuilder group)
        {
            // TO DO: GET /api/notifications

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
