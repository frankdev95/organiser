require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
    "mongodb+srv://frank-admin:14RK68SG7nrXqQ7g@cluster0.makro.mongodb.net/test?retryWrites=true&w=majority";
const url =
    "mongodb://localhost:27017/userDB";

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {});

const patterns = {
    name: /^[a-z ,.'-]+$/i,
    email: /^([a-z\d."+\-_]+)@([a-z\d-.[\]]+)\.([a-z\d]{2,8})(\.[a-z]+)?$/i,
    username: /^[a-z\d]{5,12}$/i,
    password: /^(?=.*[a-z])(?=.*[\d])(?=.*[\W])[a-z\d\W]{8,25}$/i,
}

const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Please provide a valid name'],
        match: patterns.name
    },
    username: {
        type: String,
        required: [true, 'Please provide a valid username'],
        match: patterns.username
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, 'Please provide an email address'],
        match: patterns.email
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        match: patterns.password
    }
});

const encKey = process.env.ENC_KEY;
const sigKey = process.env.SIG_KEY;

userSchema.plugin(encrypt, {encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

let port = process.env.PORT;
if(port === null || port === undefined) {
    port = 3000;
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log('Port running on port ' + port);
});

app.get('/login', (req, res) => {
    res.render('login', {
        confirmationMessage: null,
        usernamePlaceholder: null
    });
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('registration');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.post('/register', (req, res) => {
    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    newUser.save((err) => {
        if(err) {
            console.log(err);
        } else {
            let confirmationMessage = 'Registration successful, please login using credentials.'
            res.render('login', {
                confirmationMessage: confirmationMessage,
                usernamePlaceholder: req.body.username
            });
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username},function(err, user) {
        if(err) {
            console.log(err);
        } else {
            if(user === null) {
                let confirmationMessage = 'Username does not exist, please enter a valid username.';
                res.render('login', {
                    confirmationMessage: confirmationMessage,
                    usernamePlaceholder: null
                });
            } else {
               if(user.password === password) {
                   res.render('home');
               } else {
                   let confirmationMessage = 'Password does not match username, please enter the correct password.';
                   res.render('login', {
                       confirmationMessage: confirmationMessage,
                       usernamePlaceholder: username
                   })
               }
           }
        }}
    )
});
