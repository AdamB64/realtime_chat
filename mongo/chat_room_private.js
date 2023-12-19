const mongoose = require('./mongo.js');

const messageSchema = new mongoose.Schema({
    username: String,
    message: { type: String, default: "empty" },
    date: String
}, { _id: false }); // Prevents creation of an id for subdocuments

const chatRoomSchema = new mongoose.Schema({
    name: String,
    members: [String],
    chat: [messageSchema] // Array of message objects
});


const chatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = chatRoom;