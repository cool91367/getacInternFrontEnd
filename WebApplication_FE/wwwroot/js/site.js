var serverUrl = 'https://localhost:5001/api';
var topics;// complete data from DB

// setting signalR's connect
var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/chatHub").build();

async function ajaxRequest(url) {
    const result = await fetch(url);
    const jsonResult = await result.json();
    return jsonResult;
}

// show topics to web page
window.onload = async function() {
    var topicArea = document.getElementById('TopicsArea');

    // AjaxRequest
    topics = await ajaxRequest(serverUrl + '/chats');

    // output topic name to topic list
    var tempHtml = ""
    tempHtml = "<form>Topics: <br>";
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

function onChangeTopics(formObj) {
    // get html element
    var contentHtml = document.getElementById('ContentText');
    contentHtml.innerHTML = "";

    // show topics' content in order;
    var obj = formObj.topics;
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].checked) {
            contentHtml.innerHTML += "<h3>" + obj[i].value + "： </h3>";
            for (var j = 0; j < topics.length; j++) {
                if (topics[j].Topic == obj[i].value) {
                    for (var k = 0; k < topics[j].content.length;k++)
                        contentHtml.innerHTML += "<ul><li>" + topics[j].content[k].sendTime + "</li> " + "<ul><li>" + topics[j].content[k].senderId +"：" + topics[j].content[k].chatString + "</li></ul></ul>";
                }
            }
        }
    }
}

// listen to server's hub
connection.on("ReceiveMessage", async function (data) {
    console.log(data);
    });


// check if signalR is connected
connection.start().then(function () {
    console.log('signalR connect successful!');
}).catch(function (err) {
    return console.error(err.toString());
});