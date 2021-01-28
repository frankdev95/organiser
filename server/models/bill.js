const mongoose = require('mongoose');

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

module.exports = {
    schema: billSchema,
    model: mongoose.model('Bill', billSchema)
}
