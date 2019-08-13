var url1 = document.getElementById("inputUrl1");
var url2 = document.getElementById("inputUrl2");
var img1 = document.getElementById("img1");
var img2 = document.getElementById("img2");
var compareButton = document.getElementById("compare");
var result = document.getElementById("result");
var resultText = document.getElementById("resultText");
var serverUrl = "https://localhost:5001";
var serverSignalR = serverUrl + "/chatHub";
var sendImageUrl = new signalR.HubConnectionBuilder().withUrl(serverSignalR).build();

// start the signalR
sendImageUrl.start().then(function () {
    console.log('signalR connect successful!');
}).catch(function (err) {
    return err.toString();
});

// add image to website by input url
url1.addEventListener("change", function () {
    img1.src = url1.value;
});

// add image to website by input url
url2.addEventListener("change", function () {
    img2.src = url2.value;
});

// send url to server
compareButton.addEventListener("click", function () {
    sendImageUrl.invoke("SendFaceVerifyUrl", url1.value, url2.value).catch(function (err) {
        return console.error(err.toString());
    });
});

// close result text
document.getElementById("close").addEventListener("click", function () {
    result.style = "display:none"
});

// wait for result
sendImageUrl.on("ReceiveFaceVerifyMessage", async function (data) {
    result.style = "";
    resultText.innerHTML = data;
});