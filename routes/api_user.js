/**
 * Created by Felix on 20-5-2017.
 */

var express = require('express');
var router = express.Router();
var connector = require('../database/connector');

//SELECT (GET)
//select all users, or a specific user
router.get('/', function(req, res) {

    var query = "SELECT * FROM user";

    connector.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
        } else {
            connection.query(query, function(err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).json({"users": rows});
                }
            })
        }
    })
});

module.exports = router;