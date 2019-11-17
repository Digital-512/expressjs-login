const utils = require('./utils');
const sendMail = require('./mailsender');

module.exports.sendRequest = async function (database, email) {
    if (!email) {
        return {
            status: false,
            message: "Please enter email address!"
        }
    }
    if (!utils.regex.email.test(email)) {
        return {
            status: false,
            message: "Must provide a valid email address."
        }
    }
    const members = database.collection("members");
    // Search for user in collection members
    const find_user = await members.findOne({ email: email });
    // For security reasons, if user does not exist, it should not be disclosed
    // in reset password form. Instead, send email to provided address.
    if (!find_user) {
        // Send email that informs that account does not exist
        sendMail(email, null, "resetpass_not_exists").catch(console.error);
        return {
            status: true,
            message: utils.config.form_msg.resetpass.replace(/\%email/g, email)
        }
    }
    // Generate token
    const token = utils.getRandomString(32);
    // Generate reset password url
    const url = utils.config.base_url + "resetpass/" + token;
    const pass_resets = database.collection("passResets");
    var data = {
        token: token,
        userId: find_user.id,
        createdAt: new Date()
    }
    const write_data = await pass_resets.insertOne(data);
    if (write_data.result.ok) {
        sendMail(email, { url: url }, "resetpass").catch(console.error);
        return {
            status: true,
            message: utils.config.form_msg.resetpass.replace(/\%email/g, email)
        }
    }
    return {
        status: false,
        message: "Failed to send request. Try again."
    }
}
module.exports.getRequest = async function (database, token) {
    if (token) {
        const pass_resets = database.collection("passResets");
        const find_token = await pass_resets.findOne({ token: token });
        if (!find_token) {
            // Password reset request not found
            return {
                status: false,
                message: "An error occurred: Invalid token or link is expired."
            }
        }
        const timeDiff = Math.floor((new Date().getTime() - new Date(find_token.createdAt).getTime()) / 1000);
        if (timeDiff > utils.config.resetpass_timeout) {
            // Password reset link is expired
            return {
                status: false,
                message: "This link is expired. If you want to change password, please request a new password reset link."
            }
        }
        const members = database.collection("members");
        const find_user = await members.findOne({ id: find_token.userId });
        if (!find_user) {
            // User with provided id not found
            return {
                status: false,
                message: "An error occurred: Invalid token or link is expired."
            }
        }
        // Delete password reset request from database
        const delete_request = await pass_resets.deleteOne({ token: token });
        if (!delete_request.result.ok) {
            return {
                status: false,
                message: "An error occurred: Failed to execute required database queries. Try again."
            }
        }
        // Generate new password
        const newpass = utils.getRandomString(10);
        // and salt-hash it
        const newpass_hashed = utils.saltHashPassword(newpass);
        const update_pass = await members.updateOne({ id: find_user.id }, { $set: { password: newpass_hashed, mod_timestamp: new Date() } });
        if (update_pass.result.ok) {
            return {
                status: true,
                message: "Your password has been reset!",
                password: newpass
            }
        }
        return {
            status: false,
            message: "An error occurred: Failed to update password. Try again."
        }
    }
    return {
        status: false,
        message: "An error occurred: No argument provided."
    }
}