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
    const space_regex = /\s/g;
    const username_regex = /^[A-Za-z0-9_.-]{1,32}$/g;
    const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (newuser.match(space_regex) || password.match(space_regex) || email.match(space_regex)) {
        return {
            status: false,
            message: "Username, email and password cannot contain any spaces!"
        }
    }
    if (!newuser.match(username_regex)) {
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
    if (!email_regex.test(newemail)) {
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
            password: newpw
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