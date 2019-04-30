require('dotenv').config();
const cors = require('cors');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public/styles'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', (req, res) => {
  res.render('pages/index');
});

// BOOK CONSTRUCTOR
function Book(book) {
  this.image = book.image || 'https://via.placeholder/50x100',
  this.title = book.title || 'No title',
  this.author = book.author || 'No author',
  this.description = book.description || 'No description';
}
