const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const db = process.env.DATABASE_URL;
const testDB = process.env.TEST_DB_URI;

console.log(db);

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

//Initialize mongoose connection with cloud db server
// Connect to MongoDB
mongoose
  .connect(
    testDB,  
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));



app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));