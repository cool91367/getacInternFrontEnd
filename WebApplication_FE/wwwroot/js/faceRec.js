var url1 = document.getElementById("inputName");
var img1 = document.getElementById("img1");
var img2 = document.getElementById("img2");
var compareButton = document.getElementById("compare");
var result = document.getElementById("result");
var resultText = document.getElementById("resultText");
var showPicture = document.getElementById("showPicture");
var serverUrl = "https://localhost:5001";
var serverSignalR = serverUrl + "/chatHub";
var sendImageUrl = new signalR.HubConnectionBuilder().withUrl(serverSignalR).build();
var imgArray;
var timeoutFunction;
var pictureName;
var compareName;
var i = 0;

async function ajaxRequest(url) {
    const result = await fetch(url, { credentials: 'include' }); // Credentials must be include to solve CORS issue
    const jsonResult = await result.json();
    return jsonResult;
}
// load image for animation;
window.onload = async function () {
    pictureName = await ajaxRequest(serverUrl + '/api/values/getPictureName');
    showPictureName();
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
/*url1.addEventListener("change", function () {
    img1.src ="/B3Image/" + url1.value;
});*/

function imgAnimation() {
    i = i % 3;
    img2.src = imgArray[i];
    i++;
    timeoutFunction = setTimeout(imgAnimation, 100);
}

function showPictureName() {
    for (i = 0; i < pictureName.length; i++) {
        showPicture.innerHTML += "<input type='button' value='" + pictureName[i] + "' onclick='imgSrc(this)'> ";
    }
}

async function imgSrc(ev) {
    var picture = await ajaxRequest(serverUrl + '/api/values/getPicture/' + ev.value);
    compareName = ev.value;
    img1.src = "data:image/jpeg;base64," + picture[0];
    //console.log(picture[0]);
}



// send url to server
compareButton.addEventListener("click", function () {
    // play image animation
    console.log("click");
    imgAnimation();
    sendImageUrl.invoke("SendFaceCompareName", compareName).catch(function (err) {
        return console.error(err.toString());
    });
});

// close result text
document.getElementById("close").addEventListener("click", function () {
    result.style = "display:none"
});

// wait for result
sendImageUrl.on("ReceiveFaceCompareMessage", async function (data1, data2 , data3) {
    clearTimeout(timeoutFunction);
    result.style = "";
    resultText.innerHTML = data1;
    img2.src = "data:image/jpeg;base64," + data3;
});