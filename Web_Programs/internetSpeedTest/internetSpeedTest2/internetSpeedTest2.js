const startBtn = document.getElementById("startBtn");
const speedText = document.getElementById("speed");
const statusText = document.getElementById("status");

startBtn.addEventListener("click", speedTest);

    function speedTest(){

      let imageAddr = "https://picsum.photos/2000/3000?random=" + Math.random();

      let startTime, endTime;

      let downloadSize = 5000000;

      let image = new Image();

      statusText.innerHTML = "Testing speed...";

      startTime = new Date().getTime();

      image.onload = function(){

        endTime = new Date().getTime();

        displaySpeed();
      };

      image.src = imageAddr;

      function displaySpeed(){

        let timeDuration = (endTime - startTime) / 1000;

        let loadedBits = downloadSize * 8;

        let speedBps = (loadedBits / timeDuration);

        let speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

        animateSpeed(speedMbps);

        statusText.innerHTML = "Speed test completed";
      }

      function animateSpeed(finalSpeed){

        let currentSpeed = 0;

        let interval = setInterval(() => {

          if(currentSpeed >= finalSpeed){
            clearInterval(interval);
          }else{
            currentSpeed += 0.5;
            speedText.innerHTML = currentSpeed.toFixed(2);
          }

        },20);
      }
    }