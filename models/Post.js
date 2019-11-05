const mongoose = require("mongoose");
const schemas = require('./schemas.js');

//Export the Post model
module.exports = Post = mongoose.model("posts", schemas.PostSchema);

