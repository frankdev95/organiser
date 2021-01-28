const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

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

accountSchema.plugin(encrypt, {
    encryptionKey: process.env.ENC_KEY,
    signingKey: process.env.SIG_KEY,
    encryptedFields: ['password']
});

module.exports = {
    schema: accountSchema,
    model : mongoose.model('Account', accountSchema)
}
