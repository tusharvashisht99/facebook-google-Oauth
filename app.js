const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
// require('./passport')(passport);
require('./passport-setup');

const { Strategy } = require('passport-local');
const fbUser = require('./models/fbUser');
const gUser = require('./models/gUser');

const FacebookStrategy = require('passport-facebook').Strategy;

//facebook authentication
passport.use(new FacebookStrategy({
  clientID: 365991241193432,
  clientSecret: 'b3a1688c731e1727b5779ef69ed4b635',
  callbackURL: "http://localhost:5000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'emails']
},
  function (accessToken, refreshToken, profile, done) {
    fbUser.findOne({ 'uid': profile.id }, (err, user) => {
      if (err) { return done(err); }
      if (user) {
        return done(null, user); // user found, return that user
      } else {
        // if there is no user found with that facebook id, create them
        var newUser = new fbUser();

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

    });}))
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      gUser.findById(id, function (err, user) {
        done(err, user);
      });
    });

    //.env file
    dotenv.config();


    //EJS
    app.use(expressLayouts);
    app.set('view engine', 'ejs');

    //BODY PARSER
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    // Express session
    app.use(
      session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
      })
    );

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({
      secret: "hello", resave: false,
      saveUninitialized: true
    }))
    //Routes
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/user'));
    app.use('/auth', require('./routes/auth'));

    //fbdashboard
    app.get('/fbDashboard',(req,res)=>{
      res.render('fbDashboard')
     
      // console.log(fbUser);
    })

    //logout
    app.get('/logout', function(req, res){
      req.logout();

      req.session.destroy();
      // res.redirect('https://www.facebook.com/logout.php?next=localhost:3000/logout&access_token='+req.body['accessToken']);
    });
   
//failed
app.get('/failed',(req,res)=>{
  res.send('you are failed to login!')
})
app.get('/good',function (req, res, next) {
  console.log(req.user);
  if(req.user){
  next()}else{res.send("sorry!please logg-in!")}
},(req,res)=>{
  res.send(`welcome ${req.user.name}`)
})

//google oauth2.0
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    res.redirect('/good');
  });




    //Mongoose connection
    mongoose.connect(
      process.env.DB_CONNECT,
      { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
      err => {
        if (err) {
          console.log(err);
        } else {
          console.log('MongoDB connection success !!');
        }
      }
    );



    app.listen(5000, console.log('connected to 5000!'));