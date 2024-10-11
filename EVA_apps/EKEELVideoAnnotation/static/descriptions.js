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
    if (document.getElementById("transcript-selected-concept").innerHTML != "--"){
        document.getElementById("conceptDefined").value = document.getElementById("transcript-selected-concept").innerHTML
    } else {
        document.getElementById("conceptDefined").value = ""
    }
    document.getElementById("descriptionType").value = ""

    player.controls(false)
    video.pause()
    $("#playButton").removeClass("paused")
    state = "desc"


    startVideoSlider()
    // Add event listener for Escape key
    document.addEventListener('keydown', handleKeys);

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
    document.removeEventListener('keydown', handleKeys);
    state = "home"
    highlightExplanationInTranscript(null, -1, -1, ".youtube-in-description-marker")


}

function handleKeys(event) {
    if (event.key === 'Escape') {
        closeDescriptionDiv();
    }
}

function changeColor(){
    let descriptionType = document.getElementById("descriptionType").value;

    if (descriptionType == "Definition"){
        document.getElementsByClassName("ui-slider-range")[0].style.background="#ffc107";
        document.getElementById("amount").style.color = "#ffc107"
    }else if(descriptionType == "Expansion"){
        document.getElementsByClassName("ui-slider-range")[0].style.background="dodgerblue";
        document.getElementById("amount").style.color = "dodgerblue"
    }

}

function addDescription(){

    if (!document.getElementById("descriptionType").value){
        alert("Must select description type")
        return
    }
    let concept = document.getElementById("conceptDefined").value;
    if (!$concepts.includes(concept)) {
        alert("Concept not defined")
        return
    }

    var values = document.getElementById("handleSinistro").innerText.split(':').map(Number);
    if(values.length == 2)
        var start = values[0]*60+values[1];
    else if(values.length == 3)   
        var start = values[0]*3600+values[1]*60+values[2];

    values = document.getElementById("handleDestro").innerText.split(':').map(Number);
    if(values.length == 2)
        var end = values[0]*60+values[1];
    else if(values.length == 3)   
        var end = values[0]*3600+values[1]*60+values[2];

    let descriptionType = document.getElementById("descriptionType").value;
    
    //console.log(concept, start, end, descriptionType)
    let start_sub = getCurrentSubtitle(start)
    let startSentID = getSentenceIDfromSub(start_sub)

    let end_sub = getCurrentSubtitle(end)
    if(end_sub == undefined)
        end_sub = $(".sentence-marker").last()
    
    endSentID = getSentenceIDfromSub(end_sub)
    
    //console.log(concept, start, end, startSentID,endSentID)
    addDefinition(concept, start, end, startSentID,endSentID, descriptionType)
    printDefinitions()
    closeDescriptionDiv()
    uploadManuGraphOnDB()
}