const crypto = require('crypto');
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
module.exports.saltHashPassword = function (userpassword) {
    var salt = this.getRandomString(16);
    return sha512(config.password_hash_iv + userpassword, salt);
}
module.exports.regex = {
    space: /\s/g,
    username: /^[A-Za-z0-9_.-]{1,32}$/,
    email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
}
module.exports.config = config;