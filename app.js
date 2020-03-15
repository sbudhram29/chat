var express = require('express');
var path = require('path');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);
var uuid = require('uuid-js');

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
// const url = 'mongodb://localhost:27017';
const url = 'mongodb://mskcc:mskcc1234@ds217452.mlab.com:17452/heroku_v4mvnch9';

// Database Name
const dbName = 'chat-box';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);

    var db = client.db(dbName);
    var messageCollection = db.collection('messages');
    var userCollection = db.collection('users');

    io.on('connection', function (socket) {
        userCollection.find({}).limit(20).toArray().then(res => {

            res.map(user => {
                socket.emit('add user', user)
            })
        }
        );
        messageCollection.find({}).limit(100).toArray().then(res => {

            res.map(message => {
                socket.emit('chat message', message)
            })
        }
        );

        socket.on('disconnect', function () {

            if (socket.currentUser) {

                socket.broadcast.emit('update user list', socket.currentUser);
                userCollection.deleteOne(socket.currentUser);

                socket.broadcast.emit('chat message', {
                    name: socket.currentUser.name,
                    message: ' left the chat.'
                });

            }
        });

        socket.on('logout', function (data) {
            userCollection.deleteOne(socket.currentUser);
            io.emit('update user list', socket.currentUser);
        });

        socket.on('chat message', function (data) {
            messageCollection.insertOne(data);
            socket.broadcast.emit('chat message', data);
        });

        socket.on('enter leave', function (data) {
            socket.broadcast.emit('chat message', data);
        });

        socket.on('is typing', function (data) {
            socket.broadcast.emit('is typing', data);
        });

        socket.on('add user', function (data) {
            let id = uuid.create().toString();
            let user = { id: id, name: data.name }

            socket.currentUser = user;

            socket.broadcast.emit('chat message', {
                name: socket.currentUser.name,
                message: ' has entered the chat.'
            });

            userCollection.insertOne(user);

            io.emit('add user', user);
        });
    });



    http.listen(port, function () {
        console.log('listening on localhost:3000');
    });

});