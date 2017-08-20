var express = require('express');
var http = require('http');
var io = require('socket.io');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');

// get variables prepared
var app = express();
var server = http.Server(app);
var conn = io(server);
var sqlConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'chatroom'
});

sqlConn.connect();  
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(bodyParser.urlencoded({
    extended: true      // support boolean
}));

/*
app.use(function(req, res, next) {
    if (req.session.user) {
        console.log('next@33');
        next();
    } else {
        var slashIndex = req.url.indexOf('/');
        var path = req.url.substr(slashIndex + 1);
        if (path == '' || path == 'login' || path == 'register') {
            next();
        } else {
            req.session.fromUrl = req.fromUrl? req.fromUrl: null;
            res.sendFile(__dirname+ '/login.html')
            //res.redirect('/login');
        }
    }
});
app.get('/login', function(req, res) {
    res.sendFile(__dirname+ '/login.html');
});

app.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    sqlConn.query('SELECT password FROM user WHERE username=' + username, 
        function(err, sqlResult) {
            if (err) {
                console.log('select failed! ', err.message);
                return;
            }
            console.log(sqlResult);
            if (sqlResult === '') {
                res.send('001');
            } else if (sqlResult !== password) {
                res.send('002');
            } else {
                req.session.user = username;
                var toUrl = req.session.fromUrl == null? '/' : req.session.fromUrl;
                req.session.fromUrl = null;
                res.redirect(toUrl);
            }
    });
});
*/
app.post('/login', function(req, res) {
    console.log('login comes');
    var username = req.body.username;
    var password = req.body.password;
    sqlConn.query('SELECT password FROM user WHERE username=\'' + username + '\'', 
        function(err, sqlResult) {
            if (err) {
                console.log('select failed! ', err.message);
                return;
            }

            if (sqlResult.length == 0) {
                res.send('001');
            } else if (sqlResult[0].password != password) {
                res.send('002');
            } else {
                res.send('000');
            }
    });
});

app.post('/register', function(req, res) {
    console.log('register comes');
    var username = req.body.username;
    var password = req.body.password;
    sqlConn.query('SELECT * FROM user WHERE username=\'' + username + '\'', 
        function(err, sqlResult) {
            if (err) {
                console.log('select failed! ', err.message);
                return;
            }

            if (sqlResult.length != 0) {
                res.send('101');
            } else {
                var arr = [username, password];
                sqlConn.query('INSERT INTO user (username, password) VALUES (?, ?)',
                arr, function(err, result) {
                    if (err) {
                        console.log('insert failed! ', err.message);
                        return;
                    }
                    res.send('100');
                });
            }
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var userNum = 0;
conn.on('connection', function(socket) { 
    userNum++;
    console.log(userNum + ' users are connecting');
    
    // Initialize the message from previous chat
    sqlConn.query('SELECT * FROM message', function(err, sqlResult) {
        if (err) {
            console.log('select error', err.message);
            return;
        } else {
            conn.emit('init message', sqlResult);
            console.log(sqlResult);
        }
    });
    
    socket.on('input message', function(msg) {
        conn.emit('update message', msg);
        console.log(msg);
        var arr = [msg.fromUser, msg.sendTime, msg.isAnon, msg.content];
        sqlConn.query('INSERT INTO message (fromUser, sendTime, isAnon, content) ' + 
            'VALUES (?, ?, ?, ?)', 
            arr, function(err, result) {
                if (err) {
                    console.log('insert failed! ', err.message);
                    return;
                }
            });
    });

    socket.on('disconnect', function() {
        userNum--;
        console.log('A user has left, %d users are still online', userNum);
    });
})

var portNum = 8066;
server.listen(portNum, function() {
    console.log('Listening at port #' + portNum);
});