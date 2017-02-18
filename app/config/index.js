/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const logger = require('../logger');

if (process.env.NODE_ENV === 'production') {

    // process.env.REDIS_URL :: redis://redistogo:abcefghijklmnop@cobia.redis.com

    let redisURI = require('url').parse(process.env.REDIS_URL);
    let redisPassword = redisURI.auth.split(':')[1];
    logger.log('debug', 'Redis URI is ----> ' + redisURI);
    logger.log('debug', 'Redis Password is ----> ' + redisPassword);
    logger.log('debug', 'Redis Host Name is ----> ' + redisURI.hostname);
    logger.log('debug', 'Redis Port is ----> ' + redisURI.port);
    module.exports = {
        host: process.env.host || "",
        dbURI: process.env.dbURI || "",
        sessionSecret: process.env.sessionSecret || "",
        "fb": {
            "clientID": process.env.fbClientID,
            "clientSecret": process.env.fbClientSecret,
            "callbackURL": process.env.host + "/auth/facebook/callback",
            "profileFields": [
                "id",
                "displayName",
                "photos"
            ],
            "enableProof": true
        },
        "twitter": {
            "consumerKey": process.env.twConsumerKey,
            "consumerSecret": process.env.twConsumerSecret,
            "callbackURL": process.env.host + "/auth/twitter/callback",
            "profileFields": [
                "id",
                "displayName",
                "photos"
            ]
        },
        "redis": {
            "host": redisURI.hostname,
            "port": redisURI.port,
            "password": redisPassword
        }
    }
} else {
    module.exports = require('./development.json');
}