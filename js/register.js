window.onload = function () {
    model.init(function () {
        var data = model.data;
        console.log(data);
        var btn = $('.btn');
        if (btn !== null) {
            btn.addEventListener('click', function (ev) {
                var username = $('#username').value;
                var pass1 = $('#pass1').value;
                var pass2 = $('#pass2').value;
                var repeat =false;
                if (username === '' || pass1 === '' || pass2 === '') {
                    alert("Username or password can't be empty");
                    return;
                }
                if (pass1 !== pass2) {
                    alert("Password Two Times must match");
                    return;
                }
                data.users.forEach(function (user) {
                    if(user.name === username){
                        repeat = true;
                    }
                });
                if(repeat){
                    alert("user name has been registered before.");
                    return;
                }
                var id = data.users.length;
                data.users.push({name: username, userId: id, pass: pass1});
                model.flush();
                alert("Register Successfully");
                window.location.href = "login.html";
            })
        }
    });
};

