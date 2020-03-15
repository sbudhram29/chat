$( document ).ready(function () {
    var socket = io();
    var typing = false;

    var element = document.querySelector(".chat-box__item--message");
    element.scrollTop = element.scrollHeight;


    /*
    * Functions
    */

    var nameEnter = function() {

        let pattern = /[a-zA-Z0-9\s]+/g
        let name = $('#name').val();

        if (name.length > 0 && pattern.test(name)) {

            socket.emit('login', {
                name: name
            });

            socket.emit('user enter leave message', {
                name: $('#name').val(),
                message: ' enter the chat.'
            });
            $('#chat').removeClass('hidden');
            $('#chat-username').addClass('hidden');
            $('.chat-box').removeClass('hidden');
            scrollToBottom();

        }
    }

    var scrollToBottom = function() {
        let messageDiv;
        messageDiv =  document.querySelector(".chat-box__item--message");
        messageDiv.scrollTop = messageDiv.scrollHeight;
    }

    /*
    * chat
    */
    $('#chat').submit(function (e) {
        e.preventDefault(); // prevents page reloading

        const name = $('#name').val();
        const message = $('#m').val();
        if (message.trim().length > 0) {
            setTimeout(() =>
                typing = false, 400);
            socket.emit('chat message', {
                name,
                message
            });
            $('#messages').append($('<li>').text(`${name} - ${message}`));
            $('#m').val('');
            scrollToBottom();
        }
        return false;
    });

    $('#m').on('keyup', function (e) {
        if (!typing) {
            typing = true;
            socket.emit('is typing', {
                name: $('#name').val(),
                message: 'is typing'
            });
        }
    });

    document.querySelector("#send").addEventListener('click', (e) => {
        e.preventDefault(); 
        $('#chat').submit();
    });

    /*
    * Username
    */

    document.querySelector("#login").addEventListener('click', (e) => {
        e.preventDefault(); 
        nameEnter();
    });

    document.querySelector("#logout").addEventListener('click', (e) => {
        e.preventDefault(); 
        $('#chat').addClass('hidden');
        $('#chat-username').removeClass('hidden');
        $('.chat-box').addClass('hidden');
        socket.emit('logout', {
        });
        
        socket.emit('user enter leave message', {
            name: $('#name').val(),
            message: ' left the chat.'
        });
    });

    /*
    * Socket IO 
    */
    socket.on('is typing', function ({name, message}) {
        if (name && message) {
            $('#messages').append($(`<li id="${name.trim().replace(' ', '_')}_is_typing">`).text(`${name} - ${message}`));
        }
    });

    socket.on('add user', function ({name, id}) {
        if (name) {
            $('#user-list').append($(`<li id="${id}">`).text(`${name}`));
        }
    });

    socket.on('clear', function ({id}) {
        $(`#${id}`).empty();
    });

    socket.on('load users', function ({name, id}) {
        if (name) {
            $('#user-list').append($(`<li id="${id}">`).text(`${name}`));
        }
    });

    socket.on('load messages', function ({name, message}) {
        if (name && message) {
            $('#messages').append($('<li>').text(`${name} - ${message}`));
        }
    });

    socket.on('delete user', function (data) {
        $(`#${data.id}`).remove();
    });

    socket.on('chat message', function ({name, message}) {

        if (name && message) {
            if(name.trim().length > 0 ){
                $(`#${name.trim().replace(' ', '_')}_is_typing`).remove();
            }
            $('#messages').append($('<li>').text(`${name} - ${message}`));
        }  
        scrollToBottom();
    });
});