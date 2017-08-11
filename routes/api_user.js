/**
 * Created by Felix on 20-5-2017.
 */

var express = require('express');
var router = express.Router();
var connector = require('../database/connector');

//SELECT (GET)
//select all users, or a specific user
router.get('/:username?', function (req, res) {

    var username = req.params.username;
    var query = "";

    if (username) {
        query = "SELECT * FROM user WHERE username = '" + username + "';";
    } else {
        query = "SELECT * FROM user";
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
                        res.status(200).json({"users": rows});
                    } else {
                        res.status(200).send("User '" + username + "' does not exists.");
                    }
                }
            })
        }
    })
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

//register a user
router.post('/register', function (req, res) {

    var firstName = req.body.firstName || '';
    var lastName = req.body.lastName || '';
    var email = req.body.email || '';
    var password = req.body.password || '';

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, null, function (err, hash) {
            password = hash;

            pool.getConnection(function (err, con) {
                con.query('INSERT INTO customer (first_name, last_name, email, password, active, create_date, last_update) VALUES ' +
                    '("' + firstName + '", "' + lastName + '", "' + email + '", "' + password + '", 0, now(), now());', function (error) {
                    con.release();
                    if (error) {
                        res.status(400).json({"error": "registration failed"});
                    } else {
                        res.status(200).json({"registration": "success"});
                    }
                });
            });
        });
    });
});

//login user and return a JWT
router.post('/login', function (req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    pool.getConnection(function (err, con) {
        con.query("SELECT * FROM customer WHERE email = '" + email + "';", function (err, rows) {
            con.release();
            if (err) {
                throw err;
            }
            var hashPass = rows[0].password;
            bcrypt.compare(password, hashPass, function (err, response) {
                if (response) {
                    res.status(200).json({
                        "token": auth.encodeToken(email),
                        "customerID": rows[0].customer_id
                    });
                } else {
                    res.status(401).json({"error": "Invalid credentials"});
                }
            });
        });
    });
});

module.exports = router;