function showDefinitionDiv(reset_fields){
    clearAnnotatorVisualElements()
    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

    $('#canvas-wrap').dimBackground();
    $('#videoSlider').show();
    $('#videoSlider').dimBackground();
    //$('#add-concept-description').show();
    $('#right-body').hide();
    $('#right-body-description').show();
    $('#right-body-description').dimBackground();
    //$('#add-concept-description').dimBackground();
    if(reset_fields) {
        if (document.getElementById("transcript-selected-concept").innerHTML != "--"){
            document.getElementById("conceptDefined").value = document.getElementById("transcript-selected-concept").innerHTML
        } else {
            document.getElementById("conceptDefined").value = ""
        }
        document.getElementById("descriptionType").value = ""
        startVideoSlider(null,null)
    }

    player.pause()
    player.controls(false)
    $("#playButton").removeClass("paused")
    state = "desc"

    // Add event listener for Escape key
    document.addEventListener('keydown', handleKeys);

}

function closeDefinitionDiv(){

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
    highlightExplanationInTranscript(-1, -1, "#transcript-in-description", ".sentence-marker-in-description")


}

function handleKeys(event) {
    if (event.key === 'Escape') {
        closeDefinitionDiv();
    }
}

function changeColor(){
    let descriptionType = document.getElementById("descriptionType").value;

    if (descriptionType == "Definition"){
        document.getElementsByClassName("ui-slider-range")[0].style.background="#ffc107";
        document.getElementById("descriptionRangeInput").style.color = "#ffc107"
    }else if(descriptionType == "Expansion"){
        document.getElementsByClassName("ui-slider-range")[0].style.background="dodgerblue";
        document.getElementById("descriptionRangeInput").style.color = "dodgerblue"
    }

}

function readDefinitionElements(){
    var start = timeToSeconds(document.getElementById("handleSinistro").innerText);
    var end = timeToSeconds(document.getElementById("handleDestro").innerText);

    let descriptionType = document.getElementById("descriptionType").value;
    
    //console.log(concept, start, end, descriptionType)
    let start_sub = getCurrentSubtitle(start)
    let startSentID = getSentenceIDfromSub(start_sub)

    let end_sub = getCurrentSubtitle(end)
    if(end_sub == undefined)
        end_sub = $(".sentence-marker").last()
    
    let endSentID = getSentenceIDfromSub(end_sub);
    return {"start":start, "end":end, "descriptionType":descriptionType, "startSentID":startSentID, "endSentID":endSentID}
}

function addDefinition(){

    if (!document.getElementById("descriptionType").value){
        alert("Must select description type")
        return
    }
    let concept = document.getElementById("conceptDefined").value;
    if(concept.length == 0){
        alert("Concept cannot be empty")
        return
    }
    if (!$concepts.includes(concept)) {
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
    pushDefinition(concept, res.start, res.end, res.startSentID, res.endSentID, res.descriptionType);
    $(".descriptions-sortable-header.ascending, .descriptions-sortable-header.descending").each(function (){
        if(this.classList.contains("ascending"))
            this.classList.replace("ascending","descending");
        else
            this.classList.replace("descending","ascending");
        sortDescriptions(this);
    });
    closeDefinitionDiv();
    
}

function sortDescriptions(element){
    if (element == null) {
        definitions.sort((a,b) => timeToSeconds(a.start) - timeToSeconds(b.start))
        $(".descriptions-sortable-header").get()[1].classList.add("ascending") 
        printDefinitions()
        setCookie("sort-pref-descriptions","StartA")
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
    printDefinitions()
    setCookie("sort-pref-descriptions",element.innerHTML+(flipped_sorting_order=="ascending" ? "A" : "D"))
}

sortDescriptions(getCookie('sort-pref-descriptions'))


function sortRelations(element){
    if (element == null) {
        relations.sort((a,b) => timeToSeconds(a.time) - timeToSeconds(b.time))
        $(".relations-sortable-header").get()[3].classList.add("ascending")
        printRelations()
        setCookie("sort-pref-relations","Start timeA")
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
    setCookie("sort-pref-relations",element.innerHTML+(flipped_sorting_order=="ascending" ? "A" : "D"))
}

sortRelations(getCookie('sort-pref-relations'))