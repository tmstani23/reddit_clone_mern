const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const db = process.env.DATABASE_URL;
const testDB = process.env.TEST_DB_URI;
const cors = require("cors");

const passport = require("passport");
const users = require("./routes/api/users.js");
const routeIndex = require("./routes/api/routeIndex.js");
const path = require('path');

console.log(db);

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
//cors middleware
app.use(cors());

//Initialize mongoose connection with cloud db server
// Connect to MongoDB
mongoose
  .connect(
    testDB,  
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//Passport config
require("./config/passport.js")(passport);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

//Routes
app.use("/api/users", users);
app.use("/api/routeIndex", routeIndex);

//root route
app.get('/', (req, res) => res.send('backend server working at root!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));