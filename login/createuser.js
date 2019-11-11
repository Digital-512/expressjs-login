const utils = require('./utils');

module.exports = async function (database, newuser, email, password) {
    // Generate new UUID and hash password
    var newid = utils.getRandomString(16);
    var newpw = utils.saltHashPassword(password);
    var newemail = email;
    if (utils.config.admin_email) {
        newemail = utils.config.admin_email;
    }
    // Validation rules
    if (newuser.match(utils.regex.space) || password.match(utils.regex.space) || email.match(utils.regex.space)) {
        return {
            status: false,
            message: "Username, email and password cannot contain any spaces!"
        }
    }
    if (!newuser.match(utils.regex.username)) {
        return {
            status: false,
            message: "Username cannot contain special characters and must be between 1 and 32 characters."
        }
    }
    if (password.length < 4) {
        return {
            status: false,
            message: "Your password is too short! It must be at least 4 characters."
        }
    }
    if (!utils.regex.email.test(newemail)) {
        return {
            status: false,
            message: "Must provide a valid email address."
        }
    }
    if ((newuser, password, email)) {
        // New user data
        var data = {
            id: newid,
            username: newuser,
            email: newemail,
            password: newpw,
            verified: false,
            mod_timestamp: Date.now()
        }
        // Write data to the database and return response
        const members = database.collection("members");
        const user_exists = await members.countDocuments({ username: newuser }, { limit: 1 });
        if (user_exists) {
            return {
                status: false,
                message: "Entered username already exists!"
            }
        }
        const email_exists = await members.countDocuments({ email: newemail }, { limit: 1 });
        if (email_exists) {
            return {
                status: false,
                message: "Entered email address already exists!"
            }
        }
        const write_data = await members.insertOne(data);
        if (write_data.result.ok) {
            // Return TRUE if write_data response is OK.
            return {
                status: true,
                message: utils.config.form_msg.signupthanks
            }
        }
        return {
            status: false,
            message: "Failed to write data to the database. Try again."
        }
    } else {
        return {
            status: false,
            message: "An error occurred on the form... Try again."
        }
    }
}