const mongoose = require('mongoose');

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

module.exports = {
    schema: bankingSchema,
    model: mongoose.model('Bank', bankingSchema)
}
