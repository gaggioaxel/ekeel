let targetSentID = null
let targetWordID = null

printRelations()
printDefinitions()

/*
* By clicking on a concept in the box below the video, it will automatically add the concept in the form.
* */
$(document).on('click','.clickableConcept',function(){

  if( document.getElementById("target").value == ""){

    let lemma = $(this).attr("lemma")

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
})

function addRelation(){

  let prereq = document.getElementById("prerequisite").value.toLowerCase();
  let weight = document.getElementById("weight").value.toLowerCase();
  weight = weight.charAt(0).toUpperCase() + weight.slice(1)
  let target = document.getElementById("target").value.toLowerCase();

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


  let start = video.currentTime

  //sentence ID e word ID nel conll
  let sentID;
  let wordID;

  if(targetSentID != null){
      sentID = targetSentID;
      wordID = targetWordID;
  }else{

      if (target.split(" ").length > 1){

          let t = $("#relationText [lemma='" + target.replaceAll(" ", "_")+ "'] [lemma='" + target.split(" ")[0]+ "']")

          sentID = t.attr("sent_id");
          wordID = t.attr("word_id");
      }else{
          sentID = $("#relationText [lemma='" + target+ "']").attr("sent_id");
          wordID = $("#relationText [lemma='" + target+ "']").attr("word_id");
      }


  }

  //nel caso il target non sia presente nella frase
  if(sentID == undefined){
      let currentSub = getCurrentSubtitle(start)
      sentID = getSentenceIDfromSub(currentSub)
      wordID = "None"
  }

  console.log(sentID)

  // se è stata aggiunta una box del concetto prendo le dimensioni in percentuale
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
     "time": secondsToTime(start),
     "prerequisite": prereq,
     "target": target,
     "weight": weight,
     "sent_id": sentID,
     "word_id": wordID,
     "xywh": xywh
   }
   relations.push(relToInsert)
   console.log(relations)

   printRelations()
   closeRelationDiv();

  targetSentID = null
  targetWordID = null
  uploadManuGraphOnDB()
}

function deleteRelation(button, target, prereq, weight, time) {

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



    for(let i=0; i<relations.length; i++){

        if(relations[i].target == target && relations[i].prerequisite == prereq && relations[i].weight == weight && relations[i].time == time){
            relations.splice(i,1)
            break
        }
    }

    uploadManuGraphOnDB()
    //console.log(relations)

}

function addDefinition(concept, start, end, startSentID, endSentID, description_type){

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
    uploadManuGraphOnDB()
    //console.log(definitions)
}

function deleteDescription(button, concept, start, end){

    let toDelete

    for(let i in definitions){

        if(concept == definitions[i].concept && start == definitions[i].start && end == definitions[i].end){
            toDelete = i
            break
        }

    }
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
function printRelations(){

    let relationTable = document.getElementById("relationsTable")

    relationTable.innerHTML = ""

    for(let i in relations){

        let p = relations[i].prerequisite
        let t = relations[i].target
        let w = relations[i].weight
        let ti = relations[i].time

        let relToVisualize = "<tr><td>"+ t +"</td><td>"+ p + "</td><td>"+ w +"</td><td>"+ ti +"</td>"+
            "<td><button class=\"icon-button\" " +
                "onclick=\"deleteRelation(this,'"+t+"','"+p+"','"+w+"','"+ti+"')\">" +
            "<i class=\"fa fa-trash\"></i></button></td></tr>"

        relationTable.innerHTML += relToVisualize

    }

}


function printDefinitions(){

    let definitionTable = document.getElementById("definitionsTable")

    definitionTable.innerHTML = ""

    for(let i in definitions){

        let c = definitions[i].concept
        let s = definitions[i].start
        let e = definitions[i].end
        let t = definitions[i].description_type

        let relToVisualize = "<tr><td>"+ c +"</td><td>"+ s + "</td><td>"+ e +"</td><td>"+ t +"</td>"+
            "<td><button style=\" margin-right: 40% \" class=\"icon-button\" " +
                "onclick=\"higlightExplanationInTranscript('"+i+"','"+s+"','"+e+"','.youtube-marker')\">" +
            "<i class=\"fa fa-magic\"></i></button></td>" +
            
            "<td><button class=\"icon-button\" " +
                "onclick=\"deleteDescription(this,'"+c+"','"+s+"','"+e+"')\">" +
            "<i class=\"fa fa-trash\"></i></button></td></tr>"

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