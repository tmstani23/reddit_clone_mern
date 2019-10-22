const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const port = 4000

//Initialize mongoose connection with cloud db server
mongoose.connect(process.env.DATABASE_URL, function(err) {
  
    if(err) {
      console.log(err);
      
    }
    //Log if connection was established or not
    console.log(mongoose.connection.readyState, "Mongo DB connection established");
});



app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))