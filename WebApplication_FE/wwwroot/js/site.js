var serverUrl = "https://localhost:5001";
var serverApiUrl = serverUrl + "/api/"
var serverSignalR = serverUrl + "/chatHub";
var topics;// complete data from DB
var contentForm;// form object
var contentHtml = document.getElementById('ContentText');

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
    topics = await ajaxRequest(serverApiUrl+'chats');

    // output topic name to topic list
    var tempHtml = ""
    tempHtml = "<form id = 'contentForm'>Topics: <br>";
    for (i = 0; i < topics.length; i++) {
        // add Html
        tempHtml += "<div class='custom-control custom-checkbox'>";
        tempHtml += "<input value='" + topics[i].Topic + "' type='checkbox' name='topics' onclick='onChangeTopics(this.form)' class='custom-control-input' id='" + topics[i].Topic + "'>"
        tempHtml += "<label class='custom-control-label' for='" + topics[i].Topic + "'>" + topics[i].Topic + "</label><br />" + "</div>";
    }
    topicArea.innerHTML = tempHtml;
}

async function showTopics() {
    console.log("Todo: show topics content");
    // invoke server's hub
    connection.invoke("SendMessage", "hello").catch(function (err) {
        return console.error(err.toString());
    });
}

function onChangeTopics() {
    contentHtml.innerHTML = "";
    var time;

    // show topics' content in order;
    contentForm = document.getElementById('contentForm').topics;
    for (var i = 0; i < contentForm.length; i++) {
        if (contentForm[i].checked) {
            contentHtml.innerHTML += "<h3>" + contentForm[i].value + "： </h3>";
            for (var j = 0; j < topics.length; j++) {
                if (topics[j].Topic == contentForm[i].value) {
                    for (var k = 0; k < topics[j].Content.length; k++) {
                        // reformatDate
                        time = formatDate(new Date(topics[j].Content[k].SendTime))
                        contentHtml.innerHTML += "<ul><li>" + time + "</li> " + "<ul><li>" + topics[j].Content[k].SenderId + "：" + topics[j].Content[k].ChatString + "</li></ul></ul>";
                    }
                }
            }
        }
    }
}

function refreshContent() {
    onChangeTopics();
}

// listen to server's hub
connection.on("ReceiveMessage", async function (data) {
    // convert to JSON
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