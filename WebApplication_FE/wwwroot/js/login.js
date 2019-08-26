var serverUrl = "https://localhost:5001";
var serverApiUrl = serverUrl + "/api/"


async function ajaxRequest(url) {
    const result = await fetch(url, { credentials: 'include' }); // Credentials must be include to solve CORS issue
    const jsonResult = await result.json();
    return jsonResult;
}
// check if log in yet
async function checkLoginState() {
    var topics;
    try {
        topics = await ajaxRequest(serverApiUrl + 'chats');
    }
    catch (e) {
        alert("Not login yet!!!");
    }
    return topics;
}

async function authResponse(authType) {
    if (authType == 'Logout') {
        await fetch(serverApiUrl + 'auth/' + authType,
            {
                credentials: 'include', // Credentials must be include to solve CORS issue
                headers: {
                    "Content-Type": "application/json",
                },
                method: 'POST',
            })
            .then(response => response.text())
            .then(msg => {
                alert(msg);
                if (msg == authType + ' succesfully') {
                    window.location.replace("https://localhost:3001/Auth/Login");
                    setCookie('usr', getCookie('usr'), 0);
                }
            });
    }
    else {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        let user = { "Username": username, "Password": password };
        await fetch(serverApiUrl + 'auth/' + authType,
            {
                credentials: 'include', // Credentials must be include to solve CORS issue
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
                method: 'POST',
            })
            .then(response => response.text())
            .then(msg => {
                alert(msg);
                if (msg == authType + ' succesfully') {
                    if (authType == 'Register') {
                        window.location.replace("https://localhost:3001/Auth/Login");
                    }
                    else {
                        window.location.replace("https://localhost:3001/Home/Index");
                        setCookie('usr', username, 1);    // Set cookies exist 1 day
                    }
                }
            });

    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; " + "path=/";
}

function showAuthButton() {
    var cookies = getCookie(".applicationname");
    if (cookies != null) {
        document.getElementById("LogoutButton").style.display = "inline";
    }
    else {
        document.getElementById("RegisterButton").style.display = "inline";
        document.getElementById("LoginButton").style.display = "inline";
    }
}

function showUser() {
    var cookies = getCookie("usr");
    if (cookies != null) {
        document.getElementById("userId").innerHTML = "userId ： " + cookies;
    }
}