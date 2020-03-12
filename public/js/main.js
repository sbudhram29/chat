$(function () {
    var socket = io();
    var typing = false;
    var lastTypingTime;


    function nameEnter(e) {

        if (e.target.value.trim().length > 0) {
            socket.emit('add user', {
                name: $('#name').val()
            });
            $('#name').css('display', 'none');
            $('.form__item').removeClass('hidden');

        }
    }
    $('#name').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            this.blur();
            return false;
        }
    });
    $('#name').on('blur', function (e) {
        nameEnter(e);
    });

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading

        const name = $('#name').val();
        const message = $('#m').val();
        setTimeout(() =>
            typing = false, 400);
        socket.emit('chat message', {
            name,
            message
        });
        $('#messages').append($('<li>').text(`${name} - ${message}`));
        $('#m').val('');
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
    });
});