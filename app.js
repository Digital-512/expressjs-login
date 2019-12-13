const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const login = require('./login/routes');
const initializeDatabases = require('./db');
const app = express();
const port = 3000;

// Initialize public directory
app.use(express.static(path.join(__dirname, 'public')));

// Support parsing of application/json type post data
app.use(express.json());
// Support parsing of application/x-www-form-urlencoded post data
app.use(express.urlencoded({ extended: true }));
// Support cookie parsing
app.use(cookieParser());

const startApp = async function () {
    // Initialize databases
    const dbs = await initializeDatabases().catch((err) => {
        console.error("Failed to make all database connections!");
        console.error(err);
        process.exit(1);
    });

    // Set routes for expressjs-login
    app.use('/', login(dbs.login, '/'));

    // Your pages that need user authentication
    app.use('/', (req, res) => {
        const session = login.utils.parsePayload(req.cookies.token);
        if (!session.authenticated) {
            // User is not authenticated, redirect to login page
            res.redirect('/login');
        } else {
            // Display welcome page
            res.sendFile(path.join(__dirname, 'public/welcome.html'));
            // You can access data stored in payload
            // console.log for debugging
            console.log(session.data.username);
        }
    });

    // Start app
    app.listen(port, () => {
        console.log('expressjs-login is running on port ' + port);
    });
}

startApp();
