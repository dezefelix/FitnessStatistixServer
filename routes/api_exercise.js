/**
 * Created by Felix on 20-5-2017.
 */

var express = require('express');
var router = express.Router();
var connector = require('../database/connector');

//SELECT (GET)
//select all exercises, or a specific exercise
router.get('/:exercise?', function (req, res) {

    var exercise = req.params.exercise;
    var query = "";

    if (exercise) {
        query = "SELECT * FROM exercise WHERE name = '" + exercise + "';";
    } else {
        query = "SELECT * FROM exercise";
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
                        res.status(200).json({"exercises": rows});
                    } else {
                        res.status(200).send("Exercise '" + exercise + "' does not exists.");
                    }
                }
            })
        }
    })
});

module.exports = router;