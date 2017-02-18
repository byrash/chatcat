/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');
const logger = require('../logger');

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
                let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
                if (getRoom === undefined) {
                    return next();
                } else {
                    res.render('chatroom', {
                        "user": req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomId: getRoom.roomId
                    });
                }
            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': (req, res, next) => {
                return passport.authenticate('facebook',
                    {
                        successRedirect: '/rooms',
                        failureRedirect: '/'
                    },
                    (err, user, info) => {
                        if (err) {
                            logger.error('#$%^&*()#$%^&*() ---> ' + err);
                            res.redirect('/');
                        }
                        else {
                            next();
                        }
                    });
            },
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

