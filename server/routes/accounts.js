const express = require('express');
const router = express.Router();

const Account = require('../models/account').model;
const User = require('../models/user');

router.get('/:message?', (req, res) => {
    if(req.isAuthenticated()) {
        let confirmationMessage = '';

        if(req.params.message === 'delete') {
            confirmationMessage = 'Record Successfully deleted.'
        }

        res.render('item', {
            type: 'accounts',
            confirmationMessage: confirmationMessage,
            items: req.user.accounts
        });
    } else {
        res.redirect('/authentication/login');
    }
});

router.post('/', (req, res) => {

    let account = new Account({
        name: req.body.name,
        type: req.body.type,
        holder: req.body['account holder'],
        company: req.body.company,
        URL: req.body.url,
        username: req.body.username,
        password: req.body.password,
        state: req.body.states
    });

    account.save(async (err) => {
        if(err) {
            console.error(err);
             return res.render('item', {
                type: 'accounts',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.accounts
            });
        }

        await req.user.accounts.push(account);
        await req.user.save();

        res.render('item', {
            type: 'accounts',
            confirmationMessage: 'Record added successfully',
            items: req.user.accounts
        });
    });
});


router.post('/:id', async (req, res) => {
    if(req.body.password) {
        req.user.authenticate(req.body.password, (err, user, passwordError) => {
            if(passwordError) {
                console.error(passwordError);
                res.send({
                    message: "Incorrect Password"
                });
            } else {
                Account.findById(req.params.id, (err, account) => {
                    if(err) {
                        console.error(err);
                        return res.send({
                            message: "Could not find details, please try again."
                        });
                    }
                    res.send({
                        password: account.password
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
            accounts: {_id: req.params.id}
        }
    }, null, async (err) => {
        if(err) {
            console.error(err);
            return res.redirect('/accounts');
        }

        await Account.deleteOne({_id: req.params.id}, null, (err) => {
            if(err) {
                console.error(err);
                return res.redirect('/accounts');
            }
        });
    });

    res.redirect('/accounts/delete');
});

module.exports = router;
