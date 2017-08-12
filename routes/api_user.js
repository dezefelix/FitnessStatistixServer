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

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, null, function (err, hash) {
            password = hash;

            connector.getConnection(function (err, con) {
                con.query('INSERT INTO user (firstName, lastName, email, password, created, updated) VALUES ' +
                    '("' + firstName + '", "' + lastName + '", "' + email + '", "' + password + '",' +
                    'ADDTIME(now(), \'02:00:00\'), ADDTIME(now(), \'02:00:00\'));', function (error) {
                    con.release();
                    if (error) {
                        res.status(400).json({"registration": "failed"});
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

    console.log("VALIDATING TOKEN");

    var token = (req.header('Auth')) || '';

    auth.decodeToken(token, function (err, payload) {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("Not authorised").message});
        } else {
            next();
        }
    });
});

//login user and return a JWT
router.post('/login', function (req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    connector.getConnection(function (err, con) {
        con.query("SELECT * FROM user WHERE email = '" + email + "';", function (err, rows) {
            con.release();
            if (err) {
                throw err;
            }
            var hashPass = rows[0].password;
            bcrypt.compare(password, hashPass, function (err, response) {
                if (response) {
                    res.status(200).json({
                        "token": auth.encodeToken(email),
                        "userId": rows[0].userId,
                        "firstName": rows[0].userId,
                        "lastName": rows[0].userId,
                        "email": rows[0].userId
                    });
                } else {
                    res.status(401).json({"error": "Invalid credentials"});
                }
            });
        });
    });
});

module.exports = router;