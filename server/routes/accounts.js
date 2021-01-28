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

    account.save((err) => {
        if(err) {
            console.error(err);
            res.render('item', {
                type: 'accounts',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.accounts
            });
        }

        req.user.accounts.push(account);
        req.user.save();

        res.render('item', {
            type: 'accounts',
            confirmationMessage: 'Record added successfully',
            items: req.user.accounts
        });
    });
});

router.delete('/:id',  async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            accounts: {_id: req.params.id}
        }
    }, null, async (err) => {
        if(err) {
            console.error(err);
            res.redirect('/accounts');
        }
    });

    await Account.deleteOne({_id: req.params.id}, null, (err) => {
        if(err) {
            console.error(err);
            res.redirect('/accounts');
        }
    });

    res.redirect('/accounts/delete');
});

module.exports = router;
