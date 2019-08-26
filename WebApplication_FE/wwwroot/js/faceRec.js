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


// load image for animation;
window.onload = async function () {
    await checkLoginState();
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

// play searching animation
var pictureAnimation = 0;
function imgAnimation() {
    pictureAnimation = pictureAnimation % 3;
    img2.src = imgArray[pictureAnimation];
    pictureAnimation++;
    timeoutFunction = setTimeout(imgAnimation, 100);
}

// show picture name in backend
function showPictureName() {
    for (i = 0; i < pictureName.length; i++) {
        showPicture.innerHTML += "<input type='button' value='" + pictureName[i] + "' onclick='imgSrc(this)'> ";
    }
}

// show picture in backend
async function imgSrc(ev) {
    var picture = await ajaxRequest(serverUrl + '/api/values/getPicture/' + ev.value);
    compareName = ev.value;
    img1.src = "data:image/jpeg;base64," + picture[0];
}



// send url or picture name to server
compareButton.addEventListener("click", function () {
    // play image animation
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