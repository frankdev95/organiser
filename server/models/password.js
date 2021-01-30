const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

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

passwordSchema.plugin(encrypt, {
    encryptionKey: process.env.ENC_KEY,
    signingKey: process.env.SIG_KEY,
    encryptedFields: ['password']
});

module.exports = mongoose.model('Password', passwordSchema);
