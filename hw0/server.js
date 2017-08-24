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
var userNum = 0;

sqlConn.connect();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true      // support boolean
}));

function updateOnlineCount(userNum, username, more) {
    data = {
        userNum: userNum,
        username: username,
        more: more
    }
    conn.emit('update online count', data);
}

// Login the chatroom
app.post('/login', function(req, res) {
    console.log('login comes');
    var username = req.body.username;
    var password = req.body.password;
    sqlConn.query('SELECT * FROM user WHERE username=\'' + username + '\'', 
        function(err, sqlResult) {
            if (err) {
                console.log('select failed! ', err.message);
                return;
            }

            if (sqlResult.length == 0) {
                res.send('001');
            } else if (sqlResult[0].password != password) {
                res.send('002');
            } else if (sqlResult[0].isOnline == true) { // already online
                res.send('003');
            } else {
                res.send('000');
                userNum++;
                updateOnlineCount(userNum, username, true);
                console.log(username + ' just logged in');
                sqlConn.query('UPDATE user SET isOnline=true WHERE username=\'' 
                + username + '\'', function(err2, result) {
                    if (err2) {
                        console.log('update failed! ', err2.message);
                        return;
                    }
                });
            }
    });
});

// Register new user
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
                sqlConn.query('INSERT INTO user (username, password, isOnline) VALUES (?, ?, true)',
                arr, function(err, result) {
                    if (err) {
                        console.log('insert failed! ', err.message);
                        return;
                    }
                    res.send('100');
                    userNum++;
                    updateOnlineCount(userNum, username, true);
                    console.log(username + ' just logged in');
                });
            }
    });
});

// return the chat page
app.get('/', function(req, res) {
    //console.log('%d users connecting', userNum);
    res.sendFile(__dirname + '/public/index.html');
});

// return current userNum
app.post('/initUserNum', function(req, res) {
    var data = {
        userNum: userNum
    };
    res.send(data);
    console.log('initUserNum = ' + userNum);
})

// monitor the connection from client
conn.on('connection', function(socket) { 
    // Initialize the message from previous chat
    sqlConn.query('SELECT * FROM message', function(err, sqlResult) {
        if (err) {
            console.log('select error', err.message);
            return;
        } else {
            conn.emit('init message', sqlResult);
            //console.log(sqlResult);
        }
    });
    
    socket.on('input message', function(msg) {
        conn.emit('update message', msg);
        console.log(msg);
        var arr = [msg.fromUser, msg.sendTime, msg.content];
        sqlConn.query('INSERT INTO message (fromUser, sendTime, content) ' + 
            'VALUES (?, ?, ?)', 
            arr, function(err, result) {
                if (err) {
                    console.log('insert failed?!! ', err.message);
                    return;
                }
            });
    });

    socket.on('set online', function(username) {
        console.log('setting online for ' + username);
        sqlConn.query('SELECT isOnline from user WHERE username=\'' + 
        username + '\'', function(err, result) {
            if (err) {
                console.log('check online failed! ', err.message);
                return;
            }
            console.log(result[0].isOnline);
            if (result[0].isOnline == false) {
                sqlConn.query('UPDATE user SET isOnline=true WHERE username=\'' 
                + username + '\'', function(err, result) {
                    if (err) {
                        console.log('update failed! ', err.message);
                        return;
                    }
                    userNum++;
                    updateOnlineCount(userNum, username, true);
                    console.log(username + ' just logged in');
                });
            }
        });
    });

    socket.on('set offline', function(username) {
        console.log('setting offline for ' + username);        
        sqlConn.query('SELECT isOnline from user WHERE username=\'' + 
        username + '\'', function(err, result) {
            if (err) {
                console.log('check offline failed! ', err.message);
                return;
            }
            
            if (result[0].isOnline == true) {
                console.log('isOnline result: ' + result[0].isOnline);
                sqlConn.query('UPDATE user SET isOnline=false WHERE username=\'' 
                + username + '\'', function(err, result) {
                    if (err) {
                        console.log('update failed! ', err.message);
                        return;
                    }
                    if (userNum > 0) {
                        userNum--;
                        updateOnlineCount(userNum, username, false);
                    }                  
                    console.log(username + ' just logged out');
                });
            }
        });
    });

    socket.on('disconnect', function() {
        console.log('%d users are still online', userNum);
    });
})

var portNum = 8066;
server.listen(portNum, function() {
    console.log('Listening at port #' + portNum);
});

/*
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

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