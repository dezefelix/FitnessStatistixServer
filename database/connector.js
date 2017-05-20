/**
 * Created by Felix on 20-5-2017.
 */

var config = require('../config.json');
var mysql = require('mysql');

var connector = mysql.createPool({
    host : config.dbHost,
    user : config.dbUser,
    password : config.dbPassword,
    database : config.dbDatabase
});

module.exports = connector;