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
            c.Name AS CategoryName
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
    @Code NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(500),
    @CategoryId INT,
    @UnitOfMeasure NVARCHAR(20),
    @Price DECIMAL(18,2),
    @ReorderThreshold DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON; 

    BEGIN TRY
        -- Product must exist (50001 maps to HTTP 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM Product WHERE Id = @Id)
            THROW 50001, 'Product not found.', 1;

        -- Product code must be unique, excluding current product (50003 maps to HTTP 409 Conflict)
        IF EXISTS (SELECT 1 FROM Product WHERE Code = @Code AND Id != @Id)
            THROW 50003, 'Product code already exists. It must be unique.', 1;

        -- Category must be valid (50001 maps to HTTP 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM Category WHERE Id = @CategoryId)
            THROW 50001, 'The specified category does not exist.', 1;

        -- Price cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @Price < 0
            THROW 50002, 'Price cannot be negative.', 1;

        -- Reorder threshold cannot be negative (50002 maps to HTTP 400 Bad Request)
        IF @ReorderThreshold < 0
            THROW 50002, 'Reorder threshold cannot be negative.', 1;

        BEGIN TRAN;
            UPDATE Product
            SET 
                Code = @Code,
                Name = @Name,
                Description = @Description,
                CategoryId = @CategoryId,
                UnitOfMeasure = @UnitOfMeasure,
                Price = @Price,
                ReorderThreshold = @ReorderThreshold
            WHERE Id = @Id;
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
            c.Name AS CategoryName
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