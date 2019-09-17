'use strict';

var debug = require('debug')('etm:index');
var io = require('socket.io')();
var redis = require('./lib/redis');
var config = require('./config');
var emitError = require('./lib/errors').emitError;
var emitUnauthorizedError = require('./lib/errors').emitUnauthorizedError;

io
.of(config.namespace)
.on('error', console.error)
.on('connection', function (socket) {
    debugger
    var authenticated = false;
    //only change As i was not able to add the data to the request.headers I sent them as request._query
    var username = socket.request._query.username;
    var password = socket.request._query.password;
    var authenticationTimeout;

    if (username) {
        handleConnection();
    } else {
        // If the user doesn't authenticate during this time (3 seconds after connection), disconnect the socket
        authenticationTimeout = setTimeout(function() {
            if (!authenticated) {
                emitError(socket, 'connection', 'connection timed out');
                socket.disconnect();
            }
        }, 3000);
        socket.emit('connection', {
            status: 'pending'
        });
    }

    socket.on('authenticate', function (data) {
        debugger
        if (authenticated) {
            emitError(socket, 'connection', 'already authenticated');
            return;
        }
        username = data.username;
        password = data.password;
        handleConnection();
    });

    socket.on('getTasks', function () {
        if (!authenticated) {
            return emitUnauthorizedError(socket, 'getTasks');
        }
        return redis.getUserData(username).then(function (data) {
            socket.emit('tasks', {
                eventName: 'getTasks',
                status: 'success',
                data: data
            });
        }).catch(function (err) {
            emitError(socket, 'getTasks', err);
        });
    });

    socket.on('setTasks', function (query) {
        if (!authenticated) {
            return emitUnauthorizedError(socket, 'setTasks');
        }
        return redis.setUserData(username, query.data).then(function (data) {
            socket.emit('tasks', {
                eventName: 'setTasks',
                status: 'success'
            });
        }).catch(function (err) {
            emitError(socket, 'setTasks', err);
        });
    });

    socket.on('removeTasks', function () {
        if (!authenticated) {
            return emitUnauthorizedError(socket, 'removeTasks');
        }
        return redis.unsetUserData(username).then(function () {
            socket.emit('tasks', {
                eventName: 'removeTasks',
                status: 'success'
            });
        }).catch(function (err) {
            emitError(socket, 'removeTasks', err);
        });
    });

    function handleConnection() {
        clearTimeout(authenticationTimeout);
        redis.getUser(username, password).then(function () {
            debug('user connected:', username);
            authenticated = true;
            socket.emit('connection', {
                status: 'success',
                data: {
                    username: username
                }
            });
            socket.on('disconnect', function () {
                debug('user disconnected:', username);
            });
        }).catch(function (err) {
            emitError(socket, 'connection', err);
            setTimeout(function() {
                socket.disconnect();
            }, 100);
        });
    }
});

io.listen(config.port);
debug('socket server up and running on port ' + config.port);

process.on('SIGTERM', closeConnection);

function closeConnection() {
    debug('Shutting down..');
    redis.closeConnection();
    io.close();
}

exports.io = io;
exports.closeConnection = closeConnection;
