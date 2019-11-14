//Load Dependencies
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");// Load User model

//Load User model
const User = require("../../models/User");
//Load Post model
const Post = require("../../models/Post");

// @route POST api/users/register
// @desc Register user
// @access Public

//post route for the register page
router.post("/api/users/register", (req, res) => {
    //Form validation
    //Pass the register form body to the validateRegisterInput function
        //and save the resulting objects as variables
    const {errors, isValid} = validateRegisterInput(req.body);
    //check if register form inputs are valid
    if (!isValid) {
        //if invalid return errors as json
        //JSON.stringify(errors)
        return res.send({errors: errors});
    }
    //Search User email fields for existing email
    User.findOne({email: req.body.email})
        .then(user => {
            //if email already exists return email exists response
            if (user) {
                return res.status(400).send({
                    errors: {email: "Email already exists"}
                });
            }
            //Else create a new user and update all the required fields from the form body
            else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })
                 //Hash password before saving to db
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //hash password
                        newUser.password = hash;
                        //save new user to db
                        newUser
                            .save()
                            //return the new user as a response
                            .then(user => res.send(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        
        })

})

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public

router.post("/api/users/login", (req, res) => {
    //Form validation
    const {errors, isValid} = validateLoginInput(req.body);
    const secretOrKey = process.env.secretOrKey;
    //Check validation
    if(!isValid) {
        return res.status(400).json({errors: errors});
    }
    //Extract email and pass from the login form fields
    const email = req.body.email;
    const password = req.body.password;

    //Search for user in database by email
    User.findOne({email})
        .then(user => {
            //If user doesnt exist send an error
            if (!user) {
                return res.status(404).send({
                    errors: {emailnotfound: "Email not found"}
                })
            }

            //Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        //Create JWT payload
                        const payload = {
                            id: user.id,
                            name: user.name
                        };

                        //Sign token
                        let token = jwt.sign(
                            payload,
                            secretOrKey,
                            {
                                //expires in 1 year and seconds
                                expiresIn: 31556926
                            }
                            
                        )

                        //update user object with new token
                        user.token = token;
                        //save user
                        user.save((err) => {
                            err ? console.log(err) : console.log("Success!  Token added to user", JSON.stringify(user));
                        })

                        return res.send({
                                userId: user.id,
                                success: true,
                                token: "Bearer" + token
                            })
                        
                    }
                    else {
                        return res.status(400).send({ 
                            errors: {passwordincorrect: "Password incorrect"}
                        });
                    }
                    
                })
            

        })

})

//route for creating posts
router.post("/api/users/create_post", (req, res) => {
    //extract user post fields from request
    const postUid = req.body.uid;
    const postDescription = req.body.description;
    const postTitle = req.body.title;
    const inputToken = req.body.token;

    //search db by id for User
    User.findById(postUid, (err, user) => {
        if (err) {
            console.log(err);
            res.send({errors: {error: err.message}})
        }

        //compare user token against inputToken
        //if not a match
        if (user.token !== inputToken) {
            //return error
            console.log("input token doesn't match user token in db");
            res.send({errors: {error: "User not logged in."}});
        } 
        
        //create new post and update its uid field and description from the form.
        let newPost = new Post({
            uid: postUid,
            description: postDescription,
            title: postTitle
        })

        //save new post to the database
        newPost.save(
            (err, newPost) => err
                ? res.send({
                    errors: {error: err.message}
                }) 
                : console.log("new post created")
        )
        

        //Add new post to current user's list post array.
        user.posts.push(newPost);
        //Save current user back to the database and return user and new log as json
        user.save((err) => {
            err ? console.log(err) : res.json({apiPostResponse: {
                user: user, 
                newPost: user.posts[user.posts.length - 1],
                title: postTitle,
                postId: newPost.id,
            }
                
            })
        })
    })

        

}) 
module.exports = router;