require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public/styles'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', (req, res) => res.render('pages/index'));
app.post('/searches', (req, res) => getBooks(req, res));

const getBooks = (req, res) => {
  const handler = {
    query: req.query,
    cacheHit: results => {
      res.send('hello');
    },
    cacheMiss: () => {
      try {
        console.log('cache miss');
        Book.fetchBooks(handler.query)
          .then(results => res.send(results));
      } catch(err) {
        errorHandler(err, res);
      }
    }
  };

  handler.cacheMiss();
};

// BOOK CONSTRUCTOR
function Book(book) {
  this.image = 'https' + book.volumeInfo.imageLinks.thumbnail.slice(4) || 'https://via.placeholder/50x100',
  this.title = book.volumeInfo.title || 'No title',
  this.author = book.volumeInfo.authors || 'No author',
  this.description = book.volumeInfo.description || 'No description';
}

Book.fetchBooks = (query) => {
  // const URL = `https://www.googleapis.com/books/v1/volumes?q=${query.title-or-author === 'title' ? query.query : `inauthor:${query.query}`}`;
  const URL = `https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes`;

  return superagent.get(URL)
    .then(res => {
      return res.body.items.map(item => item.volumeInfo.imageLinks ? new Book(item) : '');
    }).catch(err => console.log(err));
};

const errorHandler = (error, res) => {
  res.render('pages/error', { error });
};
