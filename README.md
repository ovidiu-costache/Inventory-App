# Inventory App

This is an Inventory Management Application we built during our internship. Basically, it helps you keep track of products, stock availability and all movements (inbound, outbound and stock adjustments).

The app is designed as a multi-user system. It tackles real-world problems like what happens when two people try to update the stock at the exact same time (solved with pessimistic locking!).

## 🚀 What it can do

*   **Products:** You can create, edit, and soft-delete products.
*   **Stock Movements:** Track IN, OUT, and ADJUSTMENT operations.
*   **Concurrency:** Super safe stock updates. We use database-level locks to prevent bugs if two users click submit at the exact same time.
*   **Semantic Search:** Search for products using natural language. Instead of exact name matches, the app understands what you mean (e.g., searching "cleaning supplies" finds related products).
*   **AI Adjustment Review:** We integrated the Google Gemini API. If someone makes a manual stock adjustment and it looks suspicious, the AI catches it and asks for an extra confirmation.
*   **Low Stock Notifications:** If a product drops below its reorder threshold, you get an automatic notification.
*   **Auth (Basic):** Login and Signup with hashed passwords (BCrypt).

## 🛠️ Built with

*   **Backend:** .NET 10 (Minimal API), EF Core 10
*   **Database:** SQL Server (heavy logic is in Stored Procedures)
*   **Frontend:** Angular 22 (Standalone Components)
*   **AI:** Google Gemini API (`gemini-3.6-flash`)

---

## ⚙️ How to run it locally

To get the project running on your machine, you need to do a bit of setup. You have to configure your own database passwords and API key. It won't work with just one click!

### 1. Clone the repo
```bash
git clone https://github.com/ovidiu-costache/Inventory-App
cd Inventory-App
```

### 2. Set up the Database
You need SQL Server installed locally. 

Go to `Backend/API/appsettings.json` and change the `DefaultConnection` to match your SQL server (put YOUR username and password). Example:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=InventoryAppDb;User Id=sa;Password=YOUR_PASSWORD_HERE;TrustServerCertificate=True;"
}
```

If you want to run the project and access it from other computers on the same Wi-Fi, don't forget to change `localhost` to your local IP address in `Backend/API/Properties/launchSettings.json`.

### 3. Set up the Gemini API Key
For the AI check to work, you need a Google API key (it's free if you have a student account).

Go to `Backend/API/appsettings.Development.json` (or `appsettings.json`) and add this piece of code, pasting the key you generated:
```json
"Gemini": {
  "ApiKey": "YOUR_GEMINI_KEY_HERE"
}
```
**Do NOT commit your key to GitHub!** 

### 4. Database & SQL Scripts
The app uses some `.sql` scripts to create the tables and procedures.
In the root `package.json` file, there is a script called `db:init` that runs commands using `sqlcmd.exe`.
**WARNING:** For this command to work, go into `package.json` and add the password to your actual SQL Server inside the `db:init` script. Alternatively, you can just open SSMS / Azure Data Studio and manually run the 3 scripts from the `Backend/Database` folder.

### 5. Install & Run
Now that everything is set up, install the frontend packages:
```bash
npm install
```

If you put the correct password in `package.json` at step 4, you can start the whole project with a single command:
```bash
npm run dev
```
This command:
1. Runs the SQL scripts to build your database.
2. Starts the .NET Backend.
3. Starts the Angular Frontend.

When you see both are running, open `http://localhost:4200` in your browser. 
*(Hint: For testing, you can login with the user `admin` and password `admin123`)*

---

## 🔒 Concurrency Control
We used **Pessimistic Locking** to handle database concurrency. In the `sp_InsertStockMovement` stored procedure, we do a `SELECT ... WITH (UPDLOCK, NOWAIT)`. This puts an exclusive lock on that specific product. If someone else tries to modify the stock in that exact millisecond, they get the SQL Error 1222, which we catch in the code and return as an HTTP 409 Conflict. Zero deadlocks!

## 🔍 Semantic Search
The Gemini Embedding API generates vector embeddings for each product. When a search is performed, the query gets converted into an embedding too, and it is compared against all stored product embeddings using cosine similarity. This means exact product names aren't needed — a search like "beverages" will find "Coca-Cola", "Orange Juice", etc. The embeddings are generated via the `EmbeddingService` and the similarity calculation happens server-side.

## 🤖 AI Adjustment Review
Whenever there's an `ADJUSTMENT` movement, the data (and the reason you type in) goes to the Gemini model. If the AI sees you're trying to change 5000 products for no reason or you write something sketchy, it flags the request and makes you confirm it again in the UI. It's like a smart safety net!