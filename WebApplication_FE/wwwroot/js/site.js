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
    const result = await fetch(url);
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
    topics = await ajaxRequest(serverApiUrl + 'chats');

    // create a temp Id
    tempId = Math.floor(Math.random() * 1000000000);
    document.getElementById('userId').innerHTML = 'userId ： ' + tempId;

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
            var chatLineObject = new chatLine(inputText.value, tempId);
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
                        if (topics[j].content[k].senderId == tempId)
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