const utils = require('./utils');
const sendMail = require('./mailsender');

module.exports = async function (database, uid) {
    if (uid) {
        const members = database.collection("members");
        // Search for user in collection members
        const find_user = await members.findOne({ id: uid });
        if (!find_user || find_user.verified) {
            return {
                status: false,
                message: "An error occurred: No user found or link is expired."
            }
        }
        // Update account status to verified and return response
        const update_v = await members.updateOne({ id: uid }, { $set: { verified: true, mod_timestamp: new Date() } });
        if (update_v.result.ok) {
            // Send email about verification status
            sendMail(find_user.email, { user: find_user.username, id: uid }, "active").catch(console.error);
            return {
                status: true,
                message: utils.config.form_msg.activemsg.replace(/\%signin_url/g, utils.config.base_url + "login")
            }
        }
        return {
            status: false,
            message: "An error occurred: Failed to update account status. Try again."
        }
    }
    return {
        status: false,
        message: "An error occurred: No argument provided."
    }
}
