let interval_indicator
let position_indicator ='<span tabindex="0" id="position_indicator" ' +
            'class=" position-indicator" ' + /*ui-slider-handle ui-corner-all ui-state-default*/
            'style="width: 0.1em !important;"></span>'


function startVideoSlider(){
    let start = video.currentTime
    let end = video.currentTime+30
    if (start < 0) start = 0
    if (end > videoDuration) end = videoDuration
    higlightExplanationInTranscript(null, start, end, ".youtube-in-description-marker")
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
                changeTime(video_time_clicked)
                document.getElementById("timeSlider").innerHTML = secondsToHms(video_time_clicked)


            }

        }
    };


  $( "#amount" ).val( "Start: " + secondsToH_m_s_ms(start) + " - End: " + secondsToH_m_s_ms(end) );

    $( "#videoSlider" )
        .on('mousedown', sliderMouseDown)
        .on('touchstart', sliderMouseDown)
        .slider({
          range: true,
          min: 0,
          max: videoDuration,
          step: 0.1,
          values: [ start, end],
          slide: function( event, ui ) {
            start = ui.values[0]
            end = ui.values[1]
            $( "#amount" ).val( "Start: " + secondsToH_m_s_ms(start) + " - End: " + secondsToH_m_s_ms(end) );
            document.getElementById("handleSinistro").innerHTML = secondsToH_m_s_ms(start)
            document.getElementById("handleDestro").innerHTML = secondsToH_m_s_ms(end)
            video.pause()
            $("#playButton").removeClass("paused")
            clearInterval(interval_indicator)
            higlightExplanationInTranscript(null, start, end, ".youtube-in-description-marker")

          }
    });

    let leftHandle = $($(".ui-slider-handle")[0])
    let rightHandle = $($(".ui-slider-handle")[1])

    leftHandle.addClass("leftHandle")
    leftHandle.append('<span class="sidecar" id="handleSinistro" style="left: -30px"></span>')

    rightHandle.addClass("rightHandle")
    rightHandle.append('<span class="sidecar" id="handleDestro" ></span>')

    document.getElementById("handleSinistro").innerHTML = secondsToH_m_s_ms(start)
    document.getElementById("handleDestro").innerHTML = secondsToH_m_s_ms(end)
}

function updateIndicator(end){
    let position = (video.currentTime * 100 / videoDuration)+"%"
    if(video.currentTime < end){
        $("#position_indicator").css({left: position})
        document.getElementById("timeSlider").innerHTML = secondsToHms(video.currentTime)
    }
    else{
        video.pause()
        $("#position_indicator" ).remove();
        clearInterval(interval_indicator)
        $("#playButton").removeClass("paused")
        document.getElementById("timeSlider").innerHTML = ""

    }

}


function playDefinition(btn) {

    if (! btn.className.includes("paused")){
        $(btn).addClass("paused")
        let start = $('#videoSlider').slider("values")[0];
        let end = $('#videoSlider').slider("values")[1];

        let start_position = (start * 100 / videoDuration)+"%"

        if(document.getElementById("position_indicator") == null){
            $('#videoSlider').append($(position_indicator).css({left: start_position}))
            changeTime(start)
        }

        if(video.currentTime < start || video.currentTime > end){
            changeTime(start)
            $("#position_indicator").css({left: start_position})
            document.getElementById("timeSlider").innerHTML = secondsToHms(video.currentTime)

        }

        document.getElementById("timeSlider").innerHTML = secondsToHms(video.currentTime)

        interval_indicator = window.setInterval(function(){
            updateIndicator(end)
        }, 1000);

        video.play()
    }

    else{
        video.pause()
        $(btn).removeClass("paused")
        clearInterval(interval_indicator)

    }


}

// Playback rate button
videojs('video-active').ready(function() {
    const player = this;

    // Create the button component
    const Button = videojs.getComponent('Button');
    const SpeedUpButton = videojs.extend(Button, {
        constructor: function() {
            Button.apply(this, arguments);
            this.controlText('Speed');
            this.addClass('vjs-speed-up-button');
            this.on('click', this.handleClick);
            this.el().querySelector('.vjs-icon-placeholder').textContent = `${player.playbackRate()}x`;
        },
        handleClick: function() {
            let playbackRate = player.playbackRate();
            const speeds = [1.0, 1.1, 1.25, 1.5, 1.75, 2];
            playbackRate = speeds[(speeds.indexOf(playbackRate)+1) % speeds.length];
            this.el().querySelector('.vjs-icon-placeholder').textContent = `${playbackRate}x`;
            player.playbackRate(playbackRate);
        }
    });

    // Register the new button component
    videojs.registerComponent('SpeedUpButton', SpeedUpButton);

    // Add the new button to the control bar
    player.getChild('controlBar').addChild('SpeedUpButton', {}, 9);
});