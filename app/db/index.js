/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);
const logger = require('../logger');

Mongoose.Promise = global.Promise;
Mongoose.connection.on('error', error => {
    logger.log('error', 'Mongoose failed with error ' + error);
})

//Create a schema that defines the structure for storing use data
const chatUser = new Mongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String
});

const allRooms = new Mongoose.Schema({
    room: String,
    roomId: String,
    users: [{
        socketId: String,
        userId: String,
        user: String,
        userPic: String
    }]
});

//Turn schema into model
let userModel = Mongoose.model('chatUser', chatUser);
let roomsModel = Mongoose.model('allRooms', allRooms);

module.exports = {
    Mongoose,
    userModel,
    roomsModel
}