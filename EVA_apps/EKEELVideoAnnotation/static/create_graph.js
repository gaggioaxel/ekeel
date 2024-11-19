printRelations()
printDescriptions()

function getSentenceIDandWordID(time, concept){

    let all_subs = $("#transcript-in-relation .sentence-marker");
    
    // Search forward
    let after_subtitles = all_subs.filter(function() {
        return parseFloat($(this).attr("data-start")) >= time;
    });

    if (after_subtitles.length > 0) {
        for(sub of after_subtitles) {
            let this_concept_element = $(sub).find('.concept').filter(function() {
                return $(this).attr('concept').includes(" "+concept+" ");
            });
            if(this_concept_element.length > 0)
                return {"sentID": this_concept_element.first().attr("sent_id"), 
                        "wordID": this_concept_element.first().attr("word_id")}
        }
    }

    // reverse prev subtitles and search backwards
    let prev_subtitles = $(all_subs.filter(function() {
        return parseFloat($(this).attr("data-start")) < time;
    }).get().reverse())
    for(sub of prev_subtitles) {
        let this_concept_element = $(sub).find('.concept').filter(function() {
            return $(this).attr('concept').includes(" "+concept+" ");
        });
        if (this_concept_element.length > 0)
            return {"sentID": this_concept_element.first().attr("sent_id"), 
                    "wordID": this_concept_element.first().attr("word_id")}
    }

    return {"sentID": all_subs.last().find("[lemma]").last().attr("sent_id"),
            "wordID":all_subs.last().find("[lemma]").last().attr("word_id") }
}

function addRelation(replaceIndx){

    let prereq = document.getElementById("prerequisite").value;
    let weight = document.getElementById("weight").value;
    weight = weight.charAt(0).toUpperCase() + weight.slice(1);
    let targetElement = document.getElementById("targetSelector");
    let target = targetElement.value;

    if ((prereq === "") || (target === "")) {
      alert("Concepts must be non-empty!");
      return false;
    }else if (!$concepts.some((concept) => concept == prereq)) {
      alert(prereq + " is not a concept");
      return false;
    }else if (!$concepts.some((concept) => concept == target)) {
      alert(target + " is not a concept");
      return false;
    }else if (checkCycle(prereq, target)){
      alert("Cannot insert the relation because it would create a cycle");
      return false;
    }else if (prereq == target){
      alert("A concept can't be a prerequisite of itself");
      return false;
    }

    //sentence ID and word ID in Conll
    let sentID = $(targetElement).attr("sent_id");
    let wordID = $(targetElement).attr("word_id");

    console.log(sentID)

    // if a box has been added take it based on percentage
    let targetBox = document.getElementById("targetBox")
    // if there is a targetBox the time is considered as the one of the bb, otherwise take the start_time of the sent_id,word_id
    let curr_time = targetBox ? 
                        player.currentTime() : 
                        parseFloat($("#transcript").find(`[sent_id=${sentID}][word_id=${wordID}]`).attr("start_time"));
    if(replaceIndx == undefined)
        for (rel of relations)
            if (rel.prerequisite == prereq &&
              rel.target == target && 
              rel.sent_id == sentID &&
              rel.word_id == wordID ) {
                alert("This relation already exists");
                return false;
            }

    let xywh="None"

    if(targetBox!= undefined){
        let canvas = document.getElementById('canvas-wrap');
        let totalWidth = canvas.offsetWidth
        let totalHeight = canvas.offsetHeight
        let x = targetBox.offsetLeft
        let y = targetBox.offsetTop
        let w = targetBox.offsetWidth
        let h = targetBox.offsetHeight

        let percentX = (x*100/totalWidth).toFixed(0)
        let percentY = (y*100/totalHeight).toFixed(0)
        let percentW = (w*100/totalWidth).toFixed(0)
        let percentH = (h*100/totalHeight).toFixed(0)

        xywh = "xywh=percent:"+percentX+","+percentY+","+percentW+","+percentH

        document.getElementById("targetBox").remove()
    }



    let relToInsert = {
        "time": secondsToTime(curr_time),
        "prerequisite": prereq,
        "target": target,
        "weight": weight,
        "sent_id": sentID,
        "word_id": wordID,
        "xywh": xywh
    }
    if (replaceIndx==null)
        relations.push(relToInsert)
    else
        relations[replaceIndx] = relToInsert
    $(".relations-sortable-header.ascending, .relations-sortable-header.descending").each(function (){
        if(this.classList.contains("ascending"))
            this.classList.replace("ascending","descending");
        else
            this.classList.replace("descending","ascending");
        sortRelations(this);
    });
    closeRelationDiv();
    uploadManuGraphOnDB()
}

function pushDefinition(concept, start, end, startSentID, endSentID, description_type){

    let definitionToInsert = {
        "concept": concept,
        "start": secondsToTime(start),
        "end": secondsToTime(end),
        "id": definitionID,
        "start_sent_id": startSentID,
        "end_sent_id": endSentID,
        "description_type": description_type
    }

    definedConcepts.push(concept)
    definitions.push(definitionToInsert)
    definitionID += 1
    uploadManuGraphOnDB();
    //console.log(definitions)
}

function editConceptAnnotation(button){
    let elements = $(button).parents("tr").find("td")
    let concept = elements.get()[0].innerText;
    setConceptSelectionElements(concept)
    let prevConceptStart = secondsToTime(timeToSeconds(elements.get()[1].innerText));
    let prevConceptEnd = secondsToTime(timeToSeconds(elements.get()[2].innerText));
    let prevDescriptionType = elements.get()[3].innerText;

    function revertChanges(mainDiv){
    
        closeDescriptionDiv()
    
        mainDiv.find("h2").text("Add Description");
        
        mainDiv.find("#concept-definition-hint").show();
    
        mainDiv.find("#conceptDescribed")
                .prop("readonly", false)
        
        mainDiv.find("#descriptionType").val("");
        
        mainDiv.find(".clone").remove()

        mainDiv.find(".relation-box-close-btn .close").show()
        mainDiv.find("#saveDescriptionButton").show()

    }

    const mainDiv = $("#add-concept-description")

    mainDiv.find("h2").text("Edit Description");

    mainDiv.find("#concept-definition-hint").hide();

    mainDiv.find("#conceptDescribed")
           .val(concept)
           .prop("readonly", true);
    
    startVideoSlider(timeToSeconds(prevConceptStart), timeToSeconds(prevConceptEnd))
    setRangeCursorColor()

    mainDiv.find("#descriptionType").val(prevDescriptionType);

    let closeButtonClone = mainDiv.find(".relation-box-close-btn .close")
                              .clone(false)
                              .addClass("clone")
                              .removeAttr("onclick")
                              .on("click", function(){ revertChanges(mainDiv) })

    mainDiv.find(".relation-box-close-btn .close")
            .hide()
            .parent()
            .append(closeButtonClone)
    
    let saveChangesButton = mainDiv.find("#saveDescriptionButton")
                                    .clone(false)
                                    .removeAttr("onClick")
                                    .addClass("clone")
                                    .text("Save Changes")
                                    .on("click", function(){
                                        let res = readDefinitionElements()
                                        definitions.forEach(element => {
                                            if(element.concept == concept && 
                                              element.start == prevConceptStart && 
                                              element.end == prevConceptEnd &&
                                              element.description_type == prevDescriptionType){

                                                element.start = secondsToTime(timeToSeconds(res.start));
                                                element.end = secondsToTime(timeToSeconds(res.end));
                                                element.start_sent_id = res.startSentID;
                                                element.end_sent_id = res.endSentID;
                                                element.description_type = res.descriptionType;
                                            }
                                        });
                                        uploadManuGraphOnDB();
                                        revertChanges(mainDiv);
                                        printDescriptions();
                                    });
    
    mainDiv.find("#saveDescriptionButton")
           .hide()
           .parent()
           .append(saveChangesButton)

    showDescriptionDiv(false)
    $(document.getElementById("transcript")).off("click",".concept")
}

function deleteDefinition(button, concept, start, end){
    $(".icon-button.trash.active").removeClass("active")
    $(button).addClass("active");
    confirmAnnotationDelete(button, {"concept": concept, "start": start, "end": end})
    setTimeout(function() {
        $(button).removeClass("active").blur();
    }, 1500);
}

function deleteRelation(button, target, prereq, weight, time) {
    $(".icon-button.trash.active").removeClass("active")
    $(button).addClass("active");
    confirmAnnotationDelete(button, { "target":target, "prereq":prereq, "weight":weight, "time":time });
    setTimeout(function() {
        $(button).removeClass("active").blur();
    }, 3000);
}

function confirmAnnotationDelete(button, fields){

    // Hide the box
    function closeConfirmAnnotatorBox() {
        $("#confirmDeleteBox").fadeOut(200, function() {
            $('body').css('overflow', 'auto'); // Ripristina lo scrolling
            $(this).remove()
        }).undim({ fadeOutDuration: 200 });
    }

    $("<div></div>", {
        class: 'box',
        id: "confirmDeleteBox",
        css: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: 'auto',
            minWidth: '260px',
            height: 'auto',
            backgroundColor: 'white',
            border: '2px solid gray',
            borderRadius: '10px',
            transform: 'translate(-50%, -50%)',
            display: 'none',
            padding: '1em',
            textAlign: 'center'
        }
    }).appendTo($(button).closest(".table"))
    
    let box = $("#confirmDeleteBox")
  
    // Add confirmation text
    let kind = $(button).closest("div").attr("id").slice(0,-1)
    let title = $(`<div><h5>Confirm ${kind} delete?</h5></div>`).css({
      color: '#333'
    }).appendTo(box);
    $('<hr>').css("margin-bottom","3em").appendTo(title);

    // Create button container for symmetry
    const buttonsContainer = $("<div></div>").css("margin-top","4em").appendTo(title);

    // Add 'No' button
    $("<button class='btn btn-primary btn-addrelation btn-dodgerblue'>No</button>").css({
      position: 'absolute',
      bottom: '1em',
      left: '5%'
    }).on("click", function() {
        closeConfirmAnnotatorBox() // Restore scroll on close
    }).appendTo(buttonsContainer);

    // Add 'Yes' button
    $("<button class='btn btn-primary btn-addrelation delete'>Yes</button>").css({
      position: 'absolute',
      bottom: '1em',
      left: '55%'
    }).on("click", function() {
        closeConfirmAnnotatorBox()
        /* remove row with fade out*/
        let row = $(button).closest('tr')
        if(button!=null)
            $(button).closest('tr')
                    .children('td, th')
                    .animate({
                        padding: 0
                    })
                    .wrapInner('<div />')
                    .children()
                    .slideUp(function () {
                        $(row).remove();
                    });
        if(kind == "description") {
            let concept = fields["concept"]
            let start = fields["start"]
            let end = fields["end"]
            let toDelete
            for(let i in definitions){
                if(concept == definitions[i].concept && start == definitions[i].start && end == definitions[i].end){
                    toDelete = i
                    break
                }
            }
            definitions.splice(toDelete, 1)
            definedConcepts.splice(toDelete, 1)
        } else {
            let target = fields["target"]
            let prereq = fields["prereq"]
            let weight = fields["weight"]
            let time = fields["time"]
            for(let i=0; i<relations.length; i++){
            
                if(relations[i].target == target &&
                   relations[i].prerequisite == prereq &&
                   relations[i].weight == weight &&
                   relations[i].time == time){
                    relations.splice(i,1)
                    check = true;
                    break
                }
            }
        }
        uploadManuGraphOnDB()
    }).appendTo(buttonsContainer);

    box.css({opacity: 0, display: 'flex'}).animate({
      opacity: 1
    }, 300).dimBackground({ darkness: bgDarknessOnOverlay });
    //$('body').css('overflow', 'hidden');

}



/* Creation of the table containing the relations*/
function printRelations() {
    let relationTable = document.getElementById("relationsTable");

    relationTable.innerHTML = "";

    for (let i in relations) {
        let p = relations[i].prerequisite;
        let t = relations[i].target;
        let w = relations[i].weight;
        let ti = relations[i].time;
        let ti_text = secondsToTimeShorter(timeToSeconds(ti))
        let sentID = relations[i].sent_id;
        let wordID = relations[i].word_id;
        let bb = relations[i].xywh != "None";

        let selectHTML = `<select onchange="changeWeight(this, '${t}', '${p}', '${ti}')">
                            <option value="Strong" ${w === 'Strong' ? 'selected' : ''}>Strong</option>
                            <option value="Weak" ${w === 'Weak' ? 'selected' : ''}>Weak</option>
                          </select>`;
        
        let relToVisualize = `<tr index="${i}" >
                                <td sent_id=\"${sentID}\" word_id=\"${wordID}\" >${t}</td>
                                <td>${p}</td>
                                <td>${selectHTML}</td>` +
            `<td>${ti_text}</td>` +
            `<td>` +
                `<div style="display:flex;">` +
                (bb ? 
                    `<button style="margin:auto" class="icon-button expand visual-effect " onclick="toggleBoundingBox(this)" title="show this bounding box">` +
                        `<i class="fa-solid fa-expand" aria-hidden="true"></i>` +
                    `</button>` +
                    `<button class="btn btn-primary" onclick="afterEditBoundingBox(this)" title="edit this bounding box">Edit</button>`
                : 
                    `<button class="btn btn-primary visual-effect" onclick="afterAddBoundingBox(this)" title="create a bounding box for this concept">Add</button>`
                ) +
                `</div>` +
            `</td>`+
            `<td><button `+
                `class="icon-button trash " ` +
                `style="font-size:20" `+ 
                `onclick="deleteRelation(this,'${t}','${p}','${w}','${ti}')"`+
                `title="delete relation between the two concepts">` +
            `<i class="fa-solid fa-trash"></i></button></td></tr>`;

        relationTable.innerHTML += relToVisualize;
    }
}

/* Function to update the weight */
function changeWeight(selectElement, target, prerequisite, time) {
    let newWeight = selectElement.value;

    // Find the relation in the relations array and update its weight
    for (let i in relations) {
        if (relations[i].target === target && 
         relations[i].prerequisite === prerequisite && 
         relations[i].time === time) {
            relations[i].weight = newWeight;
            break;
        }
    }

    // Optionally, you can re-render the table to reflect the updated values
    printRelations();
    uploadManuGraphOnDB()
}


function printDescriptions(){

    let definitionTable = document.getElementById("descriptionsTable")

    definitionTable.innerHTML = ""

    for(let i in definitions){

        let c = definitions[i].concept
        let s = definitions[i].start
        let s_text = secondsToTimeShorter(timeToSeconds(s))
        let e = definitions[i].end
        let e_text = secondsToTimeShorter(timeToSeconds(e))
        let t = definitions[i].description_type

        let relToVisualize = "<tr><td>"+ c +"</td><td>"+ s_text + "</td><td>"+ e_text +"</td><td>"+ t +"</td>"+
            "<td><button index='"+i+"' class=\"icon-button play-definition visual-effect \" " +
                "onclick=\"playExplanation(this,'"+s+"','"+e+"')\" " +
                "title=\"play this annotation\">" +
            "<i class=\"fa-solid fa-circle-play\" aria-hidden=\"true\"></i></button></td>" +

            "<td><button class=\"btn btn-primary btn-addrelation btn-dodgerblue visual-effect\" " +
                `onclick=\"editConceptAnnotation(this)\" ` +
                "title=\"Edit this annotation\">Edit" +
            "</button></td>" +
            
            "<td><button class=\"icon-button trash \" " +
                `onclick=\"deleteDefinition(this,\`${c}\`,\`${s}\`,\`${e}\`)\"` +
                "title=\"Delete concept description\">" +
            "<i class=\"fa-solid fa-trash\" aria-hidden=\"true\"></i></button></td></tr>"

        definitionTable.innerHTML += relToVisualize

    }
    //console.log(definitions)

}


/*
* Given a concept, it returns all the concepts of which he is a prerequisite
* */
function getNeighbors (concept){
    let neighbors = [];

    for (let key in relations){
        if(relations[key].prerequisite == concept)
            neighbors.push(relations[key].target)
    }
    return neighbors;
}

/* Breath First Search*/
function BFS(from, to){

     let queue = [from];

        while (queue.length) {

            let curr = queue.pop();
            let nextLevel = getNeighbors(curr);

            if( nextLevel.includes(to))
                return true; //found
            else
                for(let i=0; i<nextLevel.length; i++)
                    queue.push(nextLevel[i]);
        }

        return false; //not found

}

/* This function checks if by adding the relation prereq --> target, it will create a loop
*
* True when from "target" it's possible to reach "prereq"
*
* */
function checkCycle(prereq, target){
    /* faccio una ricerca partendo dal target
    se dal target riesco ad arrivare al prerequisito vuol dire che mettendo la relazione
    prereq -> target si creerebbe un ciclo */
    return BFS(target, prereq)
}

/* Visualization of the graph --> graph_visualization.js*/
function startVisualization(){

    let conceptsWithSynonyms = [];
    let relationsWithSynonyms = [];

    for(let word in $conceptVocabulary) {
        let node = [word];
        for(let synonym of $conceptVocabulary[word]) {
            node.push(synonym);
        }
        node.sort();
        let nodeName = "";
        for(let i=0; i<node.length; i++) {
            if(i===0) {
                nodeName = node[i];
            }
            else {
                nodeName += " = " + node[i];
            }   
        }
        //console.log(node)

        conceptsWithSynonyms.push(nodeName);
        //console.log(conceptsWithSynonyms)
    }

    let graphNodes = [...new Set(conceptsWithSynonyms)];
    //console.log(graphNodes)

    let checkDuplicateArray = []

    for (let item of relations){
        let newRelation = {}
        for (let node of graphNodes){
            if  (node.split(" = ").includes(item["prerequisite"])){
                newRelation["prerequisite"]=node
            }
            if  (node.split(" = ").includes(item["target"])){   
                newRelation["target"]=node
            }
        }

        let strOfRelation = newRelation["prerequisite"] + "--" + newRelation["target"];

        if(checkDuplicateArray.includes(strOfRelation) === false) {
          relationsWithSynonyms.push(newRelation)
          checkDuplicateArray.push(strOfRelation)
        }
    }

    let n = showNetwork(graphNodes, relationsWithSynonyms, "network")
    n.fit()

}