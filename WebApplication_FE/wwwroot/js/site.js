var serverUrl = "https://localhost:5001";
var serverApiUrl = serverUrl + "/api/"
var serverSignalR = serverUrl + "/chatHub";
var topics;// complete data from DB
var contentForm;// form object
var contentHtml = document.getElementById('ContentText');
var inputText = document.getElementById("textBox");

// setting signalR's connect
var connection = new signalR.HubConnectionBuilder().withUrl(serverSignalR).build();

async function ajaxRequest(url) {
    const result = await fetch(url, { credentials: 'include' }); // Credentials must be include to solve CORS issue
    const jsonResult = await result.json();
    return jsonResult;
}

// chanege time format
function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var minute = date.getMinutes();
    var hour = date.getHours();
    var second = date.getSeconds();

    return year + ' ' + monthNames[monthIndex] + ' ' + day + '   ' + hour + ':' + minute + ':' + second;
}

// show topics to web page
window.onload = async function() {
    var topicArea = document.getElementById('TopicsArea');

    // AjaxRequest
    try {
        topics = await ajaxRequest(serverApiUrl + 'chats');
    }
    catch (e) {
        var currentPagePath = window.location.pathname;
        var currentPageName = currentPagePath.substring(currentPagePath.lastIndexOf('/') + 1);
        if (currentPageName == "Index") {
            alert("Not login yet!!!");
        }
    }

    // output topic name to topic list
    var tempHtml = ""
    tempHtml = "<form id = 'contentForm'>Topics: <br>";
    for (i = 0; i < topics.length; i++) {
        // add Html
        tempHtml += "<div class='custom-control custom-checkbox'>";
        tempHtml += "<input value='" + topics[i].topic + "' type='checkbox' name='topics' onclick='onChangeTopics(this.form)' class='custom-control-input' id='" + topics[i].topic + "'>"
        tempHtml += "<label class='custom-control-label' for='" + topics[i].topic + "'>" + topics[i].topic + "</label><br />" + "</div>";
    }
    topicArea.innerHTML = tempHtml;
}

async function sendMessage() {
    var chatArray = new Array();
    topicForm = document.getElementById('contentForm').topics;

    // create a message array and prepare to send
    for (var i = 0; i < topicForm.length; i++) {
        if (topicForm[i].checked) {
            var chatLineObject = new chatLine(inputText.value, getCookie('usr'));
            var chatObject = new chat(topicForm[i].value, chatLineObject);
            currentTime = chatLineObject.sendTime;
            chatArray.push(chatObject);
        }
    }

    // invoke server's hub
    if (chatArray.length) {
        connection.invoke("UploadMessage", chatArray).catch(function (err) {
            return console.error(err.toString());
        });
    }
    else {
        alert("please choose topics!!")
    }

    inputText.value = null;
}

// trigger send message by press enter
inputText.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage();
    }
});

function onChangeTopics() {
    contentHtml.innerHTML = "";
    var time;
    // show topics' content in order;
    contentForm = document.getElementById('contentForm').topics;
    for (var i = 0; i < contentForm.length; i++) {
        if (contentForm[i].checked) {
            contentHtml.innerHTML += "<h3>" + contentForm[i].value + "： </h3>";
            for (var j = 0; j < topics.length; j++) {
                if (topics[j].topic == contentForm[i].value) {
                    for (var k = 0; k < topics[j].content.length; k++) {
                        // reformatDate
                        time = formatDate(new Date(topics[j].content[k].sendTime))
                        if (topics[j].content[k].senderId == getCookie('usr'))
                            contentHtml.innerHTML += "<ul><li style='text-align:right'>" + time + "</li> " + "<ul><li style='text-align:right'>" + topics[j].content[k].senderId + "：" + topics[j].content[k].chatString + "</li></ul></ul>";
                        else
                            contentHtml.innerHTML += "<ul><li>" + time + "</li> " + "<ul><li>" + topics[j].content[k].senderId + "：" + topics[j].content[k].chatString + "</li></ul></ul>";
                    }
                }
            }
        }
    }
}

function refreshContent() {
    onChangeTopics();
    // scroll to bottom
    contentHtml.scrollTop = contentHtml.scrollHeight;
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

// listen to server's hub
connection.on("ReceiveMessage", async function (data) {
    topics = JSON.parse(data);
    // change content
    refreshContent();
});


// check if signalR is connected
connection.start().then(function () {
    console.log('signalR connect successful!');
}).catch(function (err) {
    return err.toString();
});