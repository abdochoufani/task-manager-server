'use strict';

var should = require('chai').should();
var redis = require('../lib/redis');
var helpers = require('../lib/helpers');
var MykiClient = require('../lib/client');
var server;

before(function () {
    server = require('../index');
});

after(function () {
    server.closeConnection();
});

describe('connection', function () {
    it('should create user if new username and password', function (done) {
        var username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        var mykiClient = new MykiClient(username, password);
        var socket = mykiClient.socket;
        socket.once('error', function (err) {
            done(err);
        });
        socket.once('connection', function (data) {
            should.exist(data);
            should.exist(data.status);
            data.status.should.be.equal('success');
            done();
        });
    });

    it('should drop connection if username exists and password is wrong', function (done) {
        var username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        redis.getUser(username, password).then(function () {
            password = helpers.generateRandomString(12);
            var mykiClient = new MykiClient(username, password);
            var socket = mykiClient.socket;
            socket.once('error', function (err) {
                done(err);
            });
            socket.once('connection', function (data) {
                should.exist(data);
                should.exist(data.status);
                data.status.should.be.equal('failed');
                done();
            });
        });
    });

    it('should connect if username and password are correct', function (done) {
        var username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        redis.getUser(username, password).then(function () {
            var mykiClient = new MykiClient(username, password);
            var socket = mykiClient.socket;
            socket.once('error', function (err) {
                console.error(err);
                done(new Error('Should connect'));
            });
            socket.once('connection', function (data) {
                should.exist(data);
                should.exist(data.status);
                data.status.should.be.equal('success');
                done();
            });
        });
    });

    it('should emit a pending connection if username isn\'t sent in the headers', function (done) {
        var mykiClient = new MykiClient('', '');
        var socket = mykiClient.socket;
        socket.once('error', function (err) {
            console.error(err);
            done(new Error('Should connect'));
        });
        socket.once('connection', function (data) {
            should.exist(data);
            should.exist(data.status);
            data.status.should.be.equal('pending');
            done();
        });
    });

    it('should connect if username and password are correct, and sent through the authenticate event', function (done) {
        var username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        redis.getUser(username, password).then(function () {
            var mykiClient = new MykiClient('', '');
            var socket = mykiClient.socket;
            socket.once('error', function (err) {
                console.error(err);
                done(new Error('Should connect'));
            });
            socket.on('connection', function (data) {
                should.exist(data);
                should.exist(data.status);
                if (data.status === 'pending') {
                    socket.emit('authenticate', {
                        username: username,
                        password: password
                    });
                } else if (data.status === 'success') {
                    should.exist(data);
                    should.exist(data.status);
                    data.status.should.be.equal('success');
                    done();
                } else {
                    done(new Error('Should connect'));
                }
            });
        });
    });
});

describe('getTasks - invalid', function () {
    var mykiClient, socket, username;
    before(function () {
        username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        mykiClient = new MykiClient(username, password);
        socket = mykiClient.socket;
    });

    it('should return an error if no tasks are stored', function (done) {
        socket.once('tasks', function (data) {
            should.exist(data);
            should.exist(data.status);
            should.exist(data.eventName);
            data.status.should.be.equal('failed');
            data.eventName.should.be.equal('getTasks');
            done();
        });
        socket.once('error', function (err) {
            console.error(err);
            done(new Error('Should connect'));
        });
        socket.once('connection', function (err) {
            mykiClient.getTasks();
        });
    });
});

describe('getTasks - valid', function () {
    var mykiClient, socket, username;
    before(function () {
        username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        mykiClient = new MykiClient(username, password);
        socket = mykiClient.socket;
    });

    it('should return stored tasks if available', function (done) {
        var randomData = helpers.generateRandomString(8);
        redis.setUserData(username, randomData).then(function () {
            socket.once('tasks', function (data) {
                should.exist(data);
                should.exist(data.status);
                should.exist(data.data);
                should.exist(data.eventName);
                data.status.should.be.equal('success');
                data.data.should.be.equal(randomData);
                data.eventName.should.be.equal('getTasks');
                done();
            });
            socket.once('error', function (err) {
                console.error(err);
                done(new Error('Should connect'));
            });
            socket.once('connection', function (err) {
                mykiClient.getTasks();
            });
        });
    });
});

describe('setTasks', function () {
    var mykiClient, socket, username;
    before(function () {
        username = helpers.generateRandomString(8);
        var password = helpers.generateRandomString(12);
        mykiClient = new MykiClient(username, password);
        socket = mykiClient.socket;
    });

    it('should store user data', function (done) {
        var randomData = helpers.generateRandomString(8);
        socket.once('tasks', function (data) {
            should.exist(data);
            should.exist(data.status);
            should.exist(data.eventName);
            data.status.should.be.equal('success');
            data.eventName.should.be.equal('setTasks');
            redis.getUserData(username, randomData).then(function (data) {
                data.should.be.equal(randomData);
                done();
            });
        });
        socket.once('error', function (err) {
            console.error(err);
            done(new Error('Should not error'));
        });
        socket.once('connection', function (err) {
            mykiClient.setTasks(randomData);
        });
    });
});
