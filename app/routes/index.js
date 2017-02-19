/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');
const l = require('../logger');

module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login');
            },
            '/rooms': [h.isAuthenticated, (req, res, next) => {
                res.render('rooms', {
                    "user": req.user,
                    host: config.host
                });
            }],
            '/chat/:id': [h.isAuthenticated, (req, res, next) => {
                //Assert if ID exits
                h.findRoomById(req.params.id).then(room => {
                    if (!room) {
                        next();
                    } else {
                        res.render('chatroom', {
                            "user": req.user,
                            host: config.host,
                            room: room.room,
                            roomId: room.roomId
                        });
                    }
                }).catch(err => l.error('Erro getting room ', err));
            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req, res, next) => {
                req.logout();
                res.redirect("/");
                //next();
            }
        },
        'post': {},
        'NA': (req, res, next) => {
            res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    }

    return h.route(routes);

}

