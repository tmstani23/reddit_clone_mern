const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for a User
const UserSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    posts: [PostSchema]
})



module.exports = User = mongoose.model("users", UserSchema);

