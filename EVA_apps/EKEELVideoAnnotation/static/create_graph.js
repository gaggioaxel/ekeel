let targetSentID = null
let targetWordID = null

printRelations()
printDefinitions()

/*
* By clicking on a concept in the box below the video, it will automatically add the concept in the form.
* 
document.getElementById("transcript-in-relation").on('click','.concept',function(){

  if( document.getElementById("target").value == ""){

    let concept = $(this).attr("concept")

    document.getElementById("target").value = lemma.replaceAll("_"," ")

    if(lemma.split("_").length > 1){
        targetSentID = $(this).find( "[lemma='" + lemma.split("_")[0]+ "']").attr("sent_id")
        targetWordID = $(this).find( "[lemma='" + lemma.split("_")[0]+ "']").attr("word_id")
    }else{
        targetSentID = $(this).attr("sent_id")
        targetWordID = $(this).attr("word_id")
    }

  }
  else
    document.getElementById("prerequisite").value = $(this).attr("lemma").replaceAll("_"," ")
}) */

$("#transcript-in-relation").on('click', '.concept', function() {

    let concept = $($(this).attr("concept").trim().split(" ")).last().get()[0];
    if ($("#target").val() == "") {
      $("#target").val(concept.replaceAll("_", " "));
  
      if (concept.split("_").length > 1) {
        targetSentID = $(this).closest("[lemma='" + concept.split("_")[0] + "']").attr("sent_id");
        targetWordID = $(this).closest("[lemma='" + concept.split("_")[0] + "']").attr("word_id");
      } else {
        targetSentID = $(this).attr("sent_id");
        targetWordID = $(this).attr("word_id");
      }
  
    } else
      $("#prerequisite").val(concept.replaceAll("_", " "));
  
});
  

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
    let target = document.getElementById("target").value;

    if ((prereq === "") || (target === "")) {
      alert("Concepts must be non-empty!");
      return false;
    }else if (!$concepts.includes(prereq)) {
      alert(prereq + " is not a concept");
      return false;
    }else if (!$concepts.includes(target)) {
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
    let sentID;
    let wordID;
    let curr_time = player.currentTime();

    // if sentID and wordID are set by clicking on them, take them 
    if(targetSentID != null){
        sentID = targetSentID;
        wordID = targetWordID;
    // otherwise find them in the sentences after
    }else{
      let ids = getSentenceIDandWordID(curr_time, target.replaceAll(" ","_"));
      sentID = ids.sentID;
      wordID = ids.wordID;
    }

    console.log(sentID)

    // if a box has been added take it based on percentage
    let targetBox = document.getElementById("targetBox")
    let xywh

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

    }else
        xywh = "None"



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
    printRelations();
    closeRelationDiv();

    targetSentID = null
    targetWordID = null
    uploadManuGraphOnDB()
}

function deleteRelation(button, target, prereq, weight, time) {

    if(!$(button).hasClass("active")) {
        $(".icon-button.trash.active").removeClass("active")
        $(button).addClass("active");
        setTimeout(function() {
            $(button).removeClass("active").blur();
        }, 3000);
        return
    }

    $(".icon-button.trash.active").removeClass("active")
    
    /* remove row with fade out*/
    let row = $(button).closest('tr')
    $(row)
            .children('td, th')
            .animate({
            padding: 0
        })
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
            $(row).remove();
        });


    let check = false
    for(let i=0; i<relations.length; i++){

        if(relations[i].target == target &&
           relations[i].prerequisite == prereq &&
           relations[i].weight == weight &&
           relations[i].time.split(":").filter(elem => elem != "00").join(":") == time){
            relations.splice(i,1)
            check = true;
            break
        }
    }

    if(!check)
        alert("error in removing relation!")

    uploadManuGraphOnDB()
    //console.log(relations)

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

function editConceptAnnotation(button, concept, start_time, end_time, description_type){
    function revertChanges(mainDiv){
    
        closeDefinitionDiv()
    
        mainDiv.find("h2").text("Add Definition");
        
        mainDiv.find("#concept-definition-hint").show();
    
        mainDiv.find("#conceptDefined")
                .prop("readonly", false)
        
        mainDiv.find("#descriptionRangeInput").css("color","dodgerblue");
        
        mainDiv.find("#descriptionType").val("").change();
        
        mainDiv.find(".clone").remove()

        mainDiv.find(".relation-box-close-btn .close").show()
        mainDiv.find("#saveDefinitionButton").show()

    }

    const mainDiv = $("#add-concept-description")

    mainDiv.find("h2").text("Edit Definition");

    mainDiv.find("#concept-definition-hint").hide();

    mainDiv.find("#conceptDefined")
            .val(concept)
            .prop("readonly", true)
            .change();
    
    startVideoSlider(timeToSeconds(start_time), timeToSeconds(end_time))

    mainDiv.find("#descriptionType").val(description_type).change();

    let closeButtonClone = mainDiv.find(".relation-box-close-btn .close")
                              .clone(false)
                              .addClass("clone")
                              .removeAttr("onclick")
                              .on("click", function(){ revertChanges(mainDiv) })

    mainDiv.find(".relation-box-close-btn .close")
            .hide()
            .parent()
            .append(closeButtonClone)
    
    let saveChangesButton = mainDiv.find("#saveDefinitionButton")
                                    .clone(false)
                                    .addClass("clone")
                                    .text("Save Changes")
                                    .on("click", function(){
                                        let res = readDefinitionElements()
                                        definitions.forEach(element => {
                                            if(element.concept == concept && element.start == start_time && element.end == end_time){
                                                element.start = secondsToTime(res.start);
                                                element.end = secondsToTime(res.end);
                                                element.start_sent_id = res.startSentID;
                                                element.end_sent_id = res.endSentID;
                                                element.description_type = res.descriptionType;
                                            }
                                        });
                                        uploadManuGraphOnDB();
                                        printDefinitions();
                                        closeDefinitionDiv();
                                    });
    
    mainDiv.find("#saveDefinitionButton")
            .hide()
            .parent()
            .append(saveChangesButton)

    showDefinitionDiv(false)
}

function deleteDefinition(button, concept, start, end){

    if(!$(button).hasClass("active")) {
        $(".icon-button.trash.active").removeClass("active")
        $(button).addClass("active");
        setTimeout(function() {
            $(button).removeClass("active").blur();
        }, 1500);
        return
    }
    $(".icon-button.trash.active").removeClass("active")

    let toDelete

    for(let i in definitions){

        if(concept == definitions[i].concept && start == definitions[i].start && end == definitions[i].end){
            toDelete = i
            break
        }

    }
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

    definitions.splice(toDelete, 1)
    definedConcepts.splice(toDelete, 1)
    uploadManuGraphOnDB()
}



function downloadManuGraphAsJson(){

    //console.log("***** EKEEL - Video Annotation: create_graph.js::downloadManuGraphAsJson(): Inizio *****")

    let annotations = {
        "id": $video_id,
        "relations":relations,
        "definitions": definitions,
        "annotator": $annotator,
        "conceptVocabulary": $conceptVocabulary,
        "language": $language,
    }

    var js_data = JSON.stringify(annotations);

    $.ajax({
        url: '/annotator/download_graph',
        type : 'post',
        contentType: 'application/json',
        dataType : 'json',
        data : js_data
    }).done(function(result) {
        //console.log(result)
        downloadObjectAsJson(result, "graph");
    })    
}
  
function uploadManuGraphOnDB(){

    let annotations = {
        "id": $video_id,
        "relations":relations,
        "definitions": definitions,
        "annotator": $annotator,
        "conceptVocabulary": $conceptVocabulary,
        "language": $language,
        "is_completed": isCompleted
    }
    //savedText = document.getElementById("saveGraphText")
    //savedText.style.display = "block"
    //console.log("uploadGraphOnDB")

    var js_data = JSON.stringify(annotations);

    $.ajax({
        url: '/annotator/upload_graph',
        type : 'post',
        contentType: 'application/json',
        dataType : 'json',
        data : js_data
    }).done(function(result) {
        //console.log(result)
        //if(result.done == true) {
        //    savedText.textContent = "Saved graph successfully!"
        //    savedText.style.color = "green";
        //    savedText.style.display = "block";
        //    setTimeout(function() { 
        //        savedText.textContent = "Saving graph...";
        //        savedText.style.color = "black";
        //        savedText.style.display = "none";
        //
        //    } ,2000)
        //}
    })
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
        let bb = relations[i].xywh != "None";

        let selectHTML = `<select onchange="changeWeight(this, '${t}', '${p}', '${ti}')">
                            <option value="Strong" ${w === 'Strong' ? 'selected' : ''}>Strong</option>
                            <option value="Weak" ${w === 'Weak' ? 'selected' : ''}>Weak</option>
                          </select>`;
        
        let relToVisualize = `<tr index="${i}" ><td>${t}</td><td>${p}</td><td>${selectHTML}</td>` +
            `<td>${ti.split(":").filter(elem => elem != "00").join(":")}</td>` +
            `<td>` +
                `<div style="display:flex;">` +
                (bb ? 
                    `<button style="margin:auto" class="icon-button expand visual-effect" onclick="toggleBoundingBox(this)" title="show this bounding box">` +
                        `<i class="fa-solid fa-expand" aria-hidden="true"></i>` +
                    `</button>` +
                    `<button class="btn btn-primary" onclick="afterEditBoundingBox(this)" title="edit this bounding box">Edit</button>`
                : 
                    `<button class="btn btn-primary visual-effect" onclick="afterAddBoundingBox(this)" title="create a bounding box for this concept">Add</button>`
                ) +
                `</div>` +
            `</td>`+
            `<td><button `+
                `class="icon-button trash" ` +
                `style="font-size:20" `+ 
                `onclick="deleteRelation(this,'${t}','${p}','${w}','${ti.split(":").filter(elem => elem != "00").join(":")}')"`+
                `title="double click to delete relation between the two concepts">` +
            `<i class="fa-solid fa-trash"></i></button></td></tr>`;

        relationTable.innerHTML += relToVisualize;
    }
}

/* Function to update the weight */
function changeWeight(selectElement, target, prerequisite, time) {
    let newWeight = selectElement.value;

    // Find the relation in the relations array and update its weight
    for (let i in relations) {
        if (relations[i].target === target && relations[i].prerequisite === prerequisite && relations[i].time === time) {
            relations[i].weight = newWeight;
            break;
        }
    }

    // Optionally, you can re-render the table to reflect the updated values
    printRelations();
    uploadManuGraphOnDB()
}


function printDefinitions(){

    let definitionTable = document.getElementById("definitionsTable")

    definitionTable.innerHTML = ""

    for(let i in definitions){

        let c = definitions[i].concept
        let s = definitions[i].start
        let e = definitions[i].end
        let t = definitions[i].description_type

        let relToVisualize = "<tr><td>"+ c +"</td><td>"+ s.split(":").filter(elem => elem != "00").join(":") + "</td><td>"+ e.split(":").filter(elem => elem != "00").join(":") +"</td><td>"+ t +"</td>"+
            "<td><button index='"+i+"' class=\"icon-button play-definition visual-effect\" " +
                "onclick=\"playExplanation(this,'"+s+"','"+e+"','#transcript','.sentence-marker')\" " +
                "title=\"play this annotation\">" +
            "<i class=\"fa-solid fa-circle-play\" aria-hidden=\"true\"></i></button></td>" +

            "<td><button class=\"btn btn-primary btn-addrelation btn-dodgerblue visual-effect\" " +
                "onclick=\"editConceptAnnotation(this,'"+c+"','"+s+"','"+e+"','"+t+"')\" " +
                "title=\"Edit this annotation\">Edit" +
            "</button></td>" +
            
            "<td><button class=\"icon-button trash\" " +
                "onclick=\"deleteDefinition(this,'"+c+"','"+s+"','"+e+"')\"" +
                "title=\"double click to delete concept description\">" +
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