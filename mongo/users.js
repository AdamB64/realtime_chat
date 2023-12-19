const mongoose = require('./mongo.js');
const bcrypt = require('bcrypt');

const useSchema = new mongoose.Schema({
    username: String,
    password: String,
    profilePicture: { type: String, default: "../img/profilePicture.jpeg" },
});

useSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

const users = mongoose.model('users', useSchema);

module.exports = users;