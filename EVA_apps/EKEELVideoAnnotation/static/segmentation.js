
addTimeline()


function addTimeline(){

  let timelineDiv = document.getElementById("timeline");


  for (let i in $startTimes){

    timelineDiv.innerHTML +=
    '<div class="item"> <img src="static/' + $imagesPath[i] +'" onclick=player.currentTime('+$startTimes[i]+')> <p>'+secondsToHms($startTimes[i])+'</p> </div>'

  }
}

