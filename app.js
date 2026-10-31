const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all incoming requests
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (request.method === "OPTIONS") {
        return response.sendStatus(200);
    }
    next();
});

const PORT = process.env.PORT || 3000;
const databaseDir = path.join(__dirname, "database");
let databasePath = path.join(databaseDir, "books.db");

// Fallback if books.db exists in the root directory
if (!fs.existsSync(databasePath) && fs.existsSync(path.join(__dirname, "books.db"))) {
    databasePath = path.join(__dirname, "books.db");
}

let db;

// Seed data if database is empty
const seedDatabaseIfEmpty = async () => {
    const tableCheck = await db.get(
        "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='book'"
    );

    if (!tableCheck || tableCheck.count === 0) {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                price INTEGER NOT NULL,
                pages INTEGER NOT NULL
            );
        `);
    }

    const rowCount = await db.get("SELECT COUNT(*) AS count FROM book");
    if (rowCount && rowCount.count === 0) {
        const initialBooks = [
            ["The Alchemist", "Paulo Coelho", 350, 208],
            ["Wings of Fire", "A. P. J. Abdul Kalam", 299, 180],
            ["Atomic Habits", "James Clear", 499, 320],
            ["The Hobbit", "J. R. R. Tolkien", 399, 310],
            ["1984", "George Orwell", 250, 328],
            ["Pride and Prejudice", "Jane Austen", 275, 432],
            ["The Great Gatsby", "F. Scott Fitzgerald", 220, 180],
            ["To Kill a Mockingbird", "Harper Lee", 325, 281],
            ["The Book Thief", "Markus Zusak", 450, 584],
            ["Ikigai", "Héctor García and Francesc Miralles", 299, 208],
        ];

        for (const [title, author, price, pages] of initialBooks) {
            await db.run(
                "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
                title,
                author,
                price,
                pages
            );
        }
        console.log("Database initialized and seeded with default book records.");
    }
};

const initializeDBAndServer = async () => {
    try {
        if (!fs.existsSync(databaseDir)) {
            fs.mkdirSync(databaseDir, { recursive: true });
        }

        db = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        });

        await seedDatabaseIfEmpty();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

// Root route - Welcome and API documentation
app.get("/", (request, response) => {
    response.status(200).json({
        message: "Welcome to Lab 2: SQLite database and CRUD routes API",
        status: "active",
        endpoints: {
            "GET /books/": "Retrieve all books",
            "GET /books/:bookId/": "Retrieve a single book by ID",
            "POST /books/": "Add a new book (requires title, author, price, pages)",
            "PUT /books/:bookId/": "Update an existing book by ID",
            "DELETE /books/:bookId/": "Delete a book by ID",
        },
    });
});

// GET all books
app.get(["/books", "/books/"], async (request, response) => {
    try {
        const books = await db.all("SELECT * FROM book");
        response.status(200).json(books);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve books" });
    }
});

// GET one book
app.get(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const { bookId } = request.params;
        const book = await db.get("SELECT * FROM book WHERE id = ?", bookId);

        if (!book) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json(book);
    } catch (error) {
        response.status(500).json({ error: "Failed to retrieve book" });
    }
});

// POST a book
app.post(["/books", "/books/"], async (request, response) => {
    try {
        const { title, author, price, pages } = request.body;

        if (!title || !author || price == null || pages == null) {
            return response.status(400).json({
                error: "title, author, price, and pages are required",
            });
        }

        const result = await db.run(
            "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
            title,
            author,
            price,
            pages
        );

        response.status(201).json({
            id: result.lastID,
            title,
            author,
            price,
            pages,
        });
    } catch (error) {
        response.status(500).json({ error: "Failed to add book" });
    }
});

// PUT a book
app.put(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const { bookId } = request.params;
        const { title, author, price, pages } = request.body;

        if (!title || !author || price == null || pages == null) {
            return response.status(400).json({
                error: "title, author, price, and pages are required",
            });
        }

        const result = await db.run(
            "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
            title,
            author,
            price,
            pages,
            bookId
        );

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
        response.status(500).json({ error: "Failed to update book" });
    }
});

// DELETE a book
app.delete(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const { bookId } = request.params;

        const result = await db.run("DELETE FROM book WHERE id = ?", bookId);

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        response.status(500).json({ error: "Failed to delete book" });
    }
});

// 404 handler for undefined routes
app.use((request, response) => {
    response.status(404).json({ error: "Route not found" });
});

// Generic error handler
app.use((error, request, response, next) => {
    console.error("Server error:", error);
    response.status(500).json({ error: "Internal server error" });
});

module.exports = app;
