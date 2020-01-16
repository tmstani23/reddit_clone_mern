const mongoose = require("mongoose");
const schemas = require('./schemas.js');

//Export the Post model
module.exports = Count = mongoose.model("counts", schemas.CountSchema);