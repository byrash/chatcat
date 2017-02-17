/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const config = require('./config');
const redis = require('redis').createClient;
const redisAdapter = require('socket.io-redis');

require('./auth')();

//Create an IO Server instance
let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app);
    const io = require('socket.io')(server);
    io.set('transports', ['websocket']);
    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    let subClient = redis((config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    }));

    io.adapter(redisAdapter({
        pubClient,
        subClient
    }));

    io.use((socket, next) => {
        require('./session')(socket.request, {}, next);
    });
    require('./socket')(io, app);
    return server;
}

// const router = require('express').Router();

// router.get('/', (req, res, next) => {
//     //res.send('<h1>Hello World from Express!!</h1>');
//     // res.sendFile(__dirname + '/views/login.ejs');
//     res.render('login');
// });


module.exports = {
    router: require('./routes')(),
    session: require('./session'),
    ioServer,
    logger: require('./logger')
}