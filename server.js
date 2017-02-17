/**
 * Created by Shivaji on 15/2/17.
 */
'use strict';

const express = require('express');
const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
// app.set('views', './views');
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            // Write to logs
            chatCat.logger.log('info', message);
        }
    }
}));

app.use('/', chatCat.router);


chatCat.ioServer(app).listen(app.get('port'), () => {
    console.log('ChatCat is Running on Port -- ', app.get('port'));
})