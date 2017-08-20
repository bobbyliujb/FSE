$(function() {
    var cookie = document.cookie;
    if (cookie != null && cookie.indexOf('user=') > 0) {
        window.location.href = "/";
        return false;
    }
    $('#login-form').submit(function() {
        var username = $('#username-input').val();
        var password = $('#password-input').val();
        if (username === '') {
            alert('username should not be empty!');
            $('#username-input').focus();
        } else if (password === '') {
            alert('password should not be empty');
            $('#password-input').focus();
        } else {
            data = {
                'username': username,
                'password': password
            };
            $.ajax({
                url: '/login',
                type: 'POST',
                data: data,
                success: function(data, status) {
                    if (data === '001') {
                        $('#username-input').focus();
                        $('#username-input').select();
                        alert('Username not exist');                        
                    } else if (data === '002') {
                        $('#password-input').focus();
                        $('#password-input').select();
                        alert('Password incorrect');
                    } else {
                        document.cookie = 'user=' + username;
                        window.location.href = "/";
                        return true;
                    }
                }
            });
        }
        return false;
    });
});
