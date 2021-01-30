const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') return cb(null, true);
    cb(new Error('File must be in image format - (jpeg, png)'), false);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});


router.patch('/:id', upload.single('profile-img'), (req, res) => {
    if(req.isAuthenticated()) {
        let profileImage;
        
        if(req.file !== undefined) {
            profileImage = req.file.path;
        } else {
            profileImage = req.user.profileImage;
        }

        const updateParams = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            profileImage: profileImage
        }

        User.findByIdAndUpdate(req.params.id, {$set: updateParams}, null, (err, user) => {
            if(err) {
                return console.log(err);
            }
            res.redirect('/home');
        });
    }
});

module.exports = router;

