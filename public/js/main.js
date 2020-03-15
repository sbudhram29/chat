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
            socket.emit('add user', {
                name: name
            });
            
            $('#name').css('display', 'none');
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

    $('#chat').addClass('hidden');
        
    $('.chat-box').addClass('hidden');

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

    $('#name').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            nameEnter();
            return false;
        }
    });

    document.querySelector("#login").addEventListener('click', (e) => {
        e.preventDefault(); 
        nameEnter();
    });

    document.querySelector("#logout").addEventListener('click', (e) => {
        e.preventDefault(); 
        $('#name').css('display', 'block');
        $('#chat').addClass('hidden');
        $('#chat-username').removeClass('hidden');
        $('.chat-box').addClass('hidden');
        socket.emit('logout', {});
        socket.emit('enter leave', {
            name: $('#name').val(),
            message: ' left the chat.'
        });
    });

    /*
    * Socket IO 
    */
    socket.on('is typing', function (data) {
        if (data.name && data.message) {
            $('#messages').append($(`<li id="${data.name.trim()}_is_typing">`).text(`${data.name} - ${data.message}`));
        }
    });

    socket.on('add user', function (data) {
        if (data.name) {
            $('#user-list').append($(`<li id="${data.id}">`).text(`${data.name}`));
        }
    });

    socket.on('update user list', function (data) {
        $(`#${data.id}`).remove();
    });

    socket.on('chat message', function (data) {
        if (data.name && data.message) {
            $(`#${data.name.trim()}_is_typing`).remove();
            $('#messages').append($('<li>').text(`${data.name} - ${data.message}`));
        }  
        scrollToBottom();
    });
});