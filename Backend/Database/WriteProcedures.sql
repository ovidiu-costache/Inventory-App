USE InventoryAppDb;
GO

DROP PROCEDURE IF EXISTS sp_InsertCategory;
GO
CREATE PROCEDURE sp_InsertCategory
    @Name NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Category name must be unique
        IF EXISTS (SELECT 1 FROM Category WHERE Name = @Name)
            THROW 50002, 'Category name already exists.', 1;

        BEGIN TRAN;
            INSERT INTO Category (Name)
            VALUES (@Name);
            
            DECLARE @NewId INT = SCOPE_IDENTITY();
        COMMIT TRAN;

        SELECT Id, Name FROM Category WHERE Id = @NewId;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

DROP PROCEDURE IF EXISTS sp_InsertProduct;
GO
CREATE PROCEDURE sp_InsertProduct
    @Code NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @CategoryId INT,
    @UnitOfMeasure NVARCHAR(20),
    @Price DECIMAL(18,2),
    @ReorderThreshold DECIMAL(18,2)
AS
BEGIN
    -- Prevent extra result sets from interfering with SELECT statements
    SET NOCOUNT ON; 

    BEGIN TRY
        -- Product code must be unique (50003 maps to HTTP 409 Conflict)
        IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code)
            THROW 50003, 'Product code already exists. It must be unique.', 1;

        -- Category must be valid (50001 maps to HTTP 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM Category WHERE Id = @CategoryId)
            THROW 50001, 'The specified category does not exist.', 1;

        -- Set UnitOfMeasure to 'pieces' if not provided
        SET @UnitOfMeasure = ISNULL(TRIM(@UnitOfMeasure), 'pieces');

        -- Price cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @Price < 0
            THROW 50002, 'Price cannot be negative.', 1;

        -- Reorder threshold cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @ReorderThreshold < 0
            THROW 50002, 'Reorder threshold cannot be negative.', 1;

        BEGIN TRAN;
            INSERT INTO Product (Code, Name, Description, CategoryId, UnitOfMeasure, Price, CurrentStock, ReorderThreshold, IsActive)
            VALUES (@Code, @Name, @Description, @CategoryId, @UnitOfMeasure, @Price, 0, @ReorderThreshold, 1);
            
            DECLARE @NewProductId INT = SCOPE_IDENTITY();
        COMMIT TRAN;
        
        SELECT
            p.Id,
            p.Code,
            p.Name,
            p.Description,
            p.UnitOfMeasure,
            p.Price,
            p.CurrentStock,
            p.ReorderThreshold,
            p.IsActive,
            c.Name AS Category
        FROM Product p
        JOIN Category c ON c.Id = p.CategoryId
        WHERE p.Id = @NewProductId;
    
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

DROP PROCEDURE IF EXISTS sp_UpdateProduct;
GO
CREATE PROCEDURE sp_UpdateProduct
    @Id INT,
    @Code NVARCHAR(50) = NULL,
    @Name NVARCHAR(100) = NULL,
    @Description NVARCHAR(500) = NULL,
    @CategoryId INT = NULL,
    @UnitOfMeasure NVARCHAR(20) = NULL,
    @Price DECIMAL(18,2) = NULL,
    @ReorderThreshold DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON; 

    BEGIN TRY
        -- Product must exist (50001 maps to HTTP 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM Product WHERE Id = @Id)
            THROW 50001, 'Product not found.', 1;

        -- Product code must be unique, excluding current product (50003 maps to HTTP 409 Conflict)
        IF @Code IS NOT NULL AND EXISTS (SELECT 1 FROM Product WHERE Code = @Code AND Id != @Id)
            THROW 50003, 'Product code already exists. It must be unique.', 1;

        -- Category must be valid (50001 maps to HTTP 404 Not Found)
        IF @CategoryId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Category WHERE Id = @CategoryId)
            THROW 50001, 'The specified category does not exist.', 1;

        -- Set UnitOfMeasure to 'pieces' if not provided
        IF @UnitOfMeasure IS NULL OR TRIM(@UnitOfMeasure) = ''
            SET @UnitOfMeasure = 'pieces';

        -- Price cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @Price IS NOT NULL AND @Price < 0
            THROW 50002, 'Price cannot be negative.', 1;

        -- Reorder threshold cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @ReorderThreshold IS NOT NULL AND @ReorderThreshold < 0
            THROW 50002, 'Reorder threshold cannot be negative.', 1;

        BEGIN TRAN;
            UPDATE Product
            SET 
                Code = ISNULL(@Code, Code),
                Name = ISNULL(@Name, Name),
                Description = ISNULL(@Description, Description),
                CategoryId = ISNULL(@CategoryId, CategoryId),
                UnitOfMeasure = ISNULL(@UnitOfMeasure, UnitOfMeasure),
                Price = ISNULL(@Price, Price),
                ReorderThreshold = ISNULL(@ReorderThreshold, ReorderThreshold)
            WHERE Id = @Id;
        COMMIT TRAN;
        
        SELECT
            p.Id, p.Code, p.Name, p.Description, p.UnitOfMeasure, p.Price,
            p.CurrentStock, p.ReorderThreshold, p.IsActive,
            c.Name AS Category
        FROM Product p
        JOIN Category c ON c.Id = p.CategoryId
        WHERE p.Id = @Id;
    
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

DROP PROCEDURE IF EXISTS sp_SoftDeleteProduct;
GO
CREATE PROCEDURE sp_SoftDeleteProduct
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Product must exist (50001 maps to HTTP 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM Product WHERE Id = @Id)
            THROW 50001, 'Product not found.', 1;

        BEGIN TRAN;
            -- Soft delete by setting IsActive to 0 (false)
            UPDATE Product 
            SET IsActive = 0 
            WHERE Id = @Id;
        COMMIT TRAN;

        -- Return a simple success flag
        SELECT CAST(1 AS bit) AS Success;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

DROP PROCEDURE IF EXISTS sp_RestoreProduct;
GO
CREATE PROCEDURE sp_RestoreProduct
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Product must exist
        IF NOT EXISTS (SELECT 1 FROM Product WHERE Id = @Id)
            THROW 50001, 'Product not found.', 1;

        BEGIN TRAN;
            -- Restore by setting IsActive to 1 (true)
            UPDATE Product 
            SET IsActive = 1 
            WHERE Id = @Id;
        COMMIT TRAN;

        -- Return a simple success flag
        SELECT CAST(1 AS bit) AS Success;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

GO

DROP PROCEDURE IF EXISTS sp_InsertStockMovement;
GO
CREATE PROCEDURE sp_InsertStockMovement
    @ProductId INT,
    @MovementTypeId INT,
    @Quantity DECIMAL(18,2),
    @Reason NVARCHAR(500),
    @ReferenceCode NVARCHAR(50),
    @CreatedByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        -- Basic validation
        IF @Quantity <= 0
        BEGIN
            ;THROW 50002, 'Quantity must be strictly positive.', 1;
        END;
        
        IF @CreatedByUserId NOT IN (SELECT Id FROM AppUser)
        BEGIN
            ;THROW 50002, 'User ID does not exist.', 1;
        END;

        BEGIN TRAN;

        DECLARE @CurrentStock DECIMAL(18,2);
        DECLARE @IsActive BIT;
        DECLARE @ReorderThreshold DECIMAL(18,2);

        -- Pessimistic locking (includes ReorderThreshold)
        SELECT 
            @CurrentStock = CurrentStock, 
            @IsActive = IsActive,
            @ReorderThreshold = ReorderThreshold
        FROM Product WITH (UPDLOCK, NOWAIT)
        WHERE Id = @ProductId;

        IF @CurrentStock IS NULL
        BEGIN
            ;THROW 50001, 'Product not found.', 1;
        END;

        IF @IsActive = 0
        BEGIN
            ;THROW 50002, 'Cannot add stock movements to an inactive product.', 1;
        END;

        DECLARE @NewStock DECIMAL(18,2);

        -- 1 = IN; 2 = OUT; 3 = ADJUSTMENT; 4 = TRANSFER;
        IF @MovementTypeId = 1
        BEGIN
            SET @NewStock = @CurrentStock + @Quantity;
        END
        ELSE IF @MovementTypeId = 2 OR @MovementTypeId = 4
        BEGIN
            IF @CurrentStock < @Quantity
            BEGIN
                ;THROW 50002, 'Insufficient stock available.', 1;
            END;

            SET @NewStock = @CurrentStock - @Quantity;
        END
        ELSE IF @MovementTypeId = 3
        BEGIN
            SET @NewStock = @Quantity;
        END
        ELSE
        BEGIN
            ;THROW 50002, 'Invalid movement type.', 1;
        END;

        -- Insert the stock movement
        INSERT INTO StockMovement (ProductId, MovementTypeId, Quantity, ResultingStock, Reason, ReferenceCode, CreatedAt, CreatedByUserId)
        VALUES (@ProductId, @MovementTypeId, @Quantity, @NewStock, @Reason, @ReferenceCode, GETUTCDATE(), @CreatedByUserId);

        DECLARE @NewMovementId INT = SCOPE_IDENTITY();

        -- Update the current stock
        UPDATE Product
        SET CurrentStock = @NewStock
        WHERE Id = @ProductId;

        -- Background notification for low stock (Deduplicated)
        IF @NewStock < @ReorderThreshold
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM LowStockNotification WHERE ProductId = @ProductId AND IsResolved = 0)
            BEGIN
                INSERT INTO LowStockNotification (ProductId, TriggeredAt, IsResolved)
                VALUES (@ProductId, GETUTCDATE(), 0);
            END;
        END
        ELSE IF @NewStock >= @ReorderThreshold
        BEGIN
            UPDATE LowStockNotification
            SET IsResolved = 1,
                ResolvedAt = GETUTCDATE()
            WHERE ProductId = @ProductId AND IsResolved = 0;
        END;

        COMMIT TRAN;

        SELECT
            s.Id,
            p.Code AS ProductCode,
            p.Name AS ProductName,
            m.Name AS MovementType,
            s.Quantity,
            s.ResultingStock,
            s.Reason,
            s.ReferenceCode,
            s.CreatedAt,
            u.Username AS CreatedBy 
        FROM StockMovement s
        JOIN Product p ON p.Id = s.ProductId
        JOIN MovementType m ON m.Id = s.MovementTypeId
        JOIN AppUser u ON u.Id = s.CreatedByUserId
        WHERE s.Id = @NewMovementId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRAN;
        END;

        ;THROW;
    END CATCH;
END;
GO

DROP PROCEDURE IF EXISTS sp_ResolveNotification;
GO
CREATE PROCEDURE sp_ResolveNotification
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM LowStockNotification WHERE Id = @Id)
    BEGIN
        ;THROW 50001, 'The requested notification could not be found.', 1;
    END;

    UPDATE LowStockNotification
    SET IsResolved = 1,
        ResolvedAt = GETUTCDATE()
    WHERE Id = @Id;
END
GO