const fs = require('fs');

const dockerSecret = {};

dockerSecret.read = function read(secretName) {
    return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8');
};

module.exports = dockerSecret;