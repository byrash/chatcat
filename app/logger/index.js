/**
 * Created by Shivaji on 18/2/17.
 */
'use strict';

const winston = require('winston');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            level: 'debug',
            filename: './chatCatDebug.log',
            handleExceptions: true
        }),
        new (winston.transports.Console)({
            level: 'debug',
            json: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});

let _join = (...msgs) => {
    let finalMsg = '';
    for (let msg of msgs) {
        finalMsg += msg;
    }
    return finalMsg;
}

let _logIt = (level, ...msgs) => {
    logger.log(level, _join(msgs));
}

let debug = (...msgs) => {
    _logIt('debug', msgs);
}
let info = (...msgs) => {
    _logIt('info', msgs);
}
let warn = (...msgs) => {
    _logIt('warn', msgs);
}
let error = (...msgs) => {
    _logIt('error', msgs);
}

module.exports = {
    logger,
    debug,
    info,
    warn,
    error
};