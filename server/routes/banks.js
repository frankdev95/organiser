const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Bank = require('../models/banking').model;
const Password = require('../models/password');
const User = require('../models/user');

router.get('/:message?', (req, res) => {
    if(req.isAuthenticated()) {
        let confirmationMessage = '';

        if(req.params.message === 'delete') {
            confirmationMessage = 'Record Successfully deleted.'
        }

        res.render('item', {
            type: 'banks',
            confirmationMessage: confirmationMessage,
            items: req.user.banks
        });
    } else {
        res.redirect('/authentication/login');
    }
});

router.post('/', async (req, res) => {
    let bank = new Bank({
        name: req.body.name,
        type: req.body.type,
        holder: req.body['account holder'],
        bank: req.body.bank,
        URL: req.body.url,
        username: req.body.username,
    });

    bank.save((err, bank) => {
        if(err) {
            console.error(err);
            return res.render('item', {
                type: 'banks',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.banks
            });
        }

        if(Array.isArray(req.body.password)) {
            req.body.password.forEach((password) => {
                let passwordEntry = new Password({
                    entryID: bank._id,
                    password: password
                });

                passwordEntry.save((err) => {
                    if(err) {
                        return console.error(err);
                    }
                });
            });
        } else {
            let password = new Password({
                entryID: bank._id,
                password: req.body.password
            });

            password.save((err) => {
                if(err) {
                    return console.error(err);
                }
            });
        }
    });

    await req.user.banks.push(bank);
    await req.user.save();

    res.render('item', {
        type: 'banks',
        confirmationMessage: 'Record added successfully',
        items: req.user.banks
    });
});

router.post('/:id', (req, res) => {
    if(req.body.password) {
        req.user.authenticate(req.body.password, (err, user, passwordError) => {
            if(passwordError) {
                console.error(passwordError);
                res.send({
                    message: "Incorrect Password"
                });
            } else {
                Bank.findById(req.params.id, (err, bank) => {
                    if(err) {
                        console.error(err);
                        return res.send({
                            message: "Could not find details, please try again."
                        });
                    }
                    Password.find({entryID: bank._id},(err, results) => {
                        if(err) {
                            console.error(err);
                            return res.send({
                                message: "Could not find details, please try again."
                            });
                        }
                        if(results.length > 1) {
                            let passwords = [];
                            for(let i = 0; i < results.length; i++) {
                                passwords.push(results[i].password);
                            }
                            res.send({
                                password: passwords
                            });
                        } else {
                            res.send({
                                password: results[0].password
                            })
                        }


                    });

                });
            }
        });
    } else {
        res.send({
            message: "Please enter your account password"
        });
    }
});

router.delete('/:id',  async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            banks: {_id: req.params.id}
        }
    }, null, async (err) => {
        if(err) {
            console.error(err);
            res.redirect('/banks');
        }
    });

    await Bank.deleteOne({_id: req.params.id}, null, (err) => {
        if(err) {
            console.error(err);
            res.redirect('/banks');
        }
    });

    await Password.deleteMany({entryID: req.params.id}, null, (err) => {
        if(err) {
            console.error(err);
            res.redirect('/banks')
        }
    })


    res.redirect('/banks/delete');
});

module.exports = router;
