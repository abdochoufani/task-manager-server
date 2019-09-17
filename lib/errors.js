'use strict';

var debug = require('debug')('etm:error');
var STATUSES = {
    '400': 'BadRequest',
    '401': 'Unauthorized',
    '404': 'NotFound',
    '500': 'InternalError'
};

function MykiError(message, statusCode) {
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.error = STATUSES[statusCode];
    this.status = 'failed';
    this.message = message || 'An error has occured';
    this.stack = (new Error()).stack;
}

function emitError(socket, eventName, error) {
    debug(eventName, error);
    if (!(error instanceof MykiError)) {
        error = {
            statusCode: 500,
            error: 'InternalError',
            status: 'failed',
            message: 'An error has occured'
        };
    }
    var emitTo = eventName === 'connection' ? eventName : 'tasks';
    socket.emit(emitTo, {
        eventName: eventName,
        statusCode: error.statusCode,
        error: error.error,
        status: error.status,
        message: error.message
    });
}

function emitUnauthorizedError(socket, eventName) {
    return emitError(socket, eventName, new MykiError('username and/or password are invalid', 401));
}

exports.MykiError = MykiError;
exports.emitError = emitError;
exports.emitUnauthorizedError = emitUnauthorizedError;
