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
    var first = true;

    // get current online count
    $.ajax({
        url: '/initUserNum',
        type: 'POST',
        data: username,
        success: function(data, status) {
            var onlineStr = 'Online: ' + data.userNum;
            $('#online-info').text(onlineStr);
        }
    });

    // update current user online status int database
    socket.emit('set online', username);

    // monitor future update of online counts
    socket.on('update online count', function(data) {
        var noticeStr = data.username + ' signed ';
        noticeStr += data.more? 'in': 'off';
        $('#update-notice').text(noticeStr);                        
        $('#update-notice').css('display', "block").fadeOut(2400);

        var onlineStr = 'Online: ' + data.userNum;
        $('#online-info').text(onlineStr);
    });

    // show database SELECT message in msg-list
    socket.on('init message', function(sqlResult) {
        if (first) {
            for (var index in sqlResult) {
                console.log(sqlResult[index]);
                var contentStr = '<li class=';
                contentStr += sqlResult[index].fromUser === username?
                 '\'content-li-me\'>': '\'content-li\'>';
    
                var infoStr = '<li class=';
                infoStr += sqlResult[index].fromUser === username? 
                 '\'info-li-me\'>': '\'info-li\'>';
    
                //console.log(contentStr);
                $('#msg-list').append($(infoStr).text(sqlResult[index].fromUser + 
                    ' @ ' + sqlResult[index].sendTime));                   
                $('#msg-list').append($(contentStr).text(sqlResult[index].content));            
            }
            window.scrollTo(0, document.body.scrollHeight);
            first = false;
        }
    });

    // send the input message and broadcast
    $('#submit-btn').click(function(){
        if ($('#my-input').val() == '') {
            $('#my-input').attr('placeholder', 
                'Please input message here before hit send');          
            return false;
        }
        var myDate = new Date();
        var newMsg = {
            fromUser: username, 
            content: $('#my-input').val(),
            sendTime: myDate.toLocaleString()
        };
        socket.emit('input message', newMsg);
        $('#my-input').val('');
        $('#my-input').attr('placeholder', 
            'Type message(<200 words) here.');
        return false;
    }); 
    $("#my-input").keyup(function(event){
        if(event.keyCode == 13){        // enter to send
            $("#submit-btn").click();
        }
    });
    
    socket.on('update message', function(msg) {
        var contentStr = '<li class=';
        contentStr += msg.fromUser === username? '\'content-li-me\'>': '\'content-li\'>';
        
        var infoStr = '<li class=';
        infoStr += msg.fromUser === username? '\'info-li-me\'>': '\'info-li\'>';
        
        $('#msg-list').append($(infoStr).text(msg.fromUser + 
            ' @ ' + msg.sendTime));                   
        $('#msg-list').append($(contentStr).text(msg.content));
        window.scrollTo(0, document.body.scrollHeight);
    });

    function logout(who) {
        socket.emit('set offline', who);
    }

    // mannually logout
    $('#logout-btn').click(function() {
        logout(username);
        var date = new Date();
        date.setTime(date.getTime() - 100);
        console.log('before: ' + document.cookie);    
        document.cookie = 'user=who;expires=' + date.toGMTString();
        //cookie.replace('user=' + username + (endIndex < 0? '': ';'), '');
        console.log('after: ' + document.cookie);
        window.location.href = '/login.html';
    });

    $(window).on('unload', function() {
        logout(username);
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