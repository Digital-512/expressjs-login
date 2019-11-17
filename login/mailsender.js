const utils = require('./utils');

module.exports = async function (email, data, type) {
    var message = {
        from: utils.config.email.from,
        to: email,
        subject: null,
        html: null
    }
    switch (type) {
        case 'verify':
            const verifyurl = utils.config.base_url + "verifyuser/" + data.id;
            // Set the subject line
            message.subject = utils.config.site_name + " | " + data.user + " account verification";
            // Set the body of the message
            message.html = utils.config.email_msg.verifymsg + "<br><a href='" + verifyurl + "'>" + verifyurl + "</a>";
            break;
        case 'active':
            const signin_url = utils.config.base_url + "login";
            message.subject = utils.config.site_name + " | Account created!";
            message.html = utils.config.email_msg.active_email + "<br><a href='" + signin_url + "'>" + signin_url + "</a>";
            break;
        case 'resetpass':
            break;
        case 'resetpass_not_exists':
            message.subject = utils.config.site_name + " | Account access attempted";
            message.html = utils.config.email_msg.resetpass_not_exists;
            break;
    }
    // Send mail with defined transport object and return message data
    return await utils.mailTransport.sendMail(message);
}