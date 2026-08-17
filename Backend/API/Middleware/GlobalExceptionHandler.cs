using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        // Default: Server error
        var statusCode = StatusCodes.Status500InternalServerError;
        var title = "A server error occurred while processing the request.";
        var detail = exception.Message;

        switch (exception)
        {
            // Stored Procedures
            case SqlException ex when ex.Number == 50001:
                statusCode = StatusCodes.Status404NotFound;
                title = "The requested resource could not be found.";
                break;
            case SqlException ex when ex.Number == 50002:
                statusCode = StatusCodes.Status400BadRequest;
                title = "One or more validation errors occurred.";
                break;
            case SqlException ex when ex.Number == 50003:
                statusCode = StatusCodes.Status409Conflict;
                title = "The request could not be completed due to a conflict.";
                break;
            case SqlException ex when ex.Number == 1222:
                statusCode = StatusCodes.Status409Conflict;
                title = "The resource is currently locked by another process.";
                detail = "The product is currently being modified by another user. Please try again in a moment.";
                break;
            case SqlException ex when ex.Number is 50004 or 50005 or 50006 or 50007:
                statusCode = StatusCodes.Status400BadRequest;
                title = "One or more validation errors occurred.";
                break;

            // Standard Errors
            case KeyNotFoundException:
                statusCode = StatusCodes.Status404NotFound;
                title = "The requested resource could not be found.";
                break;
            case ArgumentException:
                statusCode = StatusCodes.Status400BadRequest;
                title = "One or more validation errors occurred.";
                break;
            case InvalidOperationException:
                statusCode = StatusCodes.Status409Conflict;
                title = "The request could not be completed due to a conflict.";
                break;
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}