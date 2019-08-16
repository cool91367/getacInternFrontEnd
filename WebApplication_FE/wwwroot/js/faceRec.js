﻿var url1 = document.getElementById("inputName");
var img1 = document.getElementById("img1");
var img2 = document.getElementById("img2");
var compareButton = document.getElementById("compare");
var result = document.getElementById("result");
var resultText = document.getElementById("resultText");
var serverUrl = "https://localhost:5001";
var serverSignalR = serverUrl + "/chatHub";
var sendImageUrl = new signalR.HubConnectionBuilder().withUrl(serverSignalR).build();
var imgArray;
var timeoutFunction;
var i = 0;

// load image for animation;
window.onload = function () {
    imgArray = new Array();
    imgArray.push("/ImageDatabase/blackman.jpg");
    imgArray.push("/ImageDatabase/Ian.jpg");
    imgArray.push("/ImageDatabase/Show.jpg");
}

// start the signalR
sendImageUrl.start().then(function () {
    console.log('signalR connect successful!');
}).catch(function (err) {
    return err.toString();
});

// add image to website by input url
url1.addEventListener("change", function () {
    img1.src ="/B3Image/" + url1.value;
});

function imgAnimation() {
    i = i % 3;
    img2.src = imgArray[i];
    i++;
    timeoutFunction = setTimeout(imgAnimation, 100);
}



// send url to server
compareButton.addEventListener("click", function () {
    // play image animation
    imgAnimation();
    sendImageUrl.invoke("SendFaceCompareName", url1.value).catch(function (err) {
        return console.error(err.toString());
    });
});

// close result text
document.getElementById("close").addEventListener("click", function () {
    result.style = "display:none"
});

// wait for result
sendImageUrl.on("ReceiveFaceCompareMessage", async function (data1, data2) {
    clearTimeout(timeoutFunction);
    result.style = "";
    resultText.innerHTML = data1;
    data2 = data2.replace('C:/Users/user/source/repos/FrontEnd_git/WebApplication_FE/wwwroot','');
    console.log(data2);
    img2.src = data2;

});