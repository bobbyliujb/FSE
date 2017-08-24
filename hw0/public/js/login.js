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
            //alert('username should not be empty!');
            $('#username-input').focus();
        } else if (password === '') {
            //alert('password should not be empty');
            $('#password-input').focus();
        } else if (username.length > 20) {
            $('#username-input').focus();
            $('#username-input').select();
            $('#username-error').text('The length of username is limited to 20');                        
            $('#username-error').css('display', "block").fadeOut(3600);
        } else if (password.length > 20) {
            $('#password-input').focus();
            $('#password-input').select();
            $('#password-error').text('The length of password is limited to 20');                        
            $('#password-error').css('display', "block").fadeOut(3600);
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
                        //alert('Username not exist');
                        $('#username-error').text('This user does not exist');                        
                        $('#username-error').css('display', "block").fadeOut(3600);
                    } else if (data === '002') {
                        $('#password-input').focus();
                        $('#password-input').select();
                        //alert('Password incorrect');
                        $('#password-error').text('The password is not correct');                        
                        $('#password-error').css('display', "block").fadeOut(3600);
                    } else if (data === '003') {
                        $('#username-input').focus();
                        $('#username-input').select();
                        $('#username-error').text('This user is already online');
                        $('#username-error').css('display', "block").fadeOut(3600);
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
