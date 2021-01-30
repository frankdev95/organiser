    const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

function renderLogin(res, confirmationMessage, usernamePlaceholder) {
    res.render('login', {
        confirmationMessage: confirmationMessage,
        usernamePlaceholder: usernamePlaceholder
    });
}

router.get('/login', (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('login', {
            confirmationMessage: null,
            usernamePlaceholder: null
        });
    }
});

router.get('/register', (req, res) => {
    res.render('registration', {confirmationMessage: null});
});

router.get('/logout',(req, res) => {
    req.logout()
    res.redirect('/authentication/login');
});

router.post('/register', (req, res) => {
    /* register a new user using the passport register method on the user schema, this method hashes and salts the
      password field for you */
    User.register({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        profileImage: '/images/home/profile.jpg'
    }, req.body.password, (err) => {
        if(err.name === 'MongoError' && err.code === 11000) {
            return res.render('registration', {
                confirmationMessage: 'An account registered with this email address already exists.'
            });
        } else if(err.name === 'UserExistsError') {
            return res.render('registration', {
                confirmationMessage: 'An account registered with this username already exists.'
            });
        } else {
            return res.render('login', {
                confirmationMessage: 'Registration successful, you can now login.',
                usernamePlaceholder: req.body.username
            });
        }
    });
});

router.post('/login', (req, res) => {

    /* use passports authenticate method which looks through registered users, and checks them against credentials
       entered within the login post route. If a user is returned, specifying the correct credentials given, then the
       user is redirected to the home page */
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            return renderLogin(res, err, null);
        }
        if(!user) {
            return renderLogin(res, 'Incorrect username or password, please try again.', null);

        }
        req.logIn(user, (err) => {
            if(err) {
                renderLogin(res, err, null);
                return;
            }
            return res.redirect('/home');
        });
    })(req, res);
});

module.exports = router;

