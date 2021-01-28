require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const app = express();

// MODELS
const Account = require('./server/models/account').model,
      Bank = require('./server/models/banking').model,
      Bill = require('./server/models/bill').model,
      Card = require('./server/models/card').model,
      User = require('./server/models/user'),
      Password = require('./server/models/password');

// ROUTE HANDLERS
const authenticationRoutes = require('./server/routes/authentication'),
      accountRoutes = require('./server/routes/accounts'),
      bankRoutes = require('./server/routes/banks'),
      billRoutes = require('./server/routes/bills'),
      cardRoutes = require('./server/routes/cards');


let port = process.env.PORT || 3000;
let userName;


// MIDDLEWARE
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'musOsEAjkWi9s5DAOw3QPuC9fhEC9wTG9PV36RvV3kW+fI1OR5vRM2MbM8bJqqyUgnGfQ1E1/nf3bsv0omFrtA==',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/authentication', authenticationRoutes);
app.use('/accounts', accountRoutes);
app.use('/banks', bankRoutes);
app.use('/bills', billRoutes);
app.use('/cards', cardRoutes);

app.set('view engine', 'ejs');

// Replace the uri string with your MongoDB deployment's connection string.
const url = "mongodb+srv://frank-admin:14RK68SG7nrXqQ7g@cluster0.makro.mongodb.net/organiserDB?retryWrites=true&w=majority";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: true
}

mongoose.connect(url, options)
    .then(() => console.log('Successfully connected to DB'))
    .catch((err) => console.error(err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {});

/*********************PASSPORT CONFIGURATION*********************/
// used to keep track of existing user sessions and handle new user registration using authentication.

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*********************ROUTE HANDLERS*********************/

app.get('/', (req, res) => {
    res.redirect('/authentication/login');
});

app.get('/home', (req, res) => {
    if(req.isAuthenticated()) {
        let firstNameRegex = /([a-z]+)(?=\s)/i;
        userName = req.user.name.match(firstNameRegex)[0];
        res.render('home', {
            userName: userName
        });
    } else {
        res.redirect('/authentication/login');
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


app.listen(port, () => {
    console.log('Port running on port ' + port);
});
