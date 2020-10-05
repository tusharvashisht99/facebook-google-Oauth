const express = require('express');
const router = express.Router();
const data = require('../models/fbUser');

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

router.get('/facebook',passport.authenticate('facebook',{scope:'email'}))
router.get('/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/fbDashboard',
                                      failureRedirect: '/users/login' }));
module.exports = router;