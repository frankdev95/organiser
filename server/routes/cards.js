const express = require('express');
const router = express.Router();

const Card = require('../models/card').model;
const User = require('../models/user');

router.get('/:message?', (req, res) => {
    if(req.isAuthenticated()) {
        let confirmationMessage = '';

        if(req.params.message === 'delete') {
            confirmationMessage = 'Record Successfully deleted.'
        }

        res.render('item', {
            type: 'cards',
            confirmationMessage: confirmationMessage,
            items: req.user.cards
        });
    } else {
        res.redirect('/authentication/login');
    }
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
                Card.findById(req.params.id, (err, card) => {
                    if(err) {
                        console.error(err);
                        return res.send({
                            message: "Could not find details, please try again."
                        })
                    }

                    if(req.body.field === "securityID") {
                        res.send({
                            password: card.securityID
                        });
                    } else {
                        res.send({
                            password: card.pin
                        });
                    }
                });
            }
        });
    } else {
        res.send({
            message: "Please enter your account password"
        });
    }
});

router.post('/', (req, res) => {

    let card = new Card({
        name: req.body.name,
        type: req.body.type,
        holder: req.body['account holder'],
        provider: req.body['card provider'],
        number: req.body['card number'],
        expiryDate: req.body['expiry date'],
        securityID: req.body['security id'],
        pin: req.body.pin,
        state: req.body.state
    });

    card.save(async (err) => {
        if(err) {
            console.error(err);
            res.render('item', {
                type: 'cards',
                confirmationMessage: 'Unable to add new record, please try again.',
                items: req.user.cards
            });
        }

        await req.user.cards.push(card);
        await req.user.save();

        res.render('item', {
            type: 'cards',
            confirmationMessage: 'Record added successfully',
            items: req.user.cards
        });
    });
});

router.delete('/:id',  async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            cards: {_id: req.params.id}
        }
    }, null, async (err) => {
        if(err) {
            console.error(err);
            return res.redirect('/cards');
        }
    });

    await Card.deleteOne({_id: req.params.id}, null, (err) => {
        if(err) {
            console.error(err);
            return res.redirect('/cards');
        }
    });

    res.redirect('/cards/delete');
});

module.exports = router;
