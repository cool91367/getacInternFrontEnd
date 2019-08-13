// create chatLine class
class chatLine {
    constructor(chatString, senderId) {
        var currentTime = new Date();
        this.chatString = chatString;
        this.sendTime = currentTime;
        this.senderId = senderId;
    }
}

//create chat class
class chat {
    constructor(topic, content) {
        var array = new Array();
        this.Id = "";
        this.topic = topic;
        this.content = [content];
    }
}