const express = require('express');
const path = require('path');
const login = require('./login/routes');
const app = express();
const port = 3000;

// Initialize public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set routes for expressjs-login
app.use('/', login);

// Start app
app.listen(port, function () {
    console.log('expressjs-login is running on port ' + port);
});