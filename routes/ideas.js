const express = require('express');
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

const router = express.Router();

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// /ideas Routes
  // ideas index route
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
      .sort({ Date: 'desc' })
      .then(ideas => {
        res.render('ideas/index', {
          ideas
        });
      });
});
  // add idea form route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});
  // edit idea form route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({ _id: req.params.id })
      .then(idea => {
        if (idea.user !== req.user.id) {
          req.flash('error_msg', 'Unauthorized.');
          res.redirect('/ideas');
        } else {
          res.render('ideas/edit', {
            idea
          });
        }
      });
});
  // process add form route (handling POST request)
router.post('/', ensureAuthenticated, (req, res) => {
    // server-side form validation
  let errors = [];
  if (!req.body.title) errors.push({text: 'Please add a title.'});
  if (!req.body.details) errors.push({text: 'Please add some details.'});
  if (errors.length > 0) {
    res.render('ideas/add', {
      errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea (newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added!');
        res.redirect('/ideas');
      });
  }
});
  // process edit form route (handling PUT request)
router.put('/:id', ensureAuthenticated,  (req, res) => {
  Idea.findOne({ _id: req.params.id })
      .then(idea => {
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save()
            .then(idea => {
              req.flash('success_msg', 'Video idea updated!');
              res.redirect('/ideas');
            })
      });
});
  // process delete idea form route (handling DELETE request)
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({ _id: req.params.id })
      .then(() => {
        req.flash('success_msg', 'Video idea removed!');
        res.redirect('/ideas');
      });
});

module.exports = router;
