const mongoose = require('./mongo.js');

const chatRoomSchema = new mongoose.Schema({
    name: String,
    members: [String]
});

const chatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = chatRoom;