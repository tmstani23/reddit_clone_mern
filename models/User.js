const mongoose = require("mongoose");
const schemas = require('./schemas.js');

//Export the User model
module.exports = User = mongoose.model("users", schemas.UserSchema);
   


