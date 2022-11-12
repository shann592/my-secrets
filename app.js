// importing required modules
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption'); 


// initialising express app
const app = express();

// basic project setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// DB connection
mongoose.connect('mongodb://localhost:27017/userDB')
    .then(result => console.log('MongoDB connected successfully.'))
    .catch(error => console.log(`Error occured: ${error}`));

// user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// adding encryption to password field in DB
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// user model
const User = mongoose.model('User', userSchema);

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

app.post('/register', (req, res) => {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password,
    });
    newUser.save()
        .then(output => res.render('secrets'))
        .catch(error => res.send(error));
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.find({ email: username }).limit(1)
        .then(outcome => {
            if (outcome.password = password) {
                res.render('secrets');
            } else {
                res.send('Email not found. Please register.');
            }
        })
        .catch(error => res.send(error));
});

// server listening requests at port 300
app.listen(3000, () => console.log('Server is running on port 3000'));
