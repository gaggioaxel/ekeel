function showDescriptionDiv(){

    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

    $('#canvas-wrap').dimBackground();
    $('#videoSlider').show();
    $('#videoSlider').dimBackground();
    //$('#add-concept-description').show();
    $('#right-body').hide();
    $('#right-body-description').show();
    $('#right-body-description').dimBackground();
    //$('#add-concept-description').dimBackground();
    document.getElementById("conceptDefined").value = ""
    player.controls(false)
    video.pause()
    $("#playButton").removeClass("paused")
    inDescription = true


    startVideoSlider()
    // Add event listener for Escape key
    document.addEventListener('keydown', handleEscape);


  }

function closeDescriptionDiv(){

    $('#videoSlider').hide();
    $('#videoSlider').undim();
    //$('#add-concept-description').hide();
    $('#right-body').show();
    $('#right-body-description').hide();
    $('#right-body-description').undim();
    //$('#add-concept-description').undim();
    $('#canvas-wrap').undim();
    player.controls(true)
    clearInterval(interval_indicator)
    $("#position_indicator").remove()
    document.getElementById("timeSlider").innerHTML = ""

    // Add event listener for Escape key
    document.removeEventListener('keydown', handleEscape);
    inDescription = false


}

function handleEscape(event) {
    if (event.key === 'Escape') {
        closeDescriptionDiv();
    }
}

function changeColor(){
    let descriptionType = document.getElementById("descriptionType").value;

    if (descriptionType == "In depth"){
        document.getElementsByClassName("ui-slider-range ")[0].style.background="#ffc107";
        document.getElementById("amount").style.color = "#ffc107"
    }else{
        document.getElementsByClassName("ui-slider-range ")[0].style.background="dodgerblue";
        document.getElementById("amount").style.color = "dodgerblue"
    }

}

function addDescription(){

    let concept = document.getElementById("conceptDefined").value;

    if($concepts.includes(concept)){

        let start = $('#videoSlider').slider("values")[0];
        let end = $('#videoSlider').slider("values")[1];
        let descriptionType = document.getElementById("descriptionType").value;
        //console.log(concept, start, end, descriptionType)

        let start_sub = getCurrentSubtitle(start)
        let startSentID = getSentenceIDfromSub(start_sub)
        let end_sub = getCurrentSubtitle(end)

        if(end_sub == undefined)
            end_sub = $(".youtube-marker").last()

        let endSentID = getSentenceIDfromSub(end_sub)
        //console.log(concept, start, end, startSentID,endSentID)

        addDefinition(concept, start, end, startSentID,endSentID, descriptionType)
        printDefinitions()
        closeDescriptionDiv()
    }else
        alert("Concept not defined")
}