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

router.post('/', (req, res) => {
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

            res.render('item', {
                type: 'banks',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.banks
            });
            return;
        }

        if(Array.isArray(req.body.password)) {
            req.body.password.forEach((password) => {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if(err) {
                        console.error(err);
                        return;
                    }

                    let password = new Password({
                        entryID: bank._id,
                        password: hash
                    });

                    password.save((err) => {
                        if(err) {
                            return console.error(err);
                        }
                    });
                })
            });
        } else {
            bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                if(err) {
                    console.error(err);
                    return;
                }

                let password = new Password({
                    entryID: bank._id,
                    password: hash
                });

                password.save((err) => {
                    if(err) {
                        return console.error(err);
                    }
                });
            })
        }
    });

    req.user.banks.push(bank);
    req.user.save();

    res.render('item', {
        type: 'banks',
        confirmationMessage: 'Record added successfully',
        items: req.user.banks
    });

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
