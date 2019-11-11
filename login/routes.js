const express = require('express');
const path = require('path');
const createUser = require('./createuser');
const checkLogin = require('./checklogin');
const router = express.Router();

module.exports = function (dbs) {

    // GET requests
    router.get('/login', function (req, res) {
        res.sendFile(path.join(__dirname, '../', 'public/login.html'));
    });
    router.get('/register', function (req, res) {
        res.sendFile(path.join(__dirname, '../', 'public/register.html'));
    });

    // POST requests
    router.post('/login/:action', function (req, res) {
        if (req.params.action) {
            switch (req.params.action) {
                case 'checklogin':
                    // Check login and get response
                    checkLogin(dbs.login, req.ip, req.body.myusername, req.body.mypassword, req.body.rememberme).then(function (val) {
                        res.json(val);
                    });
                    break;
                case 'logout':
                    break;
            }
        }
    });
    router.post('/register/:action', function (req, res) {
        if (req.params.action) {
            switch (req.params.action) {
                case 'createuser':
                    // Create new user and get response
                    createUser(dbs.login, req.body.newuser, req.body.email, req.body.password).then(function (val) {
                        res.json(val);
                    });
                    break;
                case 'verifyuser':
                    break;
            }
        }
    });

    return router;
}