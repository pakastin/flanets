const express = require('express');

const { NODE_PORT } = process.env;

const PORT = NODE_PORT || 8080;

const app = express();

app.set('view engine', 'pug');
app.set('views', 'client');

app.get('/', (req, res, next) => {
  res.render('index');
});

app.use(express.static('public'));

app.listen(PORT, (err) => {
  if (err) {
    throw new Error(err);
  }

  console.log(`Listening to port ${PORT}`);
});
