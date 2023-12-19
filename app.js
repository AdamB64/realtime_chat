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


const app = express();
const port = 3000;

app.set('view engine', 'ejs'); 3

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
}));

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


// Create an HTTP server and integrate it with Express
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server
const wss = new WebSocket.Server({ server });

// Set the 'views' folder as the static directory
app.use(express.static(path.join(__dirname, 'views')));

// Serve the 'index.html' file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// WebSocket server handling connections
wss.on('connection', (ws) => {
    // WebSocket connection is established
    console.log('WebSocket connection established');

    // Handle incoming messages from clients
    ws.on('message', (message) => {
        message = message.toString('utf8')
        //console.log(message);

        console.log(`Received message: ${message}`);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (/*client !== ws &&*/ client.readyState === WebSocket.OPEN) {
                // Parse the message once
                const parsedMessage = JSON.parse(message);

                // Set the color based on whether it's the sender or not
                parsedMessage.color = client === ws ? 'grey' : 'black';
                parsedMessage.alignmentClass = client === ws ? 'align-right' : 'align-left';

                // Send the updated message
                //console.log(parsedMessage)
                client.send(JSON.stringify(parsedMessage));
            }
        });
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
        console.log("public chat " + publicChat);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
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
    console.log(publicChat);
    res.json(publicChat);
});

app.get('/user-permissions', async (req, res) => {
    const chatRoom = await chatRoom.find();

    try {
        // Get the user's ID (or username)
        const userId = req.user.id; // or req.user.username

        // Find all chat rooms where the user is a member
        const chatRooms = await chatRoom.find({ members: userId });
        console.log(chatRooms);

        // Extract the names of the chat rooms
        const chatRoomNames = chatRooms.map(room => room.name);
        console.log(chatRoomNames);

        // Send the chat room names in the response
        res.json(chatRoomNames);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Start the server and listen on the specified port
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
