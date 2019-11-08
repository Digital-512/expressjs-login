const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();

// GET requests
router.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/login.html'));
});
router.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/register.html'));
});

module.exports = router;