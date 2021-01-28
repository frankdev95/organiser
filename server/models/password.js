const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    entryID: {
        type: mongoose.Schema.Types.ObjectID,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Password', passwordSchema);
