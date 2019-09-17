'use strict';
var config = require('../config');

var serverUrl = 'http://localhost:' + config.port + '/' + config.namespace;
function MykiSocket(username, password) {
    var socket = require('socket.io-client')(serverUrl, {
        query: {
            username: username,
            password: password
        }
    });

    // socket.on('connection', function () {
    //     console.log('connected with username:', username);
    // });

    function getTasks() {
        socket.emit('getTasks');
    }

    function setTasks(data) {
        socket.emit('setTasks', { data: data });
    }

    function removeTasks() {
        socket.emit('removeTasks');
    }

    return {
        socket: socket,
        getTasks: getTasks,
        setTasks: setTasks,
        removeTasks: removeTasks
    };
}

module.exports = MykiSocket;

if (!module.parent) {
    var client = new MykiSocket('test', 'user');
    client.socket.emit('setTasks', 'hello');
    client.socket.emit('getTasks');
}
