var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/polls');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'rahulharkisanka';


module.exports = function(app, passport){

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));

  passport.serializeUser(function(user, done) {
    if (user.active) {
        token = jwt.sign({email: user.email, name: user.name}, secret, {expiresIn: '24h'});
    } else {
        token = "inactive/error";
    }
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: '469579006753887',
    clientSecret: '55c56e3633cd6f96dbe204b12c444a32',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile._json.email);

      User.findOne({email: profile._json.email}).select('email password name active').exec(function(err, user){
        if (err) done(err);
        if (user && user != null) {
          // console.log('located user rahul.harkisanka in db');
          // console.log('user located is' + user);
          done (null, user);
        } else {
          done (err);
        }
      });
      // done (null, profile);
    }
  ));

  passport.use(new TwitterStrategy({
    consumerKey: '4DEQ3pT7bAkjklqII277XO2R3',
    consumerSecret: '8R3q61VCIxbybSBzwx7KlAGmXNTpqtJje8SUNhHYQKoIWbYrlj',
    callbackURL: "http://localhost:3000/auth/twitter/callback",
    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
  },
    function(token, tokenSecret, profile, done) {
      // console.log('twitter profile!');
      // User.findOrCreate(..., function(err, user) {
      //   if (err) { return done(err); }
      //   done(null, user);
      // });
      // console.log(profile);
      User.findOne({email: profile.emails[0].value}).select('email password name active').exec(function(err, user){
        if (err) done(err);
        if (user && user != null) {
          // console.log('located user rahul.harkisanka in db');
          // console.log('user located is' + user);
          done (null, user);
        } else {
          done (err);
        }
      });
      // done (null, profile);
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: '614030143230-09vbrhv8243c96a5eof17niffh4m0v7t.apps.googleusercontent.com',
    clientSecret: 'yZjYzfn1z-7wvmfRmcTc3Q0n',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      //  User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //    return done(err, user);
      //  });
      User.findOne({email: profiles.email[0].value}).select('email password name active').exec(function(err, user){
        if (err) done(err);
        if (user && user != null) {
          // console.log('located user rahul.harkisanka in db');
          console.log('user located is' + user);
          done (null, user);
        } else {
          done (err);
        }
      });
  }
));


  //FACEBOOK ROUTES
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res) {
    // console.log('reached here, ' + token);
    // console.log('From passport js page - will redirect to /facebook/' + token);
    return res.redirect('/facebook/' + token);
  }
  );

  // Note that the URL of the callback route matches that of the callbackURL option specified when configuring the strategy.
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));


  //TWITTER ROUTES
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res) {
      return res.redirect('/twitter/' + token);
  });

  app.get('/auth/twitter', passport.authenticate('twitter', {scope : 'email' }));


  //GOOGLE ROUTES
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
    res.redirect('/google/' + token);
  });

  app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));



  return passport;
  };
