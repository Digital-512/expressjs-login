const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('./config.json');

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    }
}
module.exports.getRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}
module.exports.saltHashPassword = function (userpassword, salt) {
    return sha512(config.password_hash_iv + userpassword, ((salt) ? salt : this.getRandomString(16)));
}
module.exports.parsePayload = function (token) {
    // if the cookie is not set, return an unauthorized error
    if (!token) {
        return {
            authenticated: false,
            error: 401
        }
    }
    var payload = null;
    try {
        // Parse the JWT string and store the result in payload
        payload = jwt.verify(token, config.jwt_key);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            // if the error thrown is because the JWT is unauthorized, return a 401 error
            return {
                authenticated: false,
                error: 401
            }
        }
        // otherwise, return a bad request error
        return {
            authenticated: false,
            error: 400
        }
    }
    return {
        authenticated: true,
        data: payload
    }
}
module.exports.regex = {
    space: /\s/g,
    username: /^[A-Za-z0-9_.-]{1,32}$/,
    email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
}
module.exports.config = config;
module.exports.jwt = jwt;
module.exports.mailTransport = nodemailer.createTransport(config.email.transport);