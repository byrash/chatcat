/**
 * Created by Shivaji on 16/2/17.
 */
'use strict';
const h = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {

        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });

        socket.on('createNewRoom', newRoomInput => {

            if (!h.findRoomByName(allrooms, newRoomInput)) {
                allrooms.push({
                    room: newRoomInput,
                    roomId: h.randomHex(),
                    users: []
                });
            }

            //Emit out new list. This emits to the one who triggered it
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
            //Emit to every one
            socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));

        });

    });

    io.of('/chatter').on('connection', socket => {

            socket.on('join', data => {

                let usersList = h.addUserToRoom(allrooms, data, socket);

                if (usersList !== undefined) {
                    socket.broadcast.to(data.roomId)
                        .emit('updateUserList', JSON.stringify(usersList.users));
                    socket.emit('updateUserList', JSON.stringify(usersList.users));
                }

            });

            socket.on('disconnect', () => {
                let room = h.removeUserFromRoom(allrooms, socket);
                if (room !== undefined) {
                    socket.broadcast.to(room.roomId).emit('updateUserList', JSON.stringify(room.users));
                }
            });

            socket.on('newMessage', data => {
                socket.to(data.roomId).emit('inMessage', JSON.stringify(data));
            });

        }
    )
    ;


}
;