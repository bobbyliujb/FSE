$(function () {
    var cookie = document.cookie;
    if (cookie == null || cookie.indexOf('user=') < 0) {
        window.location.href = "/login.html";
        return false;
    }
    var startIndex = cookie.indexOf('user=') + 5;
    var endIndex = cookie.indexOf(';', startIndex)
    var username = cookie.substring(startIndex, endIndex < 0? cookie.length: endIndex);

    var socket = io();
    console.log(document.cookie);
    console.log(username);

    // show database SELECT message in msg-list
    socket.on('init message', function(sqlResult) {
        for (var index in sqlResult) {
            console.log(sqlResult[index]);
            $('#msg-list').append($('<li class=\'info-box\'>').text(sqlResult[index].fromUser + 
                ' @ ' + sqlResult[index].sendTime));                   
            $('#msg-list').append($('<li class=\'content-box\'>').text(sqlResult[index].content));            
        }
        //$('#msg-list').append($('<li>').text(sqlResult.toString()));
    });

    // send the input message and broadcast
    $('#my-form').submit(function(){
        if ($('#my-input').val() == '') {
            $('#my-input').hint('Please input message here before hit send');
            return false;
        }
        var myDate = new Date();
        var newMsg = {
            fromUser: username, 
            content: $('#my-input').val(),
            sendTime: myDate.toLocaleString(),
            isAnon: false
        };
        socket.emit('input message', newMsg);
        $('#my-input').val('');
        $('#my-input').hint('');
        return false;
    }); 
    
    socket.on('update message', function(msg) {
        $('#msg-list').append($('<li>').text(msg));
    });
});

/*
// Raw JavaScript...
var socket = io();

function submitForm() {
var form = document.getElementById('my-form');
var input = document.getElementById('my-input');
form.submit();
socket.emit('input message', input.value);
input.value = '';
return false;
}
*/