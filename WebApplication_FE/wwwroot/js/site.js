var serverUrl = 'https://localhost:5001/api';
var topics;// complete data from DB
async function ajaxRequest(url) {

    const result = await fetch(url);
    const jsonResult = await result.json();
    return jsonResult;
}

// show topics to web page
window.onload = async function showTopics() {
    var topicArea = document.getElementById('TopicsArea');

    // AjaxRequest
    topics = await ajaxRequest(serverUrl + '/chats');

    // output topic name to topic list
    var tempHtml = ""
    tempHtml = "<form>Topics: <br>";
    for (i = 0; i < topics.length; i++) {
        // add Html
        tempHtml += "<div class='custom-control custom-checkbox'>";
        tempHtml += "<input value='" + topics[i].Topic + "' type='checkbox' name='topics' onclick='OnChangeTopics(this.form)' class='custom-control-input' id='" + topics[i].Topic + "'>"
        tempHtml += "<label class='custom-control-label' for='" + topics[i].Topic + "'>" + topics[i].Topic + "</label><br />" + "</div>";
    }
    topicArea.innerHTML = tempHtml;
}