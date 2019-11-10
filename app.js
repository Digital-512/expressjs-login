const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const login = require('./login/routes');
const initializeDatabases = require('./db');
const app = express();
const port = 3000;

// Initialize public directory
app.use(express.static(path.join(__dirname, 'public')));

// Support parsing of application/json type post data
app.use(bodyParser.json());
// Support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize databases
initializeDatabases().then(function (dbs) {

    // Set routes for expressjs-login
    app.use('/', login(dbs));

    // Start app
    app.listen(port, function () {
        console.log('expressjs-login is running on port ' + port);
    });

}).catch(function (err) {
    console.error("Failed to make all database connections!");
    console.error(err);
    process.exit(1);
});