const express = require('express');
const path = require('path');
const utils = require('./utils');
const createUser = require('./createuser');
const checkLogin = require('./checklogin');
const verifyUser = require('./verifyuser');
const router = express.Router();

module.exports = function (database, homepage) {

    // GET requests
    router.get('/login', function (req, res) {
        const session = utils.parsePayload(req.cookies.token);
        if (session.authenticated) {
            // Redirect authenticated user to your main page
            res.redirect(homepage);
        } else {
            // User is not authenticated, render login page
            res.sendFile(path.join(__dirname, '../', 'public/login.html'));
        }
    });
    router.get('/logout', function (req, res) {
        // Log out user on request
        if (req.cookies.token) {
            res.clearCookie('token');
        }
        res.redirect('/login');
    });
    router.get('/register', function (req, res) {
        const session = utils.parsePayload(req.cookies.token);
        if (session.authenticated) {
            // Redirect authenticated user to your main page
            res.redirect(homepage);
        } else {
            // User is not authenticated, render register page
            res.sendFile(path.join(__dirname, '../', 'public/register.html'));
        }
    });
    router.get('/verifyuser/:uid?', function (req, res) {
        verifyUser(database, req.params.uid).then(function (val) {
            res.send(val.message);
            //res.json(val);
        });
    });

    // POST requests
    router.post('/login/:action', function (req, res) {
        if (req.params.action) {
            switch (req.params.action) {
                case 'checklogin':
                    // Check login and get response
                    checkLogin(database, req.ip, req.body.myusername, req.body.mypassword, req.body.rememberme).then(function (val) {
                        if (val.status) {
                            res.cookie('token', val.token, (val.remember ? { maxAge: val.timeout, httpOnly: true } : { httpOnly: true }));
                        }
                        res.json(val);
                    });
                    break;
            }
        }
    });
    router.post('/register/:action', function (req, res) {
        if (req.params.action) {
            switch (req.params.action) {
                case 'createuser':
                    // Create new user and get response
                    createUser(database, req.body.newuser, req.body.email, req.body.password).then(function (val) {
                        res.json(val);
                    });
                    break;
            }
        }
    });

    return router;
}
// Export utils. It's not mandatory, you can use it directly
module.exports.utils = utils;