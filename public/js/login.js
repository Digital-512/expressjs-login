$(document).ready(function () {
    "use strict";

    // Login form
    $("#login-form").submit(function (event) {
        event.preventDefault();
        var username = $("#loginUsername").val();
        var password = $("#loginPassword").val();
        var rememberMe = $("#remember-me").is(":checked");
        if (username && password) {
            $.ajax({
                type: "POST",
                url: "/login/checklogin",
                data: { myusername: username, mypassword: password, rememberme: rememberMe },
                dataType: 'JSON',
                success: function (html) {
                    //console.log(html.response + ' ' + html.username);
                    if (html.response === 'true') {
                        location.reload();
                        return html.username;
                    } else {
                        showMessage(html.response, true);
                    }
                },
                error: function (textStatus, errorThrown) {
                    //console.log(textStatus);
                    console.log(errorThrown);
                },
                beforeSend: function () {
                    $("#message").html('<div class="text-center"><img src="/images/ajax-loader.gif"></div>');
                }
            });
        } else {
            showMessage("Please enter a username and a password!", true);
        }
    });

    // Register form
    $("#register-form").submit(function (event) {
        event.preventDefault();
        var username = $("#regUsername").val();
        var email = $("#regEmail").val();
        var password = $("#regPassword").val();
        var password2 = $("#regPasswordConfirm").val();
        if (username && password && email) {
            // Check if passwords matches
            if (password !== password2) {
                showMessage("Your password does not match!", true);
                return;
            }
            // Check password length
            if (password.length < 4) {
                showMessage("Your password is too short! It must be at least 4 characters.", true);
                return;
            }
            $.ajax({
                type: "POST",
                url: "/register/createuser",
                data: { newuser: username, email: email, password: password },
                dataType: 'JSON',
                success: function (html) {
                    //console.log(html.response + ' ' + html.username);
                    if (html.response === 'true') {

                    } else {
                        showMessage(html.response, true);
                    }
                },
                error: function (textStatus, errorThrown) {
                    //console.log(textStatus);
                    console.log(errorThrown);
                },
                beforeSend: function () {
                    $("#message").html('<div class="text-center"><img src="/images/ajax-loader.gif"></div>');
                }
            });
        } else {
            showMessage("Please enter a username and a password!", true);
        }
    });
});

// Shows success or error message
function showMessage(text, err) {
    if (!err) {
        $("#message").html('<div class="alert alert-success" role="alert">' + text + '</div>');
    } else {
        $("#message").html('<div class="alert alert-danger" role="alert">' + text + '</div>');
    }
}