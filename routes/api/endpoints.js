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
//Load count model
const Count = require("../../models/Count");
const Comment = require("../../models/Comment");

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
                                token: token,
                                userName: user.name
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
//route for adding or subtracting post count
router.post("/api/users/add_count", (req, res) => {
    const inputCount = parseInt(req.body.count);
    const postId = req.body.postId;
    const inputUid = req.body.uid;
    

    console.log(inputCount, postId, inputUid, "count,postid,inputUid");

    Post.findById(postId, (err, post) => {
        let userCountArr = post.usersWhoCounted;
        let userHasCountedIndex = userCountArr.findIndex((element) => {
            return element.userId == inputUid
        });
         
        
        //console.log(userCountArr, "userCount length");
        //console.log(userHasCountedIndex, "userCountArr index");
        
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
            
        }
        //Make sure post count won't go negative
        if (post.count == 0 && inputCount < 0) {
            console.log("trying to reduce count below zero")
            return res.send({errors: {error: "trying to reduce count below zero"}})
        };
        
        //if user id is found in array
        if(userHasCountedIndex !== -1) {
            let userHasCountedObj = userCountArr[userHasCountedIndex];
            //update flag to show user has already modified count
            console.log("userId matches in usersWhoCountedArray", post.usersWhoCounted[userHasCountedIndex])
            //console.log(userHasCountedObj.hasUpVoted, inputCount)
            //if user has already downvoted
            if(userHasCountedObj.userCount <= -1 && inputCount < 0)
            {
                console.log("trying to downvote more than once");
                return res.status(500).send({errors: {error: "trying to downvote more than once"}})
            }   
            //Bypass if user has already upvoted
            else if(userHasCountedObj.userCount >= 1 && inputCount > 0) {
                console.log("user already upvoted");
                return res.status(500).send({errors: {error: "trying to upvote more than once"}})
                
            }

            else {
                //UserCount object's count property is summed with the new input count
                userHasCountedObj.userCount += inputCount;
                //Replace the object in the post usersWhoCounted array to the new object
                post.usersWhoCounted[userHasCountedIndex] = userHasCountedObj;
                //Add the new input count to the current post's count
                post.count += inputCount;
            }
                
        }
        
        //else if user id is not in the array
        else if(userHasCountedIndex == -1) {
            //add new count object to array with updated uid and count
            let userCountObj = {
                userCount: inputCount,
                userId: inputUid
            }
            
            //increment post count
            post.count += inputCount;
            //add new user obj to the post's users who counted array
            post.usersWhoCounted.push(userCountObj)
        }
       
        
        
        
        //Save the updated count
        post.save((err) => {
            if (err) {
                console.log(err);
                return res.send({errors: {error: err.message}})
            }
            else {
                console.log(post.usersWhoCounted, "userswhocountedArr");
                return res.send({
                    count: post.count,
                    postId: post._id
                })
            }
        })

    })

})

//route for adding or subtracting comment count
router.post("/api/users/comment_count", (req, res) => {
    const inputCount = parseInt(req.body.count);
    const commentId = req.body.commentId;
    const inputUid = req.body.userId;
    

    console.log(inputCount, commentId, inputUid, "count,commentid,inputUid");

    Comment.findById(commentId, (err, comment) => {
        let userCountArr = comment.usersWhoCounted;
        let userHasCountedIndex = userCountArr.findIndex((element) => {
            return element.userId == inputUid
        });
         
        
        //console.log(userCountArr, "userCount length");
        //console.log(userHasCountedIndex, "userCountArr index");
        
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
            
        }
        //Make sure post count won't go negative
        if (comment.count == 0 && inputCount < 0) {
            console.log("trying to reduce count below zero")
            return res.send({errors: {error: "trying to reduce count below zero"}})
        };
        
        //if user id is found in array
        if(userHasCountedIndex !== -1) {
            let userHasCountedObj = userCountArr[userHasCountedIndex];
            //update flag to show user has already modified count
            console.log("userId matches in usersWhoCountedArray", comment.usersWhoCounted[userHasCountedIndex])
            //console.log(userHasCountedObj.hasUpVoted, inputCount)
            //if user has already downvoted
            if(userHasCountedObj.userCount <= -1 && inputCount < 0)
            {
                console.log("trying to downvote more than once");
                return res.status(500).send({errors: {error: "trying to downvote more than once"}})
            }   
            //Bypass if user has already upvoted
            else if(userHasCountedObj.userCount >= 1 && inputCount > 0) {
                console.log("user already upvoted");
                return res.status(500).send({errors: {error: "trying to upvote more than once"}})
                
            }

            else {
                //UserCount object's count property is summed with the new input count
                userHasCountedObj.userCount += inputCount;
                //Replace the object in the post usersWhoCounted array to the new object
                comment.usersWhoCounted[userHasCountedIndex] = userHasCountedObj;
                //Add the new input count to the current post's count
                comment.count += inputCount;
            }
                
        }
        
        //else if user id is not in the array
        else if(userHasCountedIndex == -1) {
            //add new count object to array with updated uid and count
            let userCountObj = {
                userCount: inputCount,
                userId: inputUid
            }
            
            //increment post count
            comment.count += inputCount;
            //add new user obj to the post's users who counted array
            comment.usersWhoCounted.push(userCountObj)
        }
       
        
        
        
        //Save the updated count
        comment.save((err) => {
            if (err) {
                console.log(err);
                return res.send({errors: {error: err.message}})
            }
            else {
                console.log(comment.usersWhoCounted, "userswhocountedArr");
                return res.send({
                    count: comment.count,
                    commentId: comment._id
                })
            }
        })

    })

})

//route for creating comments
router.post("/api/users/create_comment", (req, res) => {
    //extract user post fields from request
    const commentUid = req.body.userId;
    const commentDescription = req.body.description;
    const inputToken = req.body.token;
    const postId = req.body.postId;

    //search db by id for User
    User.findById(commentUid, (err, user) => {
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
        }
        console.log(JSON.stringify(user), "user obj in create_comment endpoint");
        //compare user token against inputToken
        //if not a match
        if (user.token != inputToken) {
            //return error
            
            return res.send({errors: {error: "User not logged in."}})
            
        } 
        
        //create new post and update its uid field and description from the form.
        let newComment = new Comment({
            uid: commentUid,
            description: commentDescription,
            name: user.name,
            postId: postId
        })
        
        //If not save the new comment to the database.
        newComment.save(
            (err, newComment) => {
                if(err) {
                    return res.json({
                        errors: {error: err.message}
                    })
                    
                }
                else {
                    
                    //Save current user back to the database and return user and new log as json
                    
                        
                    return res.send({
                        name: newComment.name, 
                        description: newComment.description,
                        commentId: newComment._id,
                        commentDate: newComment.date,
                        userId: newComment.uid
                    })
                        
                                
                    
                }   
            }
        )
                  
    })

})

//Route for getting a list of the latest posts
router.post("/api/users/get_comments", (req, res) => {
    const postId = req.body.postId;

    Comment.find({postId: postId})
    .sort({date: 'desc'})
    .limit(10)
    .exec((err, comments) => {
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
        }
        return res.send({latestComments: comments})
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
            return res.send({errors: {error: err.message}})
        }

        //compare user token against inputToken
        //if not a match
        if (user.token != inputToken) {
            //return error
            
            return res.send({errors: {error: "User not logged in."}})
            
        } 
        
        //create new post and update its uid field and description from the form.
        let newPost = new Post({
            uid: postUid,
            description: postDescription,
            title: postTitle,
            name: user.name,
        })
        

        
        //Verify title doesn't already exist in db
        Post.countDocuments({title: postTitle}, (postError, count) => {
            if (postError) {
                return res.send({errors: {error: postError.message}});
            }
            if (count > 1) {
                return res.send({errors: {error: "Title already exists."}});
            }
            else {
                //If not save the new post to the database.
                newPost.save(
                    (err, newPost) => {
                        if(err) {
                            return res.json({
                                errors: {error: err.message}
                            })
                            
                        }
                        else {
                            //Add new post to current user's list post array.
                            user.posts.push(newPost);
                            //Save current user back to the database and return user and new log as json
                            user.save((err) => {
                                if (err) {
                                    return res.json({
                                        errors: {error: err.message}
                                    })
                                }
                                else {
                                    return res.send({
                                        name: user.name, 
                                        newPost: newPost,
                                        title: postTitle,
                                        description: newPost.description,
                                        postId: newPost.id,
                                        postDate: newPost.date
                                    })
                                } 
                                     
                            })
                        }   
                    }
                )
            }
              
        })
            
    })

})

//route for creating posts
router.post("/api/users/delete_post", (req, res) => {
    //extract user post fields from request
    const postUid = req.body.postUserId;
    const inputToken = req.body.token;
    const postId = req.body.postId;

    //Search User documents to see if input token matches current users token
        //return an error if user or token doesn't match
    User.findById(postUid, (err, user) => {
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
        }

        //compare user token against inputToken
        //if not a match
        if (user.token != inputToken) {
            //return error
            
            return res.send({errors: {error: "Cannot delete post you didn't create."}})
            
        }
        
        //Search for post by its id and delete from db
        Post.deleteOne({_id: postId}, (err, post) => {
            if (err) {
                console.log(err);
                return res.send({errors: {error: err.message}})
            }
            return res.send({
                name: user.name, 
                postId: postId
                
            })

        }) 
            
    })

})
//Route for getting a list of the latest posts
router.post("/api/users/get_posts", (req, res) => {
    const skip = req.body.skip;
    
    Post.find({})
    .sort({date: 'desc'})
    .skip(skip)
    .limit(10)
    .exec((err, posts) => {
        if (err) {
            console.log(err);
            return res.send({errors: {error: err.message}})
        }
        return res.json({latestPosts: posts})
    })

})
module.exports = router;