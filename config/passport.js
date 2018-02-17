const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = mongoose.model('users');

module.exports = function (passport) {
  // Login
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      // Find & Match User
      User.findOne({ email })
          .then(user => {
            if (!user) {
              return done(null, false, { message: 'User not found.' });
            }
            // Match password input with encrypted password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect password.' });
              }
            });
          });
    })
  );
  // Serialize and Deserialize User
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
