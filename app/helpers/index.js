/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

// Registers Routes
let _registerRoutes = (routes, method) => {
    for (let key in routes) {
        if (typeof routes[key] === 'object' &&
            routes[key] != null && !(routes[key] instanceof Array)) {
            _registerRoutes(routes[key], key);
        } else {
            //Register route
            if (method === 'get') {
                router.get(key, routes[key])
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key])
            }
        }
    }
}

let route = routes => {
    _registerRoutes(routes);
    return router;
}

// Find a single document based on a key

let findOne = profileID => {
    return db.userModel.findOne({
        "profileId": profileID
    });
}

let createNewUser = profile => {
    return new Promise((resolve, reject) => {

        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        });

        newChatUser.save(error => {
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}


let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}

//assert user is authticated
let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/')
    }
}

//Find room by name
let findRoomByName = (allrooms, room) => {

    let findRoom = allrooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom > -1 ? true : false;
}

let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

let findRoomById = (allrooms, roomId) => {
    return allrooms.find((element, index, array) => {
        if (element.roomId === roomId) {
            return true;
        } else {
            return false;
        }
    });
}

let addUserToRoom = (allrooms, data, socket) => {

    let getRoom = findRoomById(allrooms, data.roomId);

    if (getRoom !== undefined) {
        //Get the active user id
        let userId = socket.request.session.passport.user;
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if (element.userId === userId) {
                return true;
            } else {
                return false;
            }
        });

        if (checkUser > -1) {
            getRoom.users.splice(checkUser, 1);
        }

        getRoom.users.push({
            socketId: socket.id,
            userId,
            user: data.user,
            userPic: data.userPic
        });

        socket.join(data.roomId);

        return getRoom;
    }
}

let removeUserFromRoom = (allrooms, socket) => {
    for (let room of allrooms) {
        let findUser = room.users.findIndex((element, index, array) => {
            if (element.socketId === socket.id) {
                return true;
            } else {
                return false;
            }
        });

        if (findUser > -1) {
            socket.leave(room.roomId);
            room.users.splice(findUser, 1);
            return room;
        }
    }
}


module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomById,
    addUserToRoom,
    removeUserFromRoom
}