window.onload = function () {
    model.init(function () {
        var data = model.data;
        var btn = $('.btn');
        if(btn!==null) {
            btn.addEventListener('click', function (ev) {
                var username = $('#username').value;
                var pass1 = $('#pass1').value;
                var valid = false;
                var userID = 1;
                if (username === '' || pass1 === '' ) {
                    alert("Username or password can't be empty");
                    return;
                }
                data.users.forEach(function (user) {
                    if(user.name === username){
                        userID = user.userId;
                        valid = true;
                    }
                });
                if(!valid){
                    alert("Invalid User Name");
                    return;
                }
                window.localStorage.username = username;
                window.localStorage.userId = userID;
                window.location.href = "index.html";
            })
        }
    });

};