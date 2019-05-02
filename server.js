'use strict';

require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000,
  DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public/styles'));
app.use(express.static('./public/js'));
const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', (req, res) => getBooks(req, res, 'pages/index', false));
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.get('/book/:id', (req, res) => getBooks(req, res, 'pages/books/show', true));
app.post('/searches/show', (req, res) => getBooks(req, res, 'pages/searches/show', false));
app.post('/save', (req, res) => {
  const book = new Book(req.body);
  book.save()
    .then(result => res.redirect(`/book/${result.rows[0].id}`));
});

const getBooks = (req, res, page, single) => {
  const handler = {
    query: req.body,
    cacheHit: results => {
      try {
        if (page === 'pages/index') {
          res.render(page, { results: results, totalSaved: results.length });
        } else if (page === 'pages/books/show') {
          const bookshelves = fetchBookshelves();
          bookshelves.then(result => {
            res.render(page, { book: results[0], bookshelves: result });
          });
        } else {
          const bookshelves = fetchBookshelves();
          bookshelves.then(result => {
            res.render(page, { results: results.rows, bookshelves: result });
          });
        }
      } catch(err) {
        errorHandler(err, res);
      }
    },
    cacheMiss: () => {
      try {
        if (Object.values(handler.query).length) {
          Book.fetchBooksFromAPI(handler.query)
            .then(results => {
              const bookshelves = fetchBookshelves();
              bookshelves.then(result => {
                res.render('pages/searches/show', { results, bookshelves: result });
              });
            });
        } else {
          res.redirect('/searches/new');
        }
      } catch(err) {
        errorHandler(err, res);
      }
    }
  };

  if (single) {
    fetchSingleBookFromDB(req.params.id, handler);
  } else {
    fetchBooksFromDB(handler);
  }
};

// BOOK CONSTRUCTOR
function Book(book) {
  this.title = book.title || 'Title Unknown',
  this.author = book.authors ? book.authors[0] : (book.author ? book.author : 'Author Unknown'),
  this.image_url = book.imageLinks ? 'https' + book.imageLinks.thumbnail.slice(4) : (book.image_url ? book.image_url : 'https://placehold.it/100X200'),
  this.description = book.description || 'Description Unknown',
  this.isbn = book.volumeInfo ? `${book.volumeInfo.industryIdentifiers[0].type} ${book.volumeInfo.industryIdentifiers[0].identifier}` : (book.isbn ? book.isbn : 'ISBN Unknown'),
  this.bookshelf = book.bookshelf || 'Bookshelf Unknown';
}

const fetchBooksFromDB = handler => {
  const SQL = !Object.values(handler.query).length ? `SELECT * FROM books` : `SELECT * FROM books WHERE ${handler.query['title-or-author']} LIKE '%${handler.query.query}%'`;

  return client.query(SQL)
    .then(results => results.rowCount > 0 ? handler.cacheHit(results.rows) : handler.cacheMiss())
    .catch(err => console.log(err));
};

const fetchSingleBookFromDB = (id, handler) => {
  const SQL = `SELECT * FROM books WHERE id=${id}`;
  return client.query(SQL)
    .then(results => handler.cacheHit(results.rows));
};

const fetchBookshelves = () => {
  const SQL = 'SELECT DISTINCT bookshelf FROM books';
  return client.query(SQL)
    .then(results => results.rows);
};

Book.fetchBooksFromAPI = query => {
  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query['title-or-author'] === 'title' ? `intitle:${query.query}` : `inauthor:${query.query}`}`;

  return superagent.get(URL)
    .then(res => {
      return res.body.items.map(item => {
        const book = new Book(item.volumeInfo);
        return book;
      });
    }).catch(err => console.log(err));
};

Book.prototype.save = function() {
  const SQL = 'INSERT INTO books (title, author, image_url, description, isbn, bookshelf) VALUES($1,$2,$3,$4,$5,$6) RETURNING id';
  const values = Object.values(this);

  return client.query(SQL, values);
};

const errorHandler = (error, res) => {
  res.render('pages/error', { error });
};
