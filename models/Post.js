const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//schema for a post
const PostSchema = new Schema ({
    uid: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})


module.exports = Post = mongoose.model("posts", PostSchema);

