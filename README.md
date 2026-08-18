# Inventory-App

# Backend Task Division Proposal

We propose dividing the backend work similarly to IssueTracker: one of us will handle **read operations** (database queries and `GET` endpoints), while the other will handle **write operations** (database modifications and `POST`/`PATCH`/`DELETE` endpoints).

---

## 📖 Intern 1: Read Operations

**Responsibilities:**  
Write stored procedures for `SELECT` queries and implement `GET` endpoints.

### Product

- **`GET /api/products`**
  - Retrieves a paginated list of products;
  - Supports filtering and sorting;
  - Calls stored procedure `sp_GetProductsPage`;
- **`GET /api/products/{id}`**
  - Retrieves full details for a single product based on the ID in the URL;
  - Calls stored procedure `sp_GetProductById`;

### StockMovement

- **`GET /api/stock-movements`**
  - Retrieves the paginated history of stock movements;
  - Supports filtering and sorting;
  - Calls stored procedure `sp_GetMovementsPage`;
- **`GET /api/stock-movements/{productId}`** *(Optional)*
  - Retrieves the movement history for a specific product based on its ID;
  - Calls stored procedure `sp_GetStockMovementsById`;

### LowStockNotification

- **`GET /api/notifications`**
  - Lists low-stock notifications;
  - Can filter notifications based on the `IsResolved` field;

**Note:** All stored procedures for read operations will be written in the `ReadProcedures.sql` file under the `Database` directory.

---

## ✍️ Intern 2: Write Operations

**Responsibilities:**  
Write stored procedures for `INSERT`/`UPDATE` operations and implement `POST`, `PATCH`, and `DELETE` endpoints.

### Product

- **`POST /api/products`**
  - Creates a new product using `CreateProductDto`;
  - Handles the required validation rules;
  - Calls stored procedure `sp_InsertProduct`;
- **`PATCH /api/products/{id}`**
  - Updates product data using `UpdateProductDto`;
  - Calls stored procedure `sp_UpdateProduct`;
- **`DELETE /api/products/{id}`**
  - Performs a **soft delete** by setting `IsActive = 0`;
  - Does not physically delete the product from the database;
  - Calls stored procedure `sp_SoftDeleteProduct`;

### StockMovement

- **`POST /api/stock-movements`**
  - Records a stock movement and updates the product stock in a **single transaction with pessimistic locking**;
  - Uses `CreateStockMovementDto`;
  - Calls stored procedure `sp_InsertStockMovement`;

> ⚠️ **Important:**  
> **Do NOT implement `PUT` or `DELETE` for stock movements.**  
> Stock movements are **immutable**. If a movement is incorrect, a new adjustment movement must be created instead.

### LowStockNotification

- **`PATCH /api/notifications/{id}/resolve`**
  - Marks a low-stock notification as resolved;

---

# Frontend Task Division

The frontend work will be divided in a similar way: each intern will work on the UI for the feature handled by their corresponding backend part.

---

## 📦 Intern 1: Products

**Branch:** `feature/products-ui`  
**Folder:** `src/app/products/`

### Product Service

- **`product.service.ts`**
  - Handles the API calls for products;
  - Implements `GET` with pagination, filtering and sorting;
  - Implements `POST`, `PATCH` and `DELETE`;

### Product List

- Displays products in a table;
- Includes pagination controls;
- Includes filtering and sorting options;

### Product Form

- Allows creating a new product;
- Allows editing an existing product;
- Handles validation errors returned by the backend;

---

## 📦 Intern 2: Stock Movements

**Branch:** `feature/movements-ui`  
**Folder:** `src/app/stock-movements/`

### Stock Movement Service

- **`stock-movement.service.ts`**
  - Handles the API calls for stock movements;
  - Implements `GET` with pagination, filtering and sorting;
  - Implements `POST` for creating new stock movements;

### Movement History

- Displays the stock movement history in a table;
- Includes pagination controls;
- Includes filters for date and movement type;

### Stock Movement Form

- Allows creating `IN` and `OUT` stock movements;
- Displays the error returned by the backend when there is not enough stock;

---

## 📌 Frontend Rules

1. Each intern should work **only** in their assigned folder:
   - Intern 1 → `src/app/products/`
   - Intern 2 → `src/app/stock-movements/`
2. If a change to a shared file is needed (`app.routes.ts`, `app.config.ts`, `index.html`, etc.), discuss it with the other intern first.
3. API calls should use the endpoints already implemented in the backend.
4. Backend errors should be handled and displayed properly in the UI.
5. Each feature should be submitted through a separate PR targeting `main`.
6. After both features are completed, test the full application flow together.