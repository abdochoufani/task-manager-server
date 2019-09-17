'use strict';

var debug = require('debug')('etm:redis');
var redis = require('redis');
var bluebird = require('bluebird');
var config = require('../config');
var helpers = require('../lib/helpers');
var MykiError = require('../lib/errors').MykiError;
bluebird.promisifyAll(redis.RedisClient.prototype);

var client = redis.createClient(config.redis.port, config.redis.host);
client.on('error', function (err) {
    debug('Redis error:', err);
});

function dbGet(key) {
    return client.getAsync('myki+' + key);
}
 
function dbSet(key, data) {
    return client.setAsync('myki+' + key, data);
}

function dbDel(key) {
    return client.delAsync('myki+' + key);
}

function getUser(username, password) {
    if (!username || !password) {
        throw new MykiError('username and password are required', 400);
    }
    return dbGet('username:' + username).then(function (res) {
        if (!res) {
            return createUser(username, password);
        }
        return helpers.checkIfPasswordValid(password, res).then(function (valid) {
            if (!valid) {
                throw new MykiError('username and/or password are invalid', 401);
            }
            return username;
        });
    });
}

function createUser(username, password) {
    return helpers.getPasswordHash(password).then(function (passwordHash) {
        return dbSet('username:' + username, passwordHash);
    });
}

//
function getUserData(username) {
    if (!username) {
        throw new MykiError('username is required', 400);
    }
    return dbGet(username).then(function (res) {
        if (!res) {
            throw new MykiError('Data not found', 404);
        }
        return res;
    });
}

function setUserData(username, data) {
    if (!username) {
        throw new MykiError('username is required', 400);
    }
    if (!data) {
        throw new MykiError('data is required', 400);
    }
    return dbSet(username, data);
}

function unsetUserData(username) {
    if (!username) {
        throw new MykiError('username is required', 400);
    }
    return dbDel(username);
}

function closeConnection() {
    debug('Closing redis connection');
    client.quit();
}

//
exports.getUser = getUser;
exports.getUserData = getUserData;
exports.setUserData = setUserData;
exports.unsetUserData = unsetUserData;
exports.closeConnection = closeConnection;