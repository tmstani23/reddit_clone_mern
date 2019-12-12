const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const db = process.env.DATABASE_URL;
const testDB = process.env.TEST_DB_URI;
const cors = require("cors");
const moment = require('moment');
const passport = require("passport");
const users = require("./routes/api/endpoints.js");
const path = require('path');

//Initialize mongoose connection with cloud db server
// Connect to MongoDB
mongoose
  .connect(
    testDB,  
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// convert all dates to formatted dates
app.set('json replacer', function (key, value) {
  if (this[key] instanceof Date) {
// Convert to format: January, 23, 1999
value = moment(this[key]).format('MMMM Do YYYY, h:mm:ss a');
  }
  return value;
});

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
//cors middleware
app.use(cors());



//passport middleware
app.use(passport.initialize());

//Passport config
require("./config/passport.js")(passport);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client')));

//Routes
app.use("/", users);

//root route
//app.get('/', (req, res) => res.send('backend server working at root!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));