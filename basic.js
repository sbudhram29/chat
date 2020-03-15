var express = require('express');
var path = require('path');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);
var uuid = require('uuid-js');

app.use(express.static(path.join(__dirname, 'public')));


var messageCollection = [];
var userCollection = [];

io.on('connection', function (socket) {

        messageCollection.map(user => {
            socket.emit('add user', user)
        })

        userCollection.map(message => {
            socket.emit('chat message', message)
        })

    socket.on('disconnect', function () {

        if (socket.currentUser) {

            socket.broadcast.emit('update user list', socket.currentUser);
            userCollection = userCollection.filter( user => user.id == socket.currentUser.id);

            socket.broadcast.emit('chat message', {
                name: socket.currentUser.name,
                message: ' left the chat.'
            });

        }
    });

    socket.on('logout', function (data) {
        userCollection = userCollection.filter( user => user.id == socket.currentUser.id);
        io.emit('update user list', socket.currentUser);
    });

    socket.on('chat message', function (data) {
        messageCollection.push(data);
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

        userCollection.push(user);

        io.emit('add user', user);
    });
});



http.listen(3000, function () {
    console.log('listening on localhost:3000');
});
