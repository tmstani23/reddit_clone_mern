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
    count: {
        type: String,
        default: 0
    },
    title: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    name: {
        type: String,
        unique: true
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
        required: true,
        unique: true
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
    token: {
        type: String
    },
    posts: [PostSchema]
})

module.exports = {
    PostSchema: PostSchema,
    UserSchema: UserSchema
  };