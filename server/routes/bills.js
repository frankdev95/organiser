const express = require('express');
const router = express.Router();

const Bill = require('../models/bill').model;
const User = require('../models/user');

router.get('/:message?', (req, res) => {
    if(req.isAuthenticated()) {
        let confirmationMessage = '';

        if(req.params.message === 'delete') {
            confirmationMessage = 'Record Successfully deleted.'
        }

        res.render('item', {
            type: 'bills',
            confirmationMessage: confirmationMessage,
            items: req.user.bills
        });
    } else {
        res.redirect('/authentication/login');
    }
});


router.post('/', (req, res) => {

    let bill = new Bill({
        name: req.body.name,
        type: req.body.type,
        creditor: req.body.creditor,
        amount: req.body.amount,
        dueDate: req.body['date due'],
        status: req.body.status
    });

    bill.save((err) => {
        if(err) {
            console.error(err);
            res.render('item', {
                type: 'bills',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.bills
            });
        }

        req.user.bills.push(bill);
        req.user.save();

        res.render('item', {
            type: 'bills',
            confirmationMessage: 'Record added successfully',
            items: req.user.bills
        });
    });
});

router.delete('/:id',  async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            bills: {_id: req.params.id}
        }
    }, null, async (err) => {
        if(err) {
            console.error(err);
            res.redirect('/bills');
        }
    });

    await Bill.deleteOne({_id: req.params.id}, null, (err) => {
        if(err) {
            console.error(err);
            res.redirect('/bills');
        }
    });

    res.redirect('/bills/delete');
});

module.exports = router;
