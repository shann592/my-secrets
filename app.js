// importing required modules
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt'); // bcrypt hashing package
//const saltRounds = 10; // salt rounds are the number of times a random number will added to string and the result is hashed again
//const md5 = require('md5'); // Hashing function package
// const encrypt = require('mongoose-encryption'); 
// required modules for passport js
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


// initialising express app
const app = express();

// basic project setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,
}));
// initializing passport
app.use(passport.initialize());
// starting the session
app.use(passport.session());

// DB connection
mongoose.connect('mongodb://localhost:27017/userDB')
    .then(result => console.log('MongoDB connected successfully.'))
    .catch(error => console.log(`Error occured: ${error}`));

// user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// adding passportLocalMongoose to the plugin
userSchema.plugin(passportLocalMongoose);

// adding encryption to password field in DB
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// user model
const User = mongoose.model('User', userSchema);

// serialization for creation of cookies and deserializeUser for destructuring cookies to get user data.
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app routes
app.get('/', (req, res) => {
    res.render('home')
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {

    req.logout((err) => {
        if (err) {
            res.send(err);
        }
        res.redirect('/');
    });
});

app.post('/register', (req, res) => {

    User.register({ username: req.body.username },
        req.body.password, (err, user) => {
            if (err) {
                console.log(err);
            }
            else {
                passport.authenticate("local")
                    (req, res, () => {
                        res.redirect('/secrets');
                    });
            }
        });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userToBeChecked = new User({
        username: username,
        password: password,
    });

    req.login(userToBeChecked, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate('local')
                (req, res, () => {
                    User.find({ username: req.user.username },
                        (err, docs) => {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect('/secrets');
                            }
                        })
                })
        }
    });
});

// server listening requests at port 3000
app.listen(3000, () => console.log('Server is running on port 3000'));
