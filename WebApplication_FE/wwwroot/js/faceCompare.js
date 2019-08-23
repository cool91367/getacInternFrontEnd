var leftUrl = document.getElementById("inputUrlLeft");
var rightUrl = document.getElementById("inputUrlRight");
var imgLeft = document.getElementById("img1");
var imgRight = document.getElementById("img2");
var imgInputLeft = document.getElementById("imgInputLeft");
var imgInputRight = document.getElementById("imgInputRight");
var compareByUrl = document.getElementById("compareByUrl");
var result = document.getElementById("result");
var resultText = document.getElementById("resultText");
var serverUrl = "https://localhost:5001";
var serverSignalR = serverUrl + "/chatHub";
var sendImageUrl = new signalR.HubConnectionBuilder().withUrl(serverSignalR).build();
var imgCompareLeft;
var imgCompareRight;
var canvas = document.getElementById("cvs");

// start the signalR
sendImageUrl.start().then(function () {
    console.log('signalR connect successful!');
}).catch(function (err) {
    return err.toString();
});

// add image to website by input url
leftUrl.addEventListener("change", function () {
    img1.src = leftUrl.value;
});

// add image to website by input url
rightUrl.addEventListener("change", function () {
    img2.src = rightUrl.value;
});

// load image from local
imgInputLeft.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $("#img1").attr('src', e.target.result);
            console.log(e.target.result);
            imgCompareLeft = e.target.result;
        }
        reader.readAsDataURL(this.files[0]);
    }
});

imgInputRight.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $("#img2").attr('src', e.target.result);
            console.log(e.target.result);
            imgCompareRight = e.target.result;
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// send url to server
compareByUrl.addEventListener("click", function () {
    if (imgCompareLeft && imgCompareRight) {
        sendImageUrl.invoke("SendFaceVerifyByLocalImage", imgCompareLeft, imgCompareRight).catch(function (err) {
            return console.error(err.toString());
        });
    }
    if (leftUrl.value != "" && rightUrl != "") {
        sendImageUrl.invoke("SendFaceVerifyUrl", leftUrl.value, rightUrl.value).catch(function (err) {
            return console.error(err.toString());
        });
    }
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