const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'styles' and 'scripts' folders
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Set the 'views' folder as the static directory
app.use(express.static(path.join(__dirname, 'views')));

// Define a route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
