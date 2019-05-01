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
const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', (req, res) => getBooks(req, res, 'index', false));
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.get('/book/:id', (req, res) => getBooks(req, res, 'pages/books/show', true));
app.post('/searches/show', (req, res) => getBooks(req, res, 'pages/searches/show', false));

const getBooks = (req, res, page, single) => {
  const handler = {
    query: req.body,
    cacheHit: results => {
      try {
        if (page === 'index') {
          res.render(page, { results: results, totalSaved: results.length });
        } else if (page === 'pages/books/show') {
          res.render(page, { book: results[0] });
        } else {
          res.render(page, { results: results.rows });
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
              res.render('pages/searches/show', { results });
            });
        } else {
          res.render('pages/searches/new');
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
  this.title = book.volumeInfo.title || 'No title',
  this.author = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'No author',
  this.image_url = book.volumeInfo.imageLinks ? 'https' + book.volumeInfo.imageLinks.thumbnail.slice(4) : 'https://placehold.it/80x80',
  this.description = book.volumeInfo.description || 'No description';
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

Book.fetchBooksFromAPI = query => {
  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query['title-or-author'] === 'title' ? `intitle:${query.query}` : `inauthor:${query.query}`}`;

  return superagent.get(URL)
    .then(res => {
      return res.body.items.map(item => {
        const book = new Book(item);
        book.isbn = item.volumeInfo.industryIdentifiers ? item.volumeInfo.industryIdentifiers[0].type + ' ' + item.volumeInfo.industryIdentifiers[0].identifier : 'No ISBN Found';
        book.save();
        return book;
      });
    }).catch(err => console.log(err));
};

Book.prototype.save = function() {
  const SQL = 'INSERT INTO books (title, author, image_url, description, isbn, bookshelf) VALUES($1,$2,$3,$4,$5,$6) RETURNING id';
  const values = [...Object.values(this), 1];

  return client.query(SQL, values);
};

const errorHandler = (error, res) => {
  res.render('pages/error', { error });
};
