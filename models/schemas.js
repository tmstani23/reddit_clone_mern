const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const PostSchema = require('./Post');

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

module.exports = {
    PostSchema: PostSchema,
    UserSchema: UserSchema
  };