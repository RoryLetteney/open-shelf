require('dotenv').config();
const cors = require('cors');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
