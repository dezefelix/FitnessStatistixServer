/**
 * Created by Felix on 20-5-2017.
 */

var config = require('./config.json');
var express = require('express');
var app = express();

//configure port
app.set('PORT', config.port);
var port = process.env.PORT || app.get('PORT');

//app uses following routes
app.use('/api/user', require('./routes/api_user.js'));
app.use('/api/exercise', require('./routes/api_exercise.js'));
// app.use('/api/user', require('./routes/api_user.js'));
// app.use('/api/user', require('./routes/api_user.js'));
// app.use('/api/user', require('./routes/api_user.js'));

//log request information
app.all('*', function (req, res, next) {
    console.log(req.method + req.url);
    next();
});

//info page to show all usages of this api
app.get('/info', function (req, res) {
    res.send({
        "API routes info": [{
            "User" : [
                "api/user (GET)",
                "api/user/login\<username\> (GET) (unf)",
                "api/user/signup (POST) (unf)"
            ]
        }, {
            "Exercise" : [
                "api/exercise (GET) (unf)"
            ]
        }]
    })
});


//if no endpoint matches, show 404
app.all('*', function (req, res) {
    res.status(404);
    res.send("404 NOT FOUND");
});

//start server
app.listen(port, function () {
    console.log("Server listening at " + port);
});

// module.exports = app;