require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const users = require('./mongo/users.js')
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const public = require('./mongo/publicChat.js');
const chatRoom = require('./mongo/chat_room_private.js');
const expressWs = require('express-ws');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './img/');
    },
    filename: function (req, file, cb) {
        let date = new Date().toISOString();
        date = date.replace(/:/g, '-');  // Replace colons with hyphens
        cb(null, date + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const app = express();
expressWs(app); // Add WebSocket support to Express app

const port = 3000;

app.set('view engine', 'ejs');


let expressSession = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});


app.use(expressSession)

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
    if (req.session.user) {
        req.isAuthenticated = true;
    } else {
        req.isAuthenticated = false;
    }
    next();
}

// Use the middleware on the home page route
app.get('/authorised', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({ message: 'User is authenticated' });
    } else {
        res.json({ message: 'User is not authenticated' });
    }
});


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// Serve static files from the 'styles' and 'scripts' folders
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/img', express.static(path.join(__dirname, 'img')));


// Create an HTTP server and integrate it with Express
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', function (request, socket, head) {
    expressSession(request, {}, () => {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    });
});

// Set the 'views' folder as the static directory
app.use(express.static(path.join(__dirname, 'views')));

// Serve the 'index.html' file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Create a map to hold the clients for each chat room
const chatRooms = new Map();

// Create a map to hold the WebSocket connection for each user
const userConnections = new Map();

wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    // Get the username from the session
    const username = req.session.user;

    // Store the WebSocket connection for this user
    userConnections.set(username, ws);

    ws.on('message', (message) => {
        message = JSON.parse(message.toString('utf8'));

        // Get the chat room name from the message
        const chatRoomName = message.chatRoomName;

        // Get the users for this chat room
        const users = chatRooms.get(chatRoomName) || new Set();

        // Add this user to the chat room
        users.add(username);
        chatRooms.set(chatRoomName, users);

        console.log(`Received message: ${message}`);

        // Broadcast the message to all connected users in the same chat room
        users.forEach((user) => {
            const client = userConnections.get(user);
            if (client && client.readyState === WebSocket.OPEN) {
                // Set the color based on whether it's the sender or not
                message.color = client === ws ? 'grey' : 'black';
                message.alignmentClass = client === ws ? 'align-right' : 'align-left';

                // Send the updated message
                client.send(JSON.stringify(message));
            }
        });
    });

    // When the client disconnects, remove them from all chat rooms
    ws.on('close', () => {
        chatRooms.forEach((users, chatRoomName) => {
            users.delete(username);
            if (users.size === 0) {
                chatRooms.delete(chatRoomName);
            } else {
                chatRooms.set(chatRoomName, users);
            }
        });
        userConnections.delete(username);
    });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const userExists = await users.findOne({ username });
    if (userExists) {// Check if the user already exists  
        res.json({ message: 'User already exits' });
    } else {
        const user = new users({
            username,
            password
        });

        try {
            await user.save();
            res.json({ message: 'User created successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error registering user' });
        }
    }
});

app.post('/public-chat', async (req, res) => {
    const { username, message, date } = req.body;

    const publicChat = new public({
        username,
        message,
        date
    });

    try {
        await publicChat.save();
        //console.log("public chat " + publicChat);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
    }
});

app.post('/private-chat', async (req, res) => {
    const { username, message, date, chatRoomName } = req.body;
    //console.log(username + " text " + message + " date " + date + " chatroom " + chatRoomName)
    try {
        // Find the chat room by name
        const chatRoomMes = await chatRoom.findOne({ name: chatRoomName });

        if (!chatRoomMes) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Create a new message
        const chat = { username, message, date };
        //console.log("chat " + JSON.stringify(chat));

        // Add the message to the chat room
        chatRoomMes.chat.push(chat);

        // Save the updated chat room
        await chatRoomMes.save();

        //console.log("public chat " + chatRoomMes);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
    }
});

app.post('/upload', upload.single('profilePicture'), async (req, res) => {
    const { username } = req.body;

    const user = await users.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile picture
    user.profilePicture = req.file.path;

    // Save the updated user
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully' });
    //console.log("profile picture " + user.profilePicture);
});

app.get('/profile-picture', async (req, res) => {
    const { username } = req.query;

    const user = await users.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    //console.log("user " + JSON.stringify(user));
    res.json(user);
});

app.get('/getusers', async (req, res) => {
    const user = await users.find();
    //console.log(user);
    res.json(user);
});


app.post('/private-chat-room', async (req, res) => {
    const { name, members } = req.body;

    const membersArray = members.split(',');

    // Add the current user to the members array
    if (req.session && req.session.user) {
        membersArray.push(req.session.user);
    }

    // Check if all members are users
    for (let i = 0; i < membersArray.length; i++) {
        const user = await users.findOne({ username: membersArray[i] });
        //console.log("user 1" + user);
        if (user == null) {
            //console.log("user2 " + user);
            return res.status(400).json({ message: 'All members must be users' });
        }
    }



    const privateChatRoom = new chatRoom({
        name,
        members: membersArray
    });

    try {
        await privateChatRoom.save();
        res.status(200).json({ message: 'Chat room created successfully' });
        //console.log("private chat room " + privateChatRoom);
    } catch (err) {
        console.error(err);
        res.status(500).json('Error sending message');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const userExists = await users.findOne({ username });
    if (userExists) {// Check if the user already exists  
        // Compare the plain text password with the hashed password
        const validPassword = await bcrypt.compare(password, userExists.password);
        if (validPassword) {
            req.session.user = username;
            //console.log(req.session);
            res.json({ message: 'User logged in successfully' });
        } else {
            res.json({ message: 'Password is incorrect' });
        }
    } else {
        res.json({ message: 'User does not exist' });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'User logged out successfully' });
});

app.get('/get-username', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user });
    } else {
        res.json({ message: 'No user is currently logged in' });
    }
});

app.get('/public-chat_find', async (req, res) => {
    const publicChat = await public.find();
    //console.log(publicChat);
    res.json(publicChat);
});

app.get('/user-permissions', async (req, res) => {
    const chat_room_private = await chatRoom.find();

    try {
        // Get the user's ID (or username)
        const userId = req.session.user; // or req.user.username

        // Find all chat rooms where the user is a member
        const chatRooms = await chatRoom.find({ members: userId });
        //console.log(chatRooms);

        // Extract the names of the chat rooms
        const chatRoomNames = chatRooms.map(room => room.name);
        //console.log(chatRoomNames);

        // Send the chat room names in the response
        res.json(chatRoomNames);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/chat-room-data', async (req, res) => {
    // Get the chat room name from the query parameters
    const chatRoomName = req.query.chatroom;

    // Fetch the chat room data from the database
    const chatRoomData = await chatRoom.findOne({ name: chatRoomName });

    // Send the chat room data as the response
    res.json(chatRoomData);
});

// Start the server and listen on the specified port
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
