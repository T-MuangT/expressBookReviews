const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Register a user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username is taken" });
  }
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,3));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const fetchBookByISBN = () => {
        return new Promise((resolve, reject) => {
          const book = books[isbn];
          if (book) {
            resolve(book);
          } else {
            reject(new Error("Book not found"));
          }
        });
      };
      const bookDetails = await fetchBookByISBN();
      return res.status(200).send(JSON.stringify(bookDetails, null, 3));
    } catch (error) {
    return res.status(404).json({ message: error.message });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();  
  try {
    const fetchByAuthor = new Promise((resolve) => {
      const bookKeys = Object.keys(books);
      let filtered_author = [];
      bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
          filtered_author.push(books[key]); 
        }
      });
      resolve(filtered_author);
    });
    const results = await fetchByAuthor;
    if (results.length > 0) {
      return res.status(200).send(JSON.stringify(results, null, 3));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
      return res.status(500).json({ message: "Server error tracking author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
      const fetchByTitle = new Promise((resolve) => {
      const bookKeys = Object.keys(books);
      let filtered_title = [];
      bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
          filtered_title.push(books[key]); 
        }
      });
      resolve(filtered_title);
    });
    const results = await fetchByTitle;
    if (results.length > 0) {
      return res.status(200).send(JSON.stringify(results, null, 3));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error tracking title" });
  }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const filtered_isbn = books[isbn];
  return res.send(JSON.stringify(filtered_isbn.reviews,null,3));
});

module.exports.general = public_users;
