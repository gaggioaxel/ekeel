let interval_indicator
let position_indicator ='<span tabindex="0" id="position_indicator" ' +
            'class=" position-indicator" ' + /*ui-slider-handle ui-corner-all ui-state-default*/
            'style="width: 0.1em !important;"></span>'


function startVideoSlider(start_time, end_time){
    let start = start_time!=null ? start_time : player.currentTime()
    let end = end_time!=null ? end_time : player.currentTime()+10
    if (start < 0) start = 0
    if (end > videoDuration) end = videoDuration
    highlightExplanationInTranscript(start, end)
    UpdateMarkers(start)
    //console.log(start,end)

    // disable clicks on track
    let sliderMouseDown = function (e) {
        let sliderHandle = $('#videoSlider').find('.ui-slider-handle');

        /* se non clicco le due maniglie*/
        if (e.target != sliderHandle[0] && e.target != sliderHandle[1]) {
            e.stopImmediatePropagation();

            /* se clicco tra le due maniglie, sposto il cursore del play e quindi il tempo*/
            if(e.target.className.includes("ui-slider-range")){
                let percentage = (e.clientX-this.offsetLeft) / this.offsetWidth * 100
                let position_clicked = percentage+"%";

                if(document.getElementById("position_indicator") == null)
                    $('#videoSlider').append($(position_indicator).css({left: position_clicked}))
                else
                    $("#position_indicator").css({left: position_clicked})


                let video_time_clicked = videoDuration * percentage/100
                player.currentTime(video_time_clicked)
                document.getElementById("timeSlider").innerHTML = secondsToHms(video_time_clicked)


            }

        }
    };


  $( "#descriptionRangeInput" ).val( "Start: " + secondsToTimeCropped(start) + " - End: " + secondsToTimeCropped(end) );

    $( "#videoSlider" )
        .on('mousedown', sliderMouseDown)
        .on('touchstart', sliderMouseDown)
        .slider({
          range: true,
          min: 0,
          max: videoDuration,
          step: 0.1,
          values: [start, end],
          slide: function( event, ui ) {
            start = ui.values[0]
            end = ui.values[1]
            $( "#descriptionRangeInput" ).val( "Start: " + secondsToTimeCropped(start) + " - End: " + secondsToTimeCropped(end) );
            document.getElementById("handleSinistro").innerHTML = secondsToTimeCropped(start)
            document.getElementById("handleDestro").innerHTML = secondsToTimeCropped(end)
            player.pause()
            $("#playButton").removeClass("paused")
            clearInterval(interval_indicator)
            highlightExplanationInTranscript(start, end)

          }
    });

    let leftHandle = $($(".ui-slider-handle")[0])
    let rightHandle = $($(".ui-slider-handle")[1])

    leftHandle.addClass("leftHandle")
    leftHandle.append('<span class="sidecar" id="handleSinistro" style="left: -30px"></span>')

    rightHandle.addClass("rightHandle")
    rightHandle.append('<span class="sidecar" id="handleDestro" ></span>')

    document.getElementById("handleSinistro").innerHTML = secondsToTimeCropped(start)
    document.getElementById("handleDestro").innerHTML = secondsToTimeCropped(end)
}

function updateIndicator(end){
    let currentTime = player.currentTime()
    let position = (currentTime * 100 / videoDuration)+"%"
    if(currentTime < end){
        $("#position_indicator").css({left: position})
        document.getElementById("timeSlider").innerHTML = secondsToHms(currentTime)
    }
    else{
        player.pause()
        $("#position_indicator" ).remove();
        clearInterval(interval_indicator)
        $("#playButton").removeClass("paused")
        $("#timeSlider").text("")

    }

}


function playDescription(btn) {

    if (! btn.className.includes("paused")){
        $(btn).addClass("paused")
        let start = $('#videoSlider').slider("values")[0];
        let end = $('#videoSlider').slider("values")[1];

        let start_position = (start * 100 / videoDuration)+"%"

        if(document.getElementById("position_indicator") == null){
            $('#videoSlider').append($(position_indicator).css({left: start_position}))
            player.currentTime(start)
        }

        let currentTime = player.currentTime()

        if(currentTime < start || currentTime > end){
            player.currentTime(start)
            $("#position_indicator").css({left: start_position})
            document.getElementById("timeSlider").innerHTML = secondsToHms(currentTime)
        }

        document.getElementById("timeSlider").innerHTML = secondsToHms(currentTime)

        interval_indicator = window.setInterval(function(){
            updateIndicator(end)
        }, 1000);

        player.play()
    }

    else{
        player.pause()
        $(btn).removeClass("paused")
        clearInterval(interval_indicator)

    }


}