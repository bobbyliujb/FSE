$(function() {
    $('#reg-form').submit(function() {
        var username = $('#username-input').val();
        var password = $('#password-input').val();
        var repPwd = $('#rep-pwd-input').val();
        if (username === '') {
            //alert('username should not be empty!');
            $('#username-input:parent + div > span').css('display', "inline").fadeOut(3600);
            $('#username-input').focus();
        } else if (password === '') {
            //alert('password should not be empty');
            $('#password-input:parent + div > span').css('display', "inline").fadeOut(3600);
            $('#password-input').focus();
        } else if (repPwd !== password) {
            $('#rep-pwd-input:parent + div > span').css('display', "inline").fadeOut(3600);
            $('#rep-pwd-input').focus();
            $('#rep-pwd-input').select();
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
                        alert('Username already exist');                        
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
