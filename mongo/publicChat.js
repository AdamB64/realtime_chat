const mongoose = require('./mongo.js');

const publiSchema = new mongoose.Schema({
    username: String,
    message: String,
    date: String
});

const public = mongoose.model('public', publiSchema);

module.exports = public;