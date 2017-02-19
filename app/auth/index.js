/**
 * Created by Shivaji on 16/2/17.
 */
'use strict';

const passport = require('passport');
const config = require('../config');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const h = require('../helpers');
const l = require('../logger');

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        //find and fetch user data
        h.findById(id)
            .then(user => done(null, user))
            .catch(error =>
                l.error('Error when deserializing the user ', error)
            );
    });

    let authProcessor = (accessToken, refreshToken, profile, done) => {
        h.findOne(profile.id)
            .then(result => {
                if (result) {
                    done(null, result);
                } else {
                    // Create in DB and return
                    h.createNewUser(profile)
                        .then(newChatUser =>
                            done(null, newChatUser)
                        )
                        .catch(error =>
                            l.error('Error creating user ', error)
                        );

                }
            });
    }

    passport.use(new FacebookStrategy(config.fb, authProcessor));
    passport.use(new TwitterStrategy(config.twitter, authProcessor));
}