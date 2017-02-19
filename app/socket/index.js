/**
 * Created by Shivaji on 16/2/17.
 */
'use strict';
const h = require('../helpers');
const logger = require('../logger');

module.exports = (io, app) => {
    // let allrooms = app.locals.chatrooms;

    let broadcastChatRoomsList = (socket, allRooms) => {
        //Emit out new list. This emits to the one who triggered it
        socket.emit('chatRoomsList', JSON.stringify(allRooms));
        //Emit to every one
        socket.broadcast.emit('chatRoomsList', JSON.stringify(allRooms));
    }

    io.of('/roomslist').on('connection', socket => {

        socket.on('getChatrooms', () => {
            h.getAllRooms().then(allRooms => {
                socket.emit('chatRoomsList', JSON.stringify(allRooms));
            }).catch(err => logger.log('error', 'Error getting all rooms ' + err));
        });

        socket.on('createNewRoom', newRoomInput => {
            h.addNewRoom(newRoomInput, socket, broadcastChatRoomsList);
        });

    });

    let broadCastUpdatedUserList = (roomId, socket, usersList) => {
        if (socket) {
            socket.broadcast.to(roomId)
                .emit('updateUserList', JSON.stringify(usersList));
            socket.emit('updateUserList', JSON.stringify(usersList));
        }
    }

    io.of('/chatter').on('connection', socket => {

            socket.on('join', data => {
                h.addUserToRoom(data, socket, broadCastUpdatedUserList);
            });

            socket.on('disconnect', () => {
                h.removeUserFromRoom(socket, broadCastUpdatedUserList);
            });

            socket.on('newMessage', data => {
                socket.to(data.roomId).emit('inMessage', JSON.stringify(data));
            });

        }
    )
    ;


}
;