var port = 5000;
var namespace = 'myki';
var redis = {
    port: '6379',
    host: process.env.CONTAINERIZED ? 'redis' : 'localhost'
};

exports.port = process.env.MYKI_PORT || port;
exports.namespace = namespace;
exports.redis = redis;
