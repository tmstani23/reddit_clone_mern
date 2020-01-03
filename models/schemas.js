const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const PostSchema = require('./Post');

const CountSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    hasUpVoted: {
        type: Boolean,
        default: false
    },
    hasDownVoted: {
        type: Boolean,
        default: false
    }
})

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
        type: Number,
        default: 0
    },
    usersWhoCounted: [CountSchema],
    title: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String
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
    UserSchema: UserSchema,
    CountSchema: CountSchema
  };