/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');
const logger = require('../logger');

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

let findRoomById = (roomId) => {
    return db.roomsModel.findOne({"roomId": roomId}).exec();
}

let addUserToRoom = (data, socket, callback) => {

    if (data) {
        findRoomById(data.roomId).then(result => {

            if (result) {
                //Room exists already so add user
                //Get the active user id
                let userId = socket.request.session.passport.user;
                let checkUser = result.users.findIndex((element, index, array) => {
                    if (element.userId === userId) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (checkUser > -1) {
                    result.users.splice(checkUser, 1);
                }
                result.users.push({
                    socketId: socket.id,
                    userId,
                    user: data.user,
                    userPic: data.userPic
                });
                db.roomsModel.update({"roomId": data.roomId}, {$set: {"users": result.users}}, (err, updateResult) => {
                    if (!err) {
                        socket.join(data.roomId);
                        callback(data.roomId, socket, result.users);
                    } else {
                        logger.log('error', 'Error saving users --> ' + err)
                    }
                });
            }

        }).catch(err => logger.log('error', 'Error finding room ' + err));
    }
}


let getAllRooms = () => {
    return db.roomsModel.find({}).exec();
}

let removeUserFromRoom = (socket, callback) => {

    getAllRooms().then(results => {

        for (let room of results) {

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

                db.roomsModel.update({"room": room.room}, {$set: {"users": room.users}}, (err, raw) => {
                    if (!err) {
                        callback(room.roomId, socket, room.users);
                    } else {
                        logger.log('error', 'Failed to update user list ' + err);
                    }
                });

            }

        }

    }).catch(err => logger.log('error', 'Error getting rooms ' + err));

}

let addNewRoom = (newRoomIn, socket, callback) => {
    let roomInDB = db.roomsModel.findOne({"room": newRoomIn}, (err, results) => {
        if (err) {
            logger.log('error', 'Error finding room --> ' + err);
        } else if (!results) {
            //Room Does not exists
            //Create a new one
            let newRoom = new db.roomsModel({
                room: newRoomIn,
                roomId: randomHex(),
                users: []
            });
            newRoom.save(err => {
                if (!err) {
                    logger.log('info', 'New room saved succesfully..!!! ');
                    getAllRooms().then(results => {
                        callback(socket, results)
                    }).catch(err => logger.log('error', 'Unable to get all rooms ' + err));
                } else {
                    logger.log('error', 'New room not saved..!!! ');
                }
            });
        }
    });
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
    removeUserFromRoom,
    getAllRooms,
    addNewRoom
}