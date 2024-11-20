function showDescriptionDiv(reset_fields){
    state = "desc"
    clearAnnotatorVisualElements()
    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");
    player.pause()
    player.controls(false)
    $("#playButton").removeClass("paused")

    $("#slidesContainer, #mainButtonsContainer").hide()
    $("#descriptionsTable, #relationsTable").css("overflow", "visible")
    $('#videoSlider, #right-body, #right-body-description').toggle();
    $('#canvas-wrap, #videoSlider, #transcript, #right-body-description').dimBackground({ darkness: bgDarknessOnOverlay });

    if(reset_fields) {
        if (document.getElementById("transcript-selected-concept").innerHTML != "--"){
            document.getElementById("conceptDescribed").value = document.getElementById("transcript-selected-concept").innerHTML
        } else {
            document.getElementById("conceptDescribed").value = ""
        }
        document.getElementById("descriptionType").value = ""
        startVideoSlider(null,null)
    }  

    setRangeCursorColor()

    const transcript = $(document.getElementById("transcript"))

    transcript.detach()
    transcript.appendTo("#right-body-description")
    transcript.find(".current-marker").removeClass("current-marker")
    transcript.off("click")

    transcript.on("click", ".concept", function (e) {

        // removes the fields for the elements
        $(".selected-concept-text").each( function(){
          $(this).removeClass("selected-concept-text")
        })
      
        var target = e.currentTarget;
        var selectedConcept = target.getAttribute("concept")
          .split(" ")
          .filter(str => str.length > 0)
          .sort((a, b) => a.split("_").length - b.split("_").length)
          .reverse()[0];
        var selectedConceptText = selectedConcept.replaceAll("_", " ");
      
        // Toggle selection in the conceptDescribed field
        const conceptField = document.getElementById("conceptDescribed");
        if (conceptField.value == selectedConceptText) {
          conceptField.value = "";
          return;
        }
        conceptField.value = selectedConceptText;

        // Find elements near the target with the same concept attribute
        $(target).siblings(".concept").addBack().each(function() {
          if (this.getAttribute("concept") && this.getAttribute("concept").includes(selectedConcept)) {
            $(this).addClass("selected-concept-text");
          }
        });
        setConceptSelectionElements(selectedConceptText);
        
    });

    transcript.on('mouseup', function () {

        var selection = window.getSelection()
      
        if (selection.rangeCount == 0)
          return
        
        let start_range = selection.getRangeAt(0) 
        if(start_range.commonAncestorContainer.id != "transcript" &&
         !start_range.commonAncestorContainer.classList.contains("sentence-marker")) {
          selection.removeAllRanges()
          return
        }
      
        var start_time = $(start_range.startContainer).closest("[start_time]").attr("start_time")
        
        if (!start_time) return
      
        var endRange = selection.getRangeAt(selection.rangeCount - 1);
        var end_time = $(endRange.endContainer).closest("[end_time]").attr("end_time");
      
        selection.removeAllRanges()  

        if(!end_time) end_time = document.querySelector('p.sentence-marker:last-child').getAttribute("data-end");
          
        // Highlight the selection with the found start and end times
        highlightExplanationInTranscript(parseFloat(start_time), parseFloat(end_time));
      
        // Update the slider values
        $("#videoSlider").slider("values", [start_time, end_time]);
        $("#descriptionRangeInput").val("Start: " + secondsToTimeCropped(start_time) + " - End: " + secondsToTimeCropped(end_time));
          
        // Update the handle labels
        document.getElementById("handleSinistro").innerHTML = secondsToTimeCropped(start_time);
        document.getElementById("handleDestro").innerHTML = secondsToTimeCropped(end_time);
    });

    $(document).off("keydown")
    $(document).on('keydown', function(event) {
        // If an input field or textarea is focused, return early
        if ($(document.activeElement).is('input, textarea'))
            return;


        switch (event.keyCode) {
            case 32: // Space key
                playDescription($("#playButton").get()[0]);
                break;
    
            case 37: // Left Arrow key
            case 39: // Right Arrow key
                return
            
            case 27:
                closeDescriptionDiv();
                break;
        }
        event.preventDefault(); // Prevent default scrolling
    });

}

function closeDescriptionDiv(){
    state = "home"
    player.controls(true)
    clearInterval(interval_indicator)
    $("#position_indicator").remove()
    document.getElementById("timeSlider").innerHTML = ""

    reattachTranscriptAnnotator()
    $(document.getElementById("transcript"))
        .off("click")
        .off("mouseup")
    $(document).off('keydown');
    attachClickListenerOnConcepts()
    attachUpdateTimeListenerOnTranscript()
    highlightExplanationInTranscript(-1, -1)
    attachPlayerKeyEvents()
    setConceptSelectionElements("--")

    $("#slidesContainer, #mainButtonsContainer").fadeIn("fast")
    $("#descriptionsTable, #relationsTable").css("overflow", "hidden auto")
    $('#videoSlider, #right-body, #right-body-description').toggle();
    $('#canvas-wrap, #videoSlider, #transcript, #right-body-description').undim({ fadeOutDuration: 300 });
}

function setRangeCursorColor(){
    let descriptionType = document.getElementById("descriptionType").value;

    if (descriptionType == "Definition"){
        document.getElementsByClassName("ui-slider-range")[0].style.background="#ffc107";
        document.getElementById("descriptionRangeInput").style.color = "#ffc107"
    }else {
        document.getElementsByClassName("ui-slider-range")[0].style.background="dodgerblue";
        document.getElementById("descriptionRangeInput").style.color = "dodgerblue"
    }

}

function readDefinitionElements(){
    var start = document.getElementById("handleSinistro").innerText;
    var end = document.getElementById("handleDestro").innerText;

    let descriptionType = document.getElementById("descriptionType").value;
    
    //console.log(concept, start, end, descriptionType)
    let start_sub = getCurrentSubtitle(timeToSeconds(start))
    let startSentID = getSentenceIDfromSub(start_sub)

    let end_sub = getCurrentSubtitle(timeToSeconds(end))
    if(end_sub == undefined)
        end_sub = $(".sentence-marker").last()
    
    let endSentID = getSentenceIDfromSub(end_sub);
    return {"start":start, "end":end, "descriptionType":descriptionType, "startSentID":startSentID, "endSentID":endSentID}
}

function addDescription(){

    if (!document.getElementById("descriptionType").value){
        alert("Must select description type")
        return
    }
    let concept = document.getElementById("conceptDescribed").value;
    if(concept.length == 0){
        alert("Concept cannot be empty")
        return
    }
    if (!$concepts.some((other_concept) => other_concept == concept)) {
        let conceptSplit = concept.split(" ")
        let filteredElements = $('.transcript-in-description').find('[lemma]:contains("'+conceptSplit[0]+'")')
        for(wordIndx in conceptSplit) {
            if(parseInt(wordIndx)!=0)
                filteredElements = filteredElements.filter( function() { return this.nextSibling.innerText.includes(conceptSplit[parseInt(wordIndx)]) })
            if(filteredElements.length == 0) break
        }
        if(filteredElements.length == 0) {
            alert("This concept is not defined")
            return
        }
        let filteredConcept = $(filteredElements)
                                        .attr("concept")
                                        .split(" ")
                                        .map(element => element.split('_'))
                                        .filter( (element,_) => element.length == conceptSplit.length )
        if(filteredConcept.length == 0 || filteredConcept.length > 1){
            alert("Error when filtering, try selecting directly the concept")
            return
        }
        concept = filteredConcept[0].join(" ")
    }

    res = readDefinitionElements()
    
    //console.log(concept, start, end, startSentID,endSentID)
    pushDefinition(concept, timeToSeconds(res.start), timeToSeconds(res.end), res.startSentID, res.endSentID, res.descriptionType);
    $(".descriptions-sortable-header.ascending, .descriptions-sortable-header.descending").each(function (){
        if(this.classList.contains("ascending"))
            this.classList.replace("ascending","descending");
        else
            this.classList.replace("descending","ascending");
        sortDescriptions(this);
    });
    closeDescriptionDiv();
    
}

function sortDescriptions(element){
    if (element == null) {
        definitions.sort((a,b) => timeToSeconds(a.start) - timeToSeconds(b.start))
        $(".descriptions-sortable-header").get()[1].classList.add("ascending") 
        printDescriptions()
        setCookie("pref-sort-descriptions","StartA")
        return
    // the relations have been sorted by cookie
    } else if(typeof element == "string") {
        element = $(".descriptions-sortable-header").filter(function() {
                    return $(this).text().includes(element.substring(0, element.length - 1));
                }).addClass(element.slice(-1) == "A" ? "descending" : "ascending").get()[0]
        // in case of any error with the cookie reset back 
        if (element == null){
            sortDescriptions()
            return
        }
    }
    const concepts_header = $(".descriptions-sortable-header")
    var flipped_sorting_order = element.classList.contains("ascending") ? "descending" : "ascending"
    var text = element.innerText + " " + flipped_sorting_order;
    concepts_header.each(function(){ $(this).removeClass("ascending").removeClass("descending") })
    switch (text) {
        case "Concept ascending":
            fnc = (a,b) => a.concept > b.concept
            concepts_header[0].classList.add(flipped_sorting_order)
            break
        case "Concept descending":
            fnc = (a,b) => a.concept < b.concept
            concepts_header[0].classList.add(flipped_sorting_order)
            break
        case "Start ascending":
            fnc = (a,b) => timeToSeconds(a.start) - timeToSeconds(b.start)
            concepts_header[1].classList.add(flipped_sorting_order)
            break
        case "Start descending":
            fnc = (a,b) => timeToSeconds(b.start) - timeToSeconds(a.start)
            concepts_header[1].classList.add(flipped_sorting_order)
            break
        case "End ascending":
            fnc = (a,b) => timeToSeconds(a.end) - timeToSeconds(b.end)
            concepts_header[2].classList.add(flipped_sorting_order)
            break
        case "End descending":
            fnc = (a,b) => timeToSeconds(b.end) - timeToSeconds(a.end)
            concepts_header[2].classList.add(flipped_sorting_order)
            break
        // For type sort by type and if same type sort by ascending concept name
        case "Type ascending":
            fnc = (a,b) => a.description_type != b.description_type ? a.description_type > b.description_type : a.concept > b.concept
            concepts_header[3].classList.add(flipped_sorting_order)
            break
        case "Type descending":
            fnc = (a,b) => a.description_type != b.description_type ? a.description_type < b.description_type : a.concept > b.concept
            concepts_header[3].classList.add(flipped_sorting_order)
            break
    }
    definitions.sort(fnc)
    printDescriptions()
    setCookie("pref-sort-descriptions",element.innerHTML+(flipped_sorting_order=="ascending" ? "A" : "D"))
}

sortDescriptions(getCookie('pref-sort-descriptions'))


function sortRelations(element){
    if (element == null) {
        relations.sort((a,b) => timeToSeconds(a.time) - timeToSeconds(b.time))
        $(".relations-sortable-header").get()[3].classList.add("ascending")
        printRelations()
        setCookie("pref-sort-relations","Start timeA")
        return
    // the relations have been sorted by cookie
    } else if(typeof element == "string") {
        element = $(".relations-sortable-header").filter(function() {
                    return $(this).text().includes(element.substring(0, element.length - 1));
                }).addClass(element.slice(-1) == "A" ? "descending" : "ascending").get()[0]
        // in case of any error with the cookie reset back 
        if (element == null){
            sortRelations()
            return
        }
    }

    const relations_header = $(".relations-sortable-header")
    var flipped_sorting_order = element.classList.contains("ascending") ? "descending" : "ascending";
    var text = element.innerText + " " + flipped_sorting_order;
    relations_header.each(function(){ $(this).removeClass("ascending").removeClass("descending") })
    switch (text) {
        case "Concept ascending":
            fnc = (a,b) => a.target != b.target ? a.target > b.target : a.prerequisite > b.prerequisite
            relations_header[0].classList.add(flipped_sorting_order)
            break
        case "Concept descending":
            fnc = (a,b) => a.target != b.target ? a.target < b.target : a.prerequisite > b.prerequisite
            relations_header[0].classList.add(flipped_sorting_order)
            break
        case "Prerequisite ascending":
            fnc = (a,b) => a.prerequisite != b.prerequisite ? a.prerequisite > b.prerequisite : a.target > b.target
            relations_header[1].classList.add(flipped_sorting_order)
            break
        case "Prerequisite descending":
            fnc = (a,b) => a.prerequisite != b.prerequisite ? a.prerequisite < b.prerequisite : a.target > b.target
            relations_header[1].classList.add(flipped_sorting_order)
            break
        // sort by weight if same weight sort by target
        case "Weight ascending":
            fnc = (a,b) => a.weight != b.weight ? a.weight > b.weight : a.target > b.target
            relations_header[2].classList.add(flipped_sorting_order)
            break
        case "Weight descending":
            fnc = (a,b) => a.weight != b.weight ? a.weight < b.weight : a.target > b.target
            relations_header[2].classList.add(flipped_sorting_order)
            break
        case "Start time ascending":
            fnc = (a,b) => timeToSeconds(a.time) - timeToSeconds(b.time)
            relations_header[3].classList.add(flipped_sorting_order)
            break
        case "Start time descending":
            fnc = (a,b) => timeToSeconds(b.time) - timeToSeconds(a.time)
            relations_header[3].classList.add(flipped_sorting_order)
            break
    }
    relations.sort(fnc)
    printRelations()
    setCookie("pref-sort-relations",element.innerHTML+(flipped_sorting_order=="ascending" ? "A" : "D"))
}

sortRelations(getCookie('pref-sort-relations'))