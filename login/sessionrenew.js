const utils = require('./utils');

module.exports = function (req, res) {
    const token = req.cookies.token;
    if (!token) {
        return {
            status: false,
            error: 401
        }
    }
    var payload = null;
    try {
        payload = utils.jwt.verify(token, utils.config.jwt_key);
    } catch (e) {
        if (e instanceof utils.jwt.JsonWebTokenError) {
            return {
                status: false,
                error: 401
            }
        }
        return {
            status: false,
            error: 400
        }
    }
    // Do not update session if rememberMe is true
    if (payload.rememberMe) {
        return {
            status: false,
            error: 400
        }
    }
    // We ensure that a new token is not issued until enough time has elapsed.
    // In this case, a new token will only be issued if the old token is within
    // 30 seconds of expiry. Otherwise, return a bad request status.
    const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
    if (payload.exp - nowUnixSeconds > 30) {
        return {
            status: false,
            error: 400
        }
    }
    // Now, create a new token for the current user, with a renewed expiration time
    const newToken = utils.jwt.sign({ username: payload.username, rememberMe: payload.rememberMe }, utils.config.jwt_key, {
        algorithm: utils.config.jwt_algorithm,
        expiresIn: utils.config.jwt_session_timeout
    });
    // Set the new token as the users token cookie
    res.cookie('token', newToken, { httpOnly: true });
    return { status: true }
}