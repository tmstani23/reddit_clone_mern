const mongoose = require("mongoose");
const schemas = require('./schemas.js');

//Export the User model
module.exports = Comment = mongoose.model("comments", schemas.CommentSchema);
   


