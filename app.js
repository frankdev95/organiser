require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const encrypt = require('mongoose-encryption');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const ObjectID = require('mongodb').ObjectID;

const confirmationMessages = {
    'delete' : 'Record successfully deleted.'
}

const app = express();

let userName;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: 'musOsEAjkWi9s5DAOw3QPuC9fhEC9wTG9PV36RvV3kW+fI1OR5vRM2MbM8bJqqyUgnGfQ1E1/nf3bsv0omFrtA==',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
    "mongodb+srv://frank-admin:14RK68SG7nrXqQ7g@cluster0.makro.mongodb.net/organiserDB?retryWrites=true&w=majority";
const url =
    "mongodb://localhost:27017/organiserDB";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true
}

mongoose.connect(uri, options)
    .then(() => console.log('Successfully connected to DB'))
    .catch((err) => console.error(err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {});

/*********************REGEX PATTERNS*********************/
// used for validation to ensure user registration details match the required criteria.

const patterns = {
    name: /^[a-z ,.'-]+$/i,
    email: /^([a-z\d."+\-_]+)@([a-z\d-.[\]]+)\.([a-z\d]{2,8})(\.[a-z]+)?$/i,
    username: /^[a-z\d]{5,12}$/i,
    password: /^(?=.*[a-z])(?=.*[\d])(?=.*[\W])[a-z\d\W]{8,25}$/i,
}

/*********************SCHEMAS*********************/

const passwordSchema = new mongoose.Schema({
    entryID: {
        type: ObjectID,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const accountSchema = new mongoose.Schema({
    name: String,
    type: String,
    holder: String,
    company: String,
    URL: String,
    username: String,
    password: String,
    state: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

const bankingSchema = new mongoose.Schema({
    name: String,
    type: String,
    holder: String,
    bank: String,
    URL: String,
    username: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

const billSchema = new mongoose.Schema({
    name: String,
    type: String,
    creditor: String,
    amount: Number,
    dueDate: Date,
    status: String,
    date: {
        type: Date,
        default: Date.now()
    }
});

const cardSchema = new mongoose.Schema({
    name: String,
    type: String,
    holder: String,
    provider: String,
    number: Number,
    expiryDate: Date,
    securityID: String,
    pin: String,
    state: String,
    date: {
        type: Date,
        default: Date.now()
    }

});

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

/*********************PLUGINS*********************/

userSchema.plugin(passportLocalMongoose);
accountSchema.plugin(encrypt, {
    encryptionKey: process.env.ENC_KEY,
    signingKey: process.env.SIG_KEY,
    encryptedFields: ['password']
});
cardSchema.plugin(encrypt, {
    encryptionKey: process.env.ENC_KEY,
    signingKey: process.env.SIG_KEY,
    encryptedFields: ['securityID', 'pin']
});

/*********************MODELS*********************/

const Password = new mongoose.model('Password', passwordSchema);
const User = new mongoose.model('User', userSchema);
const Account = new mongoose.model('Account', accountSchema);
const Bank = new mongoose.model('Bank', bankingSchema);
const Bill = new mongoose.model('Bill', billSchema);
const Card = new mongoose.model('Card', cardSchema);

/*********************HELPER FUNCTIONS*********************/

function renderLogin(res, confirmationMessage, usernamePlaceholder) {
    res.render('login', {
        confirmationMessage: confirmationMessage,
        usernamePlaceholder: usernamePlaceholder
    });
}


function findUserAddItem(username, type, item, response) {

    User.findOne({'username': username}, type, null, (err, user) => {
        if(err) {
            console.error(err);
            return;
        }
        user[type].push(item);
        user.save((err, user) => {
            if(err) {
                response.render('item', {
                    type: type,
                    confirmationMessage: 'New record unsuccessful, please try again.',
                    items: user[type]
                });
            } else {
                response.render('item', {
                    type: type,
                    confirmationMessage: 'Record added successfully.',
                    items: user[type]
                });
            }
        })
    });
}

/*********************PASSPORT CONFIGURATION*********************/
// used to keep track of existing user sessions and handle new user registration using authentication.

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let port = process.env.PORT;
if(port === null || port === undefined) {
    port = 3000;
}

app.listen(port, () => {
    console.log('Port running on port ' + port);
});

app.get('/login', (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('login', {
            confirmationMessage: null,
            usernamePlaceholder: null
        });
    }

});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('registration', {confirmationMessage: null});
});

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login');

});

app.get('/home', (req, res) => {
    if(req.isAuthenticated()) {
        let firstNameRegex = /([a-z]+)(?=\s)/i;
        userName = req.user.name.match(firstNameRegex)[0];
        res.render('home', {
            userName: userName
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/manage', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('item', {
            type: 'accounts',
            confirmationMessage: '',
            items: req.user.accounts
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/manage/:type/:action?', (req, res) => {
    if(req.isAuthenticated()) {
        if(!req.params.action) {
            res.render('item', {
                type: req.params.type,
                confirmationMessage: '',
                items: req.user[req.params.type]
            });
        } else {
            res.render('item', {
                type: req.params.type,
                confirmationMessage: confirmationMessages[req.params.action],
                items: req.user[req.params.type]
            });
        }

    } else {
        res.redirect('/login')
    }

});

app.get('/get/:type/:info', (req, res) => {
    if(req.params.type === 'accounts') {
        if(req.params.info === 'count') {
            Account.countDocuments({}, (err, count) => {
                res.send({
                    info: count
                })
            });
        }
        if(req.params.info === 'date') {
            Account.find((err, account) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info: 'N/A'
                    })
                } else if(account.length > 0) {
                    let date = new Date(account[0].date).toLocaleDateString();
                    date = dateFormat(date, 'dd/mm/yy');
                    res.send({
                        info: date
                    })
                } else {
                    res.send({
                        info: 'N/A'
                    })
                }
            }).sort({_id: -1}).limit(1);
        }
        if(req.params.info === 'multi') {
            async function getState() {
                const active = await Account.countDocuments({state: 'Active'}).exec();
                const inactive = await Account.countDocuments({state: 'Inactive'}).exec();

                return {
                    active: active,
                    inactive: inactive
                }
            }

            getState()
                .then(r => {
                    res.send({
                        info0: r.active,
                        info1: r.inactive
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.send({
                        info0: 0,
                        info1: 0
                    });
                });

        }
    }
    if(req.params.type === 'banks') {
        if(req.params.info === 'count') {
            Bank.countDocuments({}, (err, count) => {
                res.send({
                    info: count
                })
            });
        }
        if(req.params.info === 'date') {
            Bank.find((err, bank) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info: 'N/A'
                    })
                } else if(bank.length > 0) {
                    let date = new Date(bank[0].date).toLocaleDateString();
                    date = dateFormat(date, 'dd/mm/yy');
                    res.send({
                        info: date
                    })
                } else {
                    res.send({
                        info: 'N/A'
                    })
                }
            }).sort({_id: -1}).limit(1);
        }

    }
    if(req.params.type === 'bills') {

        if(req.params.info === 'count') {
                Bill.countDocuments({}, (err, count) => {
                res.send({
                    info: count
                })
            });
        }
        if(req.params.info === 'date') {
            Bill.find((err, bill) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info: 'N/A'
                    })
                } else if(bill.length > 0) {
                    let date = new Date(bill[0].date).toLocaleDateString();
                    date = dateFormat(date, 'dd/mm/yy');
                    res.send({
                        info: date
                    })
                } else {
                    res.send({
                        info: 'N/A'
                    })
                }
            }).sort({_id: -1}).limit(1);
        }
        if(req.params.info === 'paid') {
            Bill.countDocuments({status: 'Paid'}, function(err, count) {
                res.send({
                    info: count
                })
            })
        }
        if(req.params.info === 'unpaid') {
            Bill.countDocuments({status: 'Unpaid'}, function(err, count) {
                res.send({
                    info: count
                })
            })
        }
        if(req.params.info === 'multi') {
            Bill.find((err, bill) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info0: 'Date Due',
                        info1: 'Creditor',
                        info2: 'Amount'
                    });
                } else if(bill.length > 0) {
                    let date = new Date(bill[0].dueDate).toLocaleDateString();
                    let creditor = bill[0].creditor;
                    let amount = bill[0].amount;
                    res.send({
                        info0: date,
                        info1: creditor,
                        info2: `£${amount}`
                    });
                } else {
                    res.send({
                        info0: 'Date Due',
                        info1: 'Creditor',
                        info2: 'Amount'
                    });
                }
            }).sort({dueDate: -1}).limit(1);
        }
        if(req.params.info === 'balance') {
            Bill.aggregate([{
                $match : {status : 'Unpaid'}
            },{
                $group: {
                    _id: null,
                    total : {
                        $sum: '$amount'
                    }
                }
            }], (err, sum) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info: '£0'
                    });
                    return;
                }
                if(sum.length > 0) {
                    res.send({
                        info: `£${sum[0].total}`
                    });
                } else {
                    res.send({
                       info: '£0'
                    });
                }
            })
        }
    }
    if(req.params.type === 'cards') {
        if(req.params.info === 'count') {
            Card.countDocuments({}, (err, count) => {
                res.send({
                    info: count
                })
            });
        }
        if(req.params.info === 'date') {
            Card.find((err, card) => {
                if(err) {
                    console.error(err);
                    res.send({
                        info: 'N/A'
                    })
                } else if(card.length > 0) {
                    let date = new Date(card[0].date).toLocaleDateString();
                    date = dateFormat(date, 'dd/mm/yy');
                    res.send({
                        info: date
                    })
                } else {
                    res.send({
                        info: 'N/A'
                    })
                }
            }).sort({_id: -1}).limit(1);
        }
        if(req.params.info === 'multi') {
            async function getState() {
                const active = await Card.countDocuments({state: 'Active'}).exec();
                const inactive = await Card.countDocuments({state: 'Inactive'}).exec();

                return {
                    active: active,
                    inactive: inactive
                }
            }

            getState()
                .then(r => {
                    res.send({
                        info0: r.active,
                        info1: r.inactive
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.send({
                        info0: 0,
                        info1: 0
                    });
                });

        }
    }
});

app.post('/register', (req, res) => {

    /* register a new user using the passport register method on the user schema, this method hashes and salts the
       password field for you */
    User.register({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email
    }, req.body.password, (err) => {
        if(err.name === 'MongoError' && err.code === 11000) {
            res.render('registration', {
                confirmationMessage: 'An account registered with this email address already exists.'
            });
        } else if(err.name === 'UserExistsError') {
            res.render('registration', {
                confirmationMessage: 'An account registered with this username already exists.'
            });
        } else {
            res.render('login', {
                confirmationMessage: 'Registration successful, you can now login.',
                usernamePlaceholder: req.body.username
            });
        }
    });
});

app.post('/login', (req, res) => {

    /* use passports authenticate method which looks through registered users, and checks them against credentials
       entered within the login post route. If a user is returned, specifying the correct credentials given, then the
       user is redirected to the home page */
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            renderLogin(res, err, null);
            return;
        }
        if(!user) {
            renderLogin(res, 'Incorrect username or password, please try again.', null);
            return;
        }
        req.logIn(user, (err) => {
            if(err) {
                renderLogin(res, err, null);
                return;
            }
            return res.redirect('/home');
        });
    })(req, res);
});

app.post('/add/:type', (req, res) => {
    if(req.params.type === 'accounts') {

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
               return;
            }
            findUserAddItem(req.user.username, 'accounts', account, res);

        });

    } else if(req.params.type === 'banks') {

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

            findUserAddItem(req.user.username, 'banks', bank, res);
        });

        
    } else if(req.params.type === 'bills') {
        let bill = new Bill({
            name: req.body.name,
            type: req.body.type,
            creditor: req.body.creditor,
            amount: req.body.amount,
            dueDate: req.body['date due'],
            status: req.body.status
        })

        bill.save((err, card) => {
            if(err) {
                console.error(err);
                return
            }
            findUserAddItem(req.user.username, 'bills', bill, res);
        });

    } else {

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
        })

        card.save((err, card) => {
            if(err) {
                console.error(err);
                return;
            }

            findUserAddItem(req.user.username, 'cards', card, res);
        });
    }
});

app.post('/view/:type', (req, res) => {
    res.render('item', {
        type: req.params.type,
        confirmationMessage: '',
        items: req.user[req.params.type]
    });
});

app.post('/delete/:type/:id', (req, res) => {
    const type = req.params.type;
    const itemID = req.params.id;

    if(type === 'accounts') {
        User.findByIdAndUpdate(req.user._id, {
            $pull: {
                accounts: {_id: itemID}
            }
        }, null, (err, user) => {
            if(err) {
                console.error(err);
            }
            res.redirect('/manage/' + type + '/delete');
        });
        Account.findOneAndDelete({_id: itemID}, null, (err) => {
            if(err) {
                console.error(err);
            }
        });
    } else if(type === 'banks') {
        User.findByIdAndUpdate(req.user._id, {
            $pull: {
                banks: {_id: itemID}
            }
        }, null, (err, user) => {
            if(err) {
                console.error(err);
            }
            res.redirect('/manage/' + type + '/delete');
        });

        Password.deleteMany({entryID: itemID}, null, (err) => {
            if(err) {
                console.error(err);
            }
        })

        Bank.findOneAndDelete({_id: itemID}, null, (err) => {
            if(err) {
                console.error(err);
            }
        });
    } else if(type === 'bills') {
        User.findByIdAndUpdate(req.user._id, {
            $pull: {
                bills: {_id: itemID}
            }
        }, null, (err, user) => {
            if(err) {
                console.error(err);
            }
            res.redirect('/manage/' + type + '/delete');
        });

        Bill.findOneAndDelete({_id: itemID}, null, (err) => {
            if(err) {
                console.error(err);
            }
        });
    } else if(type === 'cards') {
        User.findByIdAndUpdate(req.user._id, {
            $pull: {
                cards: {_id: itemID}
            }
        }, null, (err, user) => {
            if(err) {
                console.error(err);
            }
            res.redirect('/manage/' + type + '/delete');
        });

        Card.findOneAndDelete({_id: itemID}, null, (err) => {
            if(err) {
                console.error(err);
            }
        });
    }
});

app.post('/password/:type/:field?', (req, res) => {
   if(req.isAuthenticated()) {
       User.findById(req.user._id, (err, user) => {
           if(err) {
               res.send({
                   message: 'User with this id could not be found'
               });
           } else {
               if(req.body.password) {
                   user.authenticate(req.body.password, (err, user, passwordError) => {
                       if(passwordError) {
                           console.error(err);
                           res.send({
                               message: 'Incorrect password'
                           });
                       } else {
                            if(req.params.type === 'bank') {

                            } else if(req.params.type === 'accounts') {
                                Account.findById(req.body.itemID, (err, account) => {
                                    res.send({
                                        password: account.password
                                    })
                                })
                            } else if(req.params.type === 'cards') {
                                Card.findById(req.body.itemID, (err, card) => {
                                    res.send({
                                        password: card[`${req.params.field}`]
                                    })
                                })
                            }
                       }
                   });
               } else {
                   res.send({
                       message: 'Please enter your account password'
                   });
               }
           }
       });
   } else {

   }
});
