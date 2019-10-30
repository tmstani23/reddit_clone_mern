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
        return res.status(400).json(errors);
    }
    //Search User email fields for existing email
    User.findOne({email: req.body.email})
        .then(user => {
            //if email already exists return email exists response
            if (user) {
                return res.status(400).json({email: "Email already exists"});
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
                            .then(user => res.json(user))
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
        return res.status(400).json(errors);
    }
    //Extract email and pass from the login form fields
    const email = req.body.email;
    const password = req.body.password;

    //Search for user in database by email
    User.findOne({email})
        .then(user => {
            //If user doesnt exist send an error
            if (!user) {
                return res.status(404).json({emailnotfound: "Email not found"})
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
                        jwt.sign(
                            payload,
                            secretOrKey,
                            {
                                //expires in 1 year and seconds
                                expiresIn: 31556926
                            },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer" + token
                                })
                            }
                        )
                    }
                    else {
                        return res.status(400).json({passwordincorrect: "Password incorrect"});
                    }
                    
                })
            

        })

})

module.exports = router;