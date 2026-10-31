# Lab 2: SQLite database and CRUD routes

**Name:** Latchipatruni Charan Teja  
**Registration Number:** 252U1R8045  
**Class:** B.Tech CSE(QE) – 2B  
**Section:** S-13 204

**Deployed Link:** https://backend-development-fundamentals-1-fzeu.onrender.com

## Objective

Connect an Express server to a SQLite database and expose CRUD operations over HTTP.

## Technologies Used

- Node.js
- Express.js
- SQLite
- `sqlite` and `sqlite3`
- Nodemon
- Postman

## Project Setup and Execution

1. Open a terminal in the `lab-02` folder.
2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. The server runs at:

   ```text
   http://localhost:3000
   ```

## Database

The SQLite database is located at `database/books.db`.

The `book` table contains the following columns:

| Column | Data Type | Description |
| --- | --- | --- |
| `id` | INTEGER | Primary key |
| `title` | TEXT | Book title |
| `author` | TEXT | Book author |
| `price` | INTEGER | Book price |
| `pages` | INTEGER | Number of pages |

The database was populated with 10 sample book records using the SQLite CLI.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/books/` | Retrieve all books |
| GET | `/books/:bookId/` | Retrieve a book by its ID |
| POST | `/books/` | Add a new book |
| PUT | `/books/:bookId/` | Update a book by its ID |
| DELETE | `/books/:bookId/` | Delete a book by its ID |

For POST and PUT requests, send a JSON body containing `title`, `author`, `price`, and `pages`.

## Screenshots

### 1. Get all books

![GET all books](screenshots/get-all-books.png)

### 2. Get a book by ID

![GET book by ID](screenshots/get-book-by-id.png)

### 3. Add a book

![POST add a book](screenshots/post-book.png)

### 4. Update a book

![PUT update a book](screenshots/put-book.png)

### 5. Delete a book

![DELETE a book](screenshots/delete-book.png)

### 6. SQLite database records

![SQLite database records](screenshots/sqlite-database.png)

## Problems Faced and Solutions

- The initial `package.json` file was empty. Added valid JSON before installing dependencies.
- The SQLite command-line tool was unavailable. Installed SQLite tools and verified the `sqlite3` command.
- Express was missing from the project dependencies. Installed it using `npm install express`.

## Notes

- SQL queries use `?` placeholders for user-provided values.
- The database connection is established before the Express server starts.
- `node_modules` and `.env` files should not be committed to GitHub.
