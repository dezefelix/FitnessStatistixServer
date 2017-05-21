/**
 * Created by Felix on 20-5-2017.
 */

var express = require('express');
var router = express.Router();
var connector = require('../database/connector');

//SELECT (GET)
//select all muscles, or a specific muscle
router.get('/:muscle?', function (req, res) {

    var muscle = req.params.muscle;
    var query = "";

    if (muscle) {
        query = "SELECT * FROM muscle WHERE name = '" + muscle + "';";
    } else {
        query = "SELECT * FROM muscle";
    }

    connector.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
        } else {
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                } else {
                    if (rows.length > 0) {
                        res.status(200).json({"muscles": rows});
                    } else {
                        res.status(200).send("Muscle '" + muscle + "' does not exists.");
                    }
                }
            })
        }
    })
});

module.exports = router;