'use strict';

var bcrypt = require('bcrypt');
var saltRounds = 10;

function getPasswordHash(password) {
    return bcrypt.hash(password, saltRounds);
}

function checkIfPasswordValid(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Source: http://stackoverflow.com/a/14944262/808431
function generateRandomString(length) {
    return Array.apply(0, Array(length || 7)).map(function () {
        return (function (charset) {
            return charset.charAt(Math.floor(Math.random() * charset.length));
        }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'));
    }).join('');
}

exports.getPasswordHash = getPasswordHash;
exports.checkIfPasswordValid = checkIfPasswordValid;
exports.generateRandomString = generateRandomString;
