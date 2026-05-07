//API link for random images: https://source.unsplash.com/random?topics=nature
//https://api.unsplash.com/photos/random?query=nature&client_id=YOUR_ACCESS_KEY
//https://api.unsplash.com/photos/random?query=nature&client_id=BCDqq90e6uSn0sG8eiHOyWnv3Hi9fskLZSttL3GdLdw

let startTime, endTime;
let imageSize = "";
let image = new Image();
let bitOutput = document.getElementById("bits");
let kbOutput = document.getElementById("kbs");
let mbOutput = document.getElementById("mbs");
let gbOutput = document.getElementById("gbs");

//ets random image from unplash.com
let imageLink = "https://picsum.photos/1200/800";

//when images loads
image.onload = async function() {
    endTime = new Date().getTime();
}
// Get Image size
await fetch(imageLink).then((response) => {
    imageSize = response.headers.get("content-length");
    calculateSpeed();

});
//function to calculate speed
function calculateSpeed(){
    //tie taken in seconds
    let timeDuration = (endtime - startTime) / 1000;

    //total bots
    let loadedBits = imageSize * 8;
    let speedInBps = (loadedBits / timeDuration).toFixed(2);
    let speedInKbps = (speedInBps/1024).toFixed(2);
    let speedInMbps = (speedInKbps/1024).toFixed(2);
    let speedInGbps = (speedInMbps/1024).toFixed(2);

    bitOutput.innerHTML += `${speedInBps}`;
    kbOutput.innerHTML += `${speedInKbps}`;
    mbOutput.innerHTML += `${speedInMbps}`;
    gbOutput.innerHTML += `${speedInGbps}`;
}
//initial
const init = async () => {
    startTime = new Date().getTime();
    image.src = imageLink;
};

window.onload = () => init();