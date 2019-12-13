const utils = require('./utils');
const sendMail = require('./mailsender');

module.exports = async function (database, newuser, email, password, password2) {
    // Generate new UUID and hash password
    var newid = utils.getRandomString(32);
    var newpw = utils.saltHashPassword(password);
    var newemail = email;
    if (utils.config.admin_email) {
        newemail = utils.config.admin_email;
    }
    // Validation rules
    if (password !== password2) {
        return {
            status: false,
            message: "Password and confirm password does not match!"
        }
    }
    if (!utils.regex.username.test(newuser)) {
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
    if (newuser && password && password2 && email) {
        // New user data
        var data = {
            id: newid,
            username: newuser,
            email: newemail,
            password: newpw,
            verified: utils.config.account_verification === false,
            mod_timestamp: new Date()
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
        // Check for user id collisions. The probability of collision is extremely low
        // but it exists. Generate new id if collision is found.
        const id_exists = await members.countDocuments({ id: newid }, { limit: 1 });
        if (id_exists) {
            newid = utils.getRandomString(32);
            data.id = newid;
        }
        const write_data = await members.insertOne(data);
        if (write_data.result.ok) {
            // Send verification email if verification is enabled
            if (utils.config.account_verification) {
                sendMail(newemail, { user: newuser, id: newid }, "verify").catch(console.error);
            }
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
