/**
 * Created by Felix on 15-8-2017.
 */

var connector = require('../database/connector');
var auth = require('../auth/authentication');

var express = require('express');
var router = express.Router();

//every endpoint below, except for /login, needs JWT authorization
router.all('*', function (req, res, next) {

    console.log("Validating token...");

    var token = (req.header('Auth')) || '';

    auth.decodeToken(token, function (err) {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("NOT AUTHORISED").message});
        } else {
            console.log("AUTHORISED");
            next();
        }
    });
});

//select all exercises, or a specific exercise
router.get('/:workoutId?', function (req, res) {

    var workoutId = req.params.workoutId;
    var query = "";

    if (workoutId) {
        query = "SELECT * FROM workout WHERE workoutId = " + workoutId + ";";
    } else {
        query = "SELECT * FROM workout";
    }

    connector.getConnection(function (err, connection) {
        if (err) {
            res.status(404).json({"error": "error connecting to server"})
        } else {
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    console.log(err);
                } else {
                    if (rows.length > 0) {
                        res.status(200).json({"workouts": rows});
                    } else {
                        res.status(200).send("Workout #" + workoutId + " does not exist.");
                    }
                }
            })
        }
    })
});

//get all workouts from a specific user
router.get('/user-bound-workouts/:userId', function (req, res) {

    var userId = req.params.userId;
    var query = "SELECT `set`.workoutId, workout.`date`, startTime, endTime, setId, repetitions, weight, exercise.`name`" +
        "FROM workout " +
        "INNER JOIN `set` " +
        "ON workout.workoutId = `set`.workoutId " +
        "INNER JOIN exercise " +
        "ON `set`.exerciseId = exercise.exerciseId " +
        "WHERE userId = " + userId + ";";

    connector.getConnection(function (err, con) {
        if (err) {
            res.status(404).json({"error": "error connecting to server"});
        }
        con.query(query, function (err, rows) {
            con.release();
            if (err) {
                res.status(404).json({"data retrieval": "no data"});
            } else {
                if (rows.length < 1) {
                    res.status(404).json({"data retrieval": "no data"});
                } else {
                    res.status(200).json({"sets": rows})
                }
            }
        });
    });
});

module.exports = router;