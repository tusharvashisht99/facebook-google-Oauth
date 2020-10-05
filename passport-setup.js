var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const gUser = require('./models/gUser');
const express = require('express');
const router = express.Router();
const session = require('express-session');



// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: '323662544500-dis53ibl2b6fibf89hqgvj22lrn7us1d.apps.googleusercontent.com',
    clientSecret: '5-lthdhHzzUWn4SeEoLNxn80',
    callbackURL: "http://localhost:5000/auth/google/callback",
    profileFields: ['id','name', 'gender', 'picture.type(large)', 'email']
  },
  function (accessToken, refreshToken, profile, done) {
    gUser.findOne({ 'uid': profile.id }, (err, user) => {
      if (err) { return done(err); }
      if (user) {
        return done(null, user); // user found, return that user
      } else {
        // if there is no user found with that facebook id, create them
        var newUser = new gUser();

        // set all of the facebook information in our user model
        newUser.uid = profile.id; // set the users facebook id                                   
        newUser.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
        // newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
        newUser.pic = profile.photos[0].value
        // save our user to the database
        newUser.save(function () {
       // if successful, return the new user
          return done(null, newUser);
        });
      }

    });}
));
passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    gUser.findById(id, function (err, user) {
      done(err, user);
    });
  });


  router.use(express.json());
    router.use(express.urlencoded({ extended: false }));
    // Express session
    router.use(
      session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
      })
    );