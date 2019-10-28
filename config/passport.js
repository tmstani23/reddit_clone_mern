const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
require('dotenv').config();

const opts = {};
//extract the web token from the header and save into the opts object
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//Add secret key to the opts object
opts.secretOrKey = process.env.secretOrKey;

//export strategy as passport object
module.exports = passport => {
    passport.use(
        //create new jwt strategy and search db for user
        new JwtStrategy(opts, (jwt_payload, done) => {
            //jwt_payload is an object literal containing the decoded JWT payload.
            //search the db for a user with the same id as the one contained in the payload
            User.findById(jwt_payload.id)
                .then(user => {
                    //if the user id matches return the user
                    if (user) {
                        //done is a passport error first callback accepting arguments done(error, user, info)
                        return done(null, user);
                    }
                    return done(null, false);
                })
                .catch(err => console.log(err));
        })
    );
};