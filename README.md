# expressjs-login
expressjs-login is a simple and secure token-based login and signup ready made system that will speed up your development. The code is very simple to read and modify, and is built with ExpressJS, MongoDB and jQuery (AJAX) using Bootstrap 4 for the form design as well as Nodemailer for user account verification and confirmation.

![Login Page Screenshot](https://raw.githubusercontent.com/Digital-512/expressjs-login/master/expressjs_login_photo1a.png "Login Page Screenshot")

## Installation

### Clone the Repository
	$ git clone https://github.com/Digital-512/expressjs-login

### Install dependent packages
	$ npm install

### Setup the `app.js` and database
> Note: app.js and db.js files are not directly related with login script. It is an example, how your app should look.

```js
// Set routes for expressjs-login
app.use('/', login(dbs.login, '/'));
// express.router: login(login_database, homepage_route)
```
```js
const session = login.utils.parsePayload(req.cookies.token);
// bool: session.authenticated
// json: session.data
```

### Set database indexes
	// MONGO SHELL
	$ use login
	$ db.loginAttempts.createIndex( { "lastlogin": 1 }, { expireAfterSeconds: 3600 } )
	$ db.passResets.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 7200 } )
	$ db.members.createIndex( { "verified": false, "mod_timestamp": 1 }, { expireAfterSeconds: 86400 } )

### Use template engines for production
This script does not have any template engine installed and uses the default one (renders static files). The functionality of the default renderer is very limited, so it is recommended to install another template engine, for example:
* EJS: https://ejs.co/
* PUG: https://pugjs.org/api/getting-started.html
* More template engines: https://expressjs.com/en/resources/template-engines.html

### Configuration `login/config.json`
> <b>IMPORTANT: </b>You must change "jwt_key" and "password_hash_iv" because they are private keys and used for security. Use http://www.unit-conversion.info/texttools/random-string-generator/ to generate random strings for keys.

```js
{
    // Set this for global site use
	"site_name": "Test Site",
	// Maximum login attempts
    "max_attempts": 5,
	// Timeout (in seconds) after max attempts are reached
    "login_timeout": 300,
	// ONLY set this if you want a moderator to verify users and not the users themselves, otherwise leave blank
    "admin_email": "",
	// Enable or disable the requirement to verify account
    "account_verification": true,
	// Reset password link expiration (in seconds)
    "resetpass_timeout": 3600,
	// The main url of your website, slash at the end is required
    "base_url": "http://localhost:3000/",
	// The private key to create and validate tokens
    "jwt_key": "0sYKc692B7j1bXQ66uSebIzZD5W5YzoZ",
	// Session timeout (in seconds). Sessions can be updated using POST request
    "jwt_session_timeout": 600,
	// Remember Me session timeout (in seconds)
    "jwt_rememberme_timeout": 7776000,
	// Identifies which algorithm is used to generate the signature. Visit https://jwt.io/ for more information
    "jwt_algorithm": "HS512",
	// Additional salt used to generate password hash
    "password_hash_iv": "8Nq2caZUDv5K3LJz_",
    "email": {
        // Nodemailer transport configuration. Visit https://nodemailer.com/smtp/ for more information
		// Find specific server settings at https://www.arclab.com/en/kb/email/list-of-smtp-and-pop3-servers-mailserver-list.html
		"transport": {
            "pool": false,
            "host": "smtp.mail.domain.com",
            "port": 465,
            "secure": true,
            "auth": {
                "user": "youremail@domain.com",
                "pass": "yourEmailPassword"
            }
        },
		// 'From Name' displayed on email
		// and Webmaster email
        "from": "'From Name' <youremail@domain.com>"
    },
	// HTML messages shown in emails
    "email_msg": {
        "verifymsg": "Click this link to verify your new account!<br><a href='%verify_url'>%verify_url</a>",
        "active_email": "Your new account is now active! Click this link to log in!<br><a href='%signin_url'>%signin_url</a>",
        "resetpass": "We have sent this message because you requested a password reset.<br>To reset password and get back into your account, click the link below:<br><a href='%reset_url'>%reset_url</a><br><br>This link will expire in 1 hour.<br>If you did not attempt to reset password, please ignore this email.",
        "resetpass_not_exists": "You (or someone else) entered this email address when trying to change the password.<br><br>However, this email address is not on our database of registered users and therefore the attempted password change has failed.<br><br>If you did not attempt to reset password, please ignore this email."
    },
	// LOGIN form response messages/errors
    "form_msg": {
        "signupthanks": "Thank you for signing up! You will receive an email shortly confirming the verification of your account.",
        "activemsg": "Your account has been verified! You may now login at <br><a href='%signin_url'>%signin_url</a>",
        "resetpass": "We have sent an email to %email with further instructions."
    }
}
```

### Session renewal
By default, session expires when exceeds time limit set in "jwt_session_timeout" (10 minutes default). We should not expect the user login every ten minutes if their token expires. To solve this, you can simply set "jwt_session_timeout" to very high number, for example, 99999. However, you may want to log out users if they are away or inactive, and extend session if they are active. To do this, the client application should send POST requests to `/auth/renewsession/` when it detects key presses, mouse activity or other actions. It works by taking the previous token (which is still valid), and returning a new token with a renewed expiry time.

### Check the Username and the Password using jQuery (Ajax):
If the user has the right username and password, then the `checklogin.js` will send 'status: true', generate signed token, and redirect to homepage `welcome.html`. If the username and/or the password are wrong, the `checklogin.js` will send 'status: false, message: "Wrong Username or Password"'.

### Signup/Login Workflow
> 1) Create new user using `register.html` form and create account data in database. (note: validation occurs both client and server side)
> <b>Validation requires:</b>
> - Passwords to match and be at least 4 characters
> - Valid email address
> - Unique username and unique email address
> - Username between 1 and 32 characters, alphanumeric, including dots and underscores
> 2) Password gets hashed using this model: hash(password_hash_iv + salt + password) and new UID is generated for User ID
> 3) User gets added to database as unverified (if "account_verification" is set to true)
> 4) Email is sent to user email (or "admin_email" if set) with verification link
> 5) User (or admin) clicks verification link which sends them to `/verifyuser/:uid` and verifies user in the database
> 6) Verified user may now log in using one-time session or extended (remember me) session

### Attribution
This script is based upon the original fethica PHP-login script, version 2.0, which can be found [here](https://github.com/therecluse26/PHP-Login/tree/v2.0). This script is improved continuation of the PHP-login v2.0 script and is created especially for NodeJS using ExpressJS.
