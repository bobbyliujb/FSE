$(function() {
    $('#reg-form').submit(function() {
        var username = $('#username-input').val();
        var password = $('#password-input').val();
        var repPwd = $('#rep-pwd-input').val();
        if (username === '') {
            //alert('username should not be empty!');
            $('#username-error').text('Username should not be empty');
            $('#username-error').css('display', "block").fadeOut(3600);
            $('#username-input').focus();
        } else if (password === '') {
            //alert('password should not be empty');
            $('#password-error').text('Password should not be empty');            
            $('#password-error').css('display', "block").fadeOut(3600);
            $('#password-input').focus();
        } else if (repPwd !== password) {
            $('#rep-pwd-error').css('display', "block").fadeOut(3600);
            $('#rep-pwd-input').focus();
            $('#rep-pwd-input').select();
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
        } else if (repPwd.length > 20) {
            $('#rep-pwd-input').focus();
            $('#rep-pwd-input').select();
            $('#rep-pwd-error').text('The length of password is limited to 20');                        
            $('#rep-pwd-error').css('display', "block").fadeOut(3600);
        } else {
            data = {
                'username': username,
                'password': password
            };
            $.ajax({
                url: '/register',
                type: 'POST',
                data: data,
                success: function(data, status) {
                    if (data === '101') {
                        $('#username-input').focus();
                        $('#username-input').select();
                        $('#username-error').text('The username already exists');
                        $('#username-error').css('display', "block").fadeOut(3600);                    } else {
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
