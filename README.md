# Inventory-App

# Backend Task Division Proposal

We propose dividing the backend work similarly to IssueTracker: one of us will handle **read operations** (database queries and GET endpoints), while the other will manage **write operations** (database modifications and POST/PATCH/DELETE endpoints).

---

## 📖 Intern 1: Read Operations

**Responsibilities:**  
Write stored procedures for `SELECT` queries and implement `GET` endpoints.

### Product

- **`GET /api/products`**
  - Retrieves a list of products (pagination required to avoid performance issues with large datasets);
  - Calls stored procedure `sp_GetProducts`;
- **`GET /api/products/{id}`**
  - Retrieves full details for a single product based on the ID in the URL;
  - Calls stored procedure `sp_GetProductById`;

### StockMovement

- **`GET /api/stock-movements`**
  - Retrieves the history of stock movements (pagination required, similar to products);
  - Calls stored procedure `sp_GetStockMovements`;
- **`GET /api/stock-movements/{productId}`** *(Optional)*
  - Retrieves the movement history for a specific product based on its ID;
  - Calls stored procedure `sp_GetStockMovementsById`;

### LowStockNotification

- **`GET /api/notifications`**
  - Lists notifications (e.g., only unresolved ones, filtered by the `IsResolved` field);

**Note:** All stored procedures for read operations will be written in the `ReadProcedures.sql` file under the `Database` directory.

---

## ✍️ Intern 2: Write Operations

**Responsibilities:**  
Write stored procedures for `INSERT`/`UPDATE` operations and implement `POST`, `PATCH`, and `DELETE` endpoints.

### Product

- **`POST /api/products`**
  - Creates a new product using `CreateProductDto` and enforces validation rules;
  - Calls stored procedure `sp_InsertProduct`;
- **`PATCH /api/products/{id}`**
  - Updates product data using `UpdateProductDto`;
  - Calls stored procedure `sp_UpdateProduct`;
- **`DELETE /api/products/{id}`**
  - Performs a **soft delete** (sets `isActive = 0`), does **not** physically delete from the database;
  - Calls stored procedure `sp_SoftDeleteProduct`;

### StockMovement

- **`POST /api/stock-movements`**
  - Records a stock movement and updates the product quantity in a **single transaction with pessimistic locking**;
  - Uses `CreateStockMovementDto`;
  - Calls stored procedure `sp_InsertStockMovement` (with pessimistic locking);

> ⚠️ **Important:**  
> **Do NOT implement `PUT` or `DELETE` for stock movements.**  
> Stock movements are **immutable**. If an entry is incorrect (e.g., 10 units were mistakenly recorded), a new adjustment movement (e.g., -10 units) must be created instead.

### LowStockNotification

- **`PATCH /api/notifications/{id}/resolve`**
  - Marks a low-stock notification as resolved after it has been addressed;

---

## 🧪 Testing and Validation

After completing the endpoints, the following steps are **mandatory**:

1. **Code Review**
  - Cross-review each other's code (Intern 1 reviews the Write PR, and Intern 2 reviews the Read PR);
2. **Manual Integration Testing**
  - Test the entire application flow end-to-end using Swagger;
3. **Automated Testing (Mandatory)**
  - Write **xUnit tests** to validate concurrency requirements;
  - **Critical Test Case:**  
  Simultaneously send **two `POST /api/stock-movements` requests** attempting to reduce the stock of the **same product**. The test must demonstrate that:
    - The stock does **not** go negative;
    - Operations remain **consistent**;

---

## 🖥️ Frontend

*To be determined (TBD).*

---

## 🔍 Observations &amp; Suggestions for Improvement

1. **Pagination Clarification**
  - The proposal mentions pagination for `GET /api/products` and `GET /api/stock-movements`, but the exact implementation (e.g., `?page=1&pageSize=20`) should be standardized and documented in the API contract.
2. **Filtering for Notifications**
  - The `GET /api/notifications` endpoint should explicitly define whether filtering by `IsResolved` is mandatory or optional. Consider adding query parameters like `?isResolved=false`.
3. **Concurrency Testing**
  - The pessimistic locking requirement for stock movements is critical. The automated test must cover edge cases (e.g., concurrent updates, deadlocks).

---
