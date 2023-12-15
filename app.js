const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = 3000;

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
        console.log(message);

        console.log(`Received message: ${message}`);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (/*client !== ws &&*/ client.readyState === WebSocket.OPEN) {
                // Parse the message once
                const parsedMessage = JSON.parse(message);

                // Set the color based on whether it's the sender or not
                parsedMessage.color = client === ws ? 'grey' : 'black';
                parsedMessage.alignmentClass = client === ws ? 'align-left' : 'align-right';

                // Send the updated message
                console.log(parsedMessage)
                client.send(JSON.stringify(parsedMessage));
            }
        });
    });
});

// Start the server and listen on the specified port
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
