const MongoClient = require('mongodb').MongoClient;

// Note: A production application should not expose database credentials in plain text.
// For strategies on handling credentials, visit 12factor: https://12factor.net/config.
const LOGIN_URI = "mongodb://localhost:27017/login";

async function connect(url) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    return client.db();
}

module.exports = async function () {
    let databases = await Promise.all([connect(LOGIN_URI)]);
    return {
        login: databases[0]
    }
}
