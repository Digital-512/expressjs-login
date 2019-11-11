const utils = require('./utils');

async function checkAttempts(database, ipAddress, username) {
    const attempts = database.collection("loginAttempts");
    const find_attempt = await attempts.findOne({ ip: ipAddress, username: username });
    if (find_attempt) {
        return {
            attempts: find_attempt.attempts,
            lastlogin: find_attempt.lastlogin
        }
    }
    return false;
}
async function insertAttempt(database, ipAddress, username, lastAttempt) {
    const datetimeNow = Date.now();
    var data = {
        ip: ipAddress,
        attempts: 1,
        lastlogin: datetimeNow,
        username: username
    }
    const attempts = database.collection("loginAttempts");
    if (!lastAttempt) {
        const write_data = await attempts.insertOne(data);
        if (write_data.result.ok) {
            return {
                attempts: data.attempts,
                lastlogin: data.lastlogin
            }
        }
    } else {
        var currentAttempts = lastAttempt.attempts;
        const timeDiff = Math.floor((new Date(datetimeNow).getTime() - new Date(lastAttempt.lastlogin).getTime()) / 1000);
        if (currentAttempts <= utils.config.max_attempts || timeDiff > utils.config.login_timeout) {
            if (timeDiff <= utils.config.login_timeout) {
                currentAttempts++;
            } else {
                currentAttempts = 1;
            }
            const update_attempts = await attempts.updateOne({ ip: ipAddress, username: username }, { $set: { attempts: currentAttempts, lastlogin: datetimeNow } });
            if (update_attempts.result.ok) {
                return {
                    attempts: currentAttempts,
                    lastlogin: datetimeNow
                }
            }
        }
        return {
            attempts: currentAttempts,
            lastlogin: lastAttempt.lastlogin
        }
    }
    return false;
}
module.exports = async function (database, ipAddress, username, password, rememberMe) {
    if (!username.match(utils.regex.username)) {
        return {
            status: false,
            message: "Username cannot contain special characters and must be between 1 and 32 characters."
        }
    }
    var lastAttempt = await checkAttempts(database, ipAddress, username);
    lastAttempt = await insertAttempt(database, ipAddress, username, lastAttempt);
    if (!lastAttempt) {
        return {
            status: false,
            message: "Failed to execute required database queries. Try again."
        }
    }
    if (lastAttempt.attempts > utils.config.max_attempts) {
        return {
            status: false,
            message: "Maximum number of login attempts exceeded. Please wait " + Math.round(utils.config.login_timeout / 60) + " minutes before logging in again."
        }
    }
    //checklogin
}