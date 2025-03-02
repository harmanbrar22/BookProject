import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "your database name",
  password: "your database password",
  port: 5433,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let search,sort="rating";

app.get("/", async (req, res) => {
    try {
        const response = await db.query(`SELECT * FROM booksread JOIN booksreview ON booksread.bookid=booksreview.bookid 
            ORDER BY ${sort} ASC`)
        const data1 = response.rows;        
        res.render("index.ejs", {
            search: search,
            data: data1,
        });

    } catch (error) {
        console.log("Could not execute query: ", error)
    }

})

app.get("/book", async (req, res) => {
    const title = req.query.title;
    const author = req.query.author;
    const coverid = req.query.coverId;
    
    try {
        const response = await db.query(
            `SELECT * FROM booksread
        JOIN booksreview ON booksread.bookid=booksreview.bookid`
        );
        const data = response.rows;
        //check if book title exists in database with review already.
        const bookCheck = data.find((book) => book.title === req.query.title);
        //check if review exists. If not set review to undefined.
        const review = bookCheck ? bookCheck.review : undefined;
        const bookid = bookCheck ? bookCheck.bookid : undefined;        
        res.render("addBook.ejs", {
            title: title,
            author: author,
            coverid: coverid,
            review: review,
            bookid: bookid
        })
    } catch (error) {
        console.log("Error: ", error)
    }

})

app.post("/updateReview", async (req, res) => {
    const review= req.body.review;
    const rating = req.body.rating;
    const bookid = req.body.bookid;
    const date = new Date().toISOString();
    try {
        const response = await db.query(
            `UPDATE booksreview
            SET review = $2, rating = $3, date =$4
            WHERE bookid = $1
            RETURNING *`, [bookid, review, rating, date]
        )
        const data = response.rows;        
        res.redirect("/");

    } catch (error) {
        console.log("Error: ", error);
    }

})

app.post("/addBook", async (req, res) => {
    const title = req.body.title;
    const coverid = req.body.coverid;
    const author = req.body.author;
    const review = req.body.review;
    const rating = req.body.rating;

    try {
        // Begin a transaction
        await db.query('BEGIN');
        
        const newBook = await db.query("INSERT INTO booksread (title, coverid, author) VALUES ($1, $2, $3) RETURNING bookid",
             [title, coverid, author] );

        const newReview = await db.query(
            `INSERT INTO booksreview (bookid, review, rating)
            VALUES ($1, $2, $3)
            RETURNING *`, [newBook.rows[0].bookid, review, rating]
        );
        // Commit the transaction if both inserts are successful
        await db.query('COMMIT');

        res.redirect("/");

    } catch (error) {
        // Rollback the transaction if an error occurs
        await db.query('ROLLBACK');
        console.log("An Error Occured: ", error);
        res.redirect("/");
    }

})

app.post("/delete", async (req, res) => {
    const bookId = req.body.deletebutton;
    try {
        await db.query('BEGIN')
        await db.query(`DELETE FROM booksreview WHERE bookid = $1`, [bookId] );
        await db.query(`DELETE FROM booksread WHERE bookid = $1`, [bookId] );
        await db.query('COMMIT');
        res.redirect("/");
        
    } catch (error) {
        await db.query('ROLLBACK');
        console.log("An error occured: ", error);        
    }    
    
})

app.post("/sort", async (req, res) => {    
    sort = req.body.sort;    
    res.redirect("/");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
