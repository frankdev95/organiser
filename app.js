const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

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
    res.render('login');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('registration');
})
