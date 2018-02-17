const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// /users Routes
  // users login route
router.get('/login', (req, res) => {
  res.render('users/login');
});
  // users register route
router.get('/register', (req, res) => {
  res.render('users/register');
});
  // users login form route (POST w passport)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});
  // users register form route (POST w bcrypt)
router.post('/register', (req, res) => {
    // server-side form validation
  let errors = [];
  let pwLength = 8;
  if (req.body.password !== req.body.password2) errors.push({text: 'Passwords do not match.'});
  if (req.body.password.length < pwLength) errors.push({text: `Passwords must be at least ${pwLength} long.`});
  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    // validate if user email already exists
    User.findOne({ email: req.body.email })
        .then(user => {
          if (user) {
            req.flash('error_msg', 'Email already exists.');
            res.redirect('/users/register');
          } else {
            // encrypt password and insert user into DB
            const newUser = new User({
              name: req.body.name,
              email: req.body.email,
              password: req.body.password
            });
            // bcrypt
            bcrypt.genSalt(10, (err, salt) => {
              // if (err) throw err;
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                       .then(user => {
                         req.flash('success_msg', 'You are now registered, and can login.');
                         res.redirect('/users/login');
                       })
                       .catch(err => {
                         console.log(err);
                         return;
                       });
              });
            });
          }
        });
  }
});
  // users logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out.');
  res.redirect('/users/login');
});

module.exports = router;
