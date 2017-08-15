/**
 * Created by Felix on 20-5-2017.
 */

var connector = require('../database/connector');
var auth = require('../auth/authentication');

var bcrypt = require('bcrypt-nodejs');
var saltRounds = 10;
var express = require('express');
var router = express.Router();

//select all users, or a specific user (used to check if email already exists)
router.get('/:email?', function (req, res) {

    var email = req.params.email;
    var query = "";

    if (email) {
        query = "SELECT * FROM user WHERE email = '" + email + "';";
    } else {
        query = "SELECT * FROM user";
    }

    connector.getConnection(function (err, con) {
        if (err) {
            res.status(404).json({"error": "error connecting to server"})
        }
        con.query(query, function (err, rows) {
            con.release();
            if (err) {
                // console.log(err);
            } else {
                if (rows.length > 0) {
                    res.status(200).json({"users": rows});
                } else {
                    res.status(200).send({"User": "'" + email + "' does not exist."});
                }
            }
        })
    })
});

//register a user (with the password hashed)
router.post('/register', function (req, res) {

    var firstName = req.body.firstName || '';
    var lastName = req.body.lastName || '';
    var email = req.body.email || '';
    var password = req.body.password || '';

    var query = "INSERT INTO user (firstName, lastName, email, password, created, updated) VALUES " +
        "('" + firstName + "', '" + lastName + "', '" + email + "', '" + password + "', " +
        "ADDTIME(now(), \'02:00:00\'), ADDTIME(now(), \'02:00:00\'));";

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, null, function (err, hash) {
            password = hash;

            connector.getConnection(function (err, con) {
                con.query(query, function (error) {
                    con.release();
                    if (error) {
                        res.status(404).json({"registration": "failed"});
                    } else {
                        res.status(200).json({"registration": "success"});
                    }
                });
            });
        });
    });
});

//every endpoint below, except for /login, needs JWT authorization
router.all(new RegExp("[^(\/login)]"), function (req, res, next) {

    console.log("Validating token...");

    var token = (req.header('Auth')) || '';

    auth.decodeToken(token, function (err, payload) {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("NOT AUTHORISED").message});
        } else {
            console.log("AUTHORISED");
            next();
        }
    });
});

//login user and return a JWT
router.post('/login', function (req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    var query = "SELECT * FROM user WHERE email = '" + email + "';";

    connector.getConnection(function (err, con) {
        if (err) {
            res.status(404).json({"error": "error connecting to server"});
        }
        con.query(query, function (err, rows) {
            con.release();
            if (rows.length < 1) {
                res.status(404).json({"log in": "failed"});
            } else {
                var hashPass = rows[0].password;
                bcrypt.compare(password, hashPass, function (err, result) {
                    if (result) {
                        res.status(200).json({
                            "token": auth.encodeToken(email),
                            "userId": rows[0].userId,
                            "firstName": rows[0].firstName,
                            "lastName": rows[0].lastName,
                            "email": rows[0].email
                        });
                    } else {
                        res.status(404).json({"log in": "failed"});
                    }
                });
            }
        });
    });
});

module.exports = router;