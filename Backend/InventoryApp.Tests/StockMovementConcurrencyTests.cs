using Application.DTOs;
using Domain.Entities;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace InventoryApp.Tests
{
    public class StockMovementConcurrencyTests
    {
        private DbServices CreateDbService()
        {
            // Add password if needed
            var connectionString = "Server=localhost,1433;Database=InventoryAppDb;User Id=sa;Password=<YOUR_PASSWORD_HERE>;TrustServerCertificate=True;";

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer(connectionString)
                .Options;

            var context = new AppDbContext(options);

            return new DbServices(context);
        }

        [Fact]
        public async Task CreateStockMovement_ConcurrentRequests_ShouldPreventLostUpdates()
        {
            // Create two services to simulate two different users
            var service1 = CreateDbService();
            var service2 = CreateDbService();

            var dto1 = new CreateStockMovementDto(
                ProductId: 1,
                MovementTypeId: MovementTypeEnum.OUT,
                Quantity: 5,
                Reason: "User 1 concurenta",
                ReferenceCode: "TEST-01",
                CreatedByUserId: 1);

            var dto2 = new CreateStockMovementDto(
                ProductId: 1,
                MovementTypeId: MovementTypeEnum.OUT,
                Quantity: 5,
                Reason: "User 2 concurenta",
                ReferenceCode: "TEST-02",
                CreatedByUserId: 2);

            // Start both requests
            var task1 = service1.CreateStockMovementAsync(dto1);
            var task2 = service2.CreateStockMovementAsync(dto2);

            Exception exception1 = null;
            Exception exception2 = null;

            try
            {
                await task1;
            }
            catch (Exception ex)
            {
                exception1 = ex;
            }

            try
            {
                await task2;
            }
            catch (Exception ex)
            {
                exception2 = ex;
            }

            bool task1Succeeded = task1.IsCompletedSuccessfully;
            bool task2Succeeded = task2.IsCompletedSuccessfully;

            // Only one request should succeed
            Assert.True(
                (task1Succeeded && !task2Succeeded) ||
                (!task1Succeeded && task2Succeeded));

            Exception thrownException;

            if (exception1 != null)
            {
                thrownException = exception1;
            }
            else
            {
                thrownException = exception2;
            }

            Assert.NotNull(thrownException);

            string exceptionMessage;

            if (thrownException.InnerException != null)
            {
                exceptionMessage = thrownException.InnerException.Message;
            }
            else
            {
                exceptionMessage = thrownException.Message;
            }

            Assert.Contains("Lock request time out period exceeded", exceptionMessage);
        }
    }
}