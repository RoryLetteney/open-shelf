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

app.get('/', (req, res) => getBooks(req, res));
app.get('/searches/new', (req, res) => res.render('pages/searches/new'));
app.post('/searches/show', (req, res) => getBooks(req, res));

const getBooks = (req, res) => {
  const handler = {
    query: req.body,
    cacheHit: results => {
      try {
        res.render('pages/index', { results: results.rows });
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

  fetchBooksFromDB(handler);
};

// BOOK CONSTRUCTOR
function Book(book) {
  this.title = book.volumeInfo.title || 'No title',
  this.author = book.volumeInfo.authors || 'No author',
  this.image = book.volumeInfo.imageLinks ? 'https' + book.volumeInfo.imageLinks.thumbnail.slice(4) : 'https://via.placeholder/50x100',
  this.description = book.volumeInfo.description || 'No description';
}

const fetchBooksFromDB = handler => {
  const SQL = `SELECT * FROM books`;

  return client.query(SQL)
    .then(results => results.rowCount > 0 ? handler.cacheHit(results) : handler.cacheMiss())
    .catch(err => console.log(err));
};

Book.fetchBooksFromAPI = query => {
  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query['title-or-author'] === 'title' ? `intitle:${query.query}` : `inauthor:${query.query}`}`;

  return superagent.get(URL)
    .then(res => {
      return res.body.items.map(item => {
        const book = new Book(item);
        book.isbn = item.volumeInfo.industryIdentifiers[0].type + ' ' + item.volumeInfo.industryIdentifiers[0].identifier;
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
