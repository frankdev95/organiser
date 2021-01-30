const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate');

const accountSchema = require('./account').schema;
const bankingSchema = require('./banking').schema;
const billSchema = require('./bill').schema;
const cardSchema = require('./card').schema;

const patterns = require('../regex/credential-validation');

const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, 'Please provide a valid name'],
        match: patterns.name
    },
    username: {
        type: String,
        required: [true, 'Please provide a valid username'],
        unique: true,
        match: patterns.username
    },
    profileImage: String,
    email: {
        type: String,
        lowercase: true,
        required: [true, 'Please provide an email address'],
        unique: true,
        match: patterns.email
    },
    password: {
        type: String
    },
    accounts: [accountSchema],
    banks: [bankingSchema],
    bills: [billSchema],
    cards: [cardSchema]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
