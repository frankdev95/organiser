const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

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

cardSchema.plugin(encrypt, {
    encryptionKey: process.env.ENC_KEY,
    signingKey: process.env.SIG_KEY,
    encryptedFields: ['securityID', 'pin']
});

module.exports = {
    schema: cardSchema,
    model: mongoose.model('Card', cardSchema)
}
