let network;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




function sortVocabulary(dictionary) {

  var orderedDict = {}
  var keys = Object.keys(dictionary);
  var i, len = keys.length;

  keys.sort();

  for (i = 0; i < len; i++) {
    k = keys[i];
    orderedDict[k] = dictionary[k];
  }

  return orderedDict;
}

async function showMsg(id, color) {
  document.getElementById(id).style.color = color;
  document.getElementById(id).style.borderColor = color;
  document.getElementById(id).style.display = "block"
  sleep(2000).then(() => {
    document.getElementById(id).style.display = "none"
  });
}

/* highlight a concept in a div with id div_id */
function highlightConcept(concept, div_id){

  let words = concept.split(" ")

  if(words.length == 1)
       $("#"+div_id+" [lemma='" + words[0]+ "']").addClass("concept");

  else{

    $("#"+div_id+" [lemma='" + words[0] + "']").each(function () {

      let allSpan = [this]
      let currentSpan = this
      let isConcept = true

      for(let j=1; j<words.length; j++){

        let nextSpan =  $(currentSpan).nextAll('span:first')
        let nextWord

        if(nextSpan[0] !== undefined){

          nextWord = nextSpan[0].attributes[0].nodeValue
          currentSpan = nextSpan[0]

        }else{

          //controllo che le altre parole non siano nella riga successiva
          //prendo riga successiva
          let nextRow =  $(currentSpan).parent().nextAll('p:first')

          //prendo la prima parola
            if(nextRow !== undefined){
                currentSpan = nextRow.find("span")[0]
                if(currentSpan !== undefined)
                    nextWord = currentSpan.attributes[0].nodeValue
            }

        }

        if(nextWord !== words[j]){
            isConcept = false
            break
          }

        allSpan.push(currentSpan)
      }


      if(isConcept){

        //for(let s=0; s<allSpan.length -1 ; s++)
          //allSpan[s].style.marginRight = "4px"//.innerHTML += " "


        $(allSpan).wrapAll("<span class='concept' lemma='"+ concept.replaceAll(" ", "_") +"'>")
      }
    })
  }

  let conceptElements =  document.getElementsByClassName("concept");

  for(let el of conceptElements) {
    if(el.parentElement.classList.contains("concept")) {
      el.className = "old-concept";
    }
  }
}

function addSubtitles(){

  let transcriptDiv = document.getElementById("transcript");

  for (let x in $captions){

    transcriptDiv.innerHTML +=
        '<p class="youtube-marker" data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
        $lemmatizedSubs[x].text + '</p>';
  }

  $(document).on("click", ".concept", function (e) {

    let conceptElements =  document.getElementsByClassName("concept");

    // reset classes for the elements
    for(let el of conceptElements) {
      el.className = "concept";
    }

    var target = e.currentTarget;
    var selectedWord = target.getAttribute('lemma').replaceAll("_"," ");
    document.getElementById("transcript-selected-concept").innerHTML = selectedWord;

    let syns = $conceptVocabulary[selectedWord];
    let synsText = "";

    for(let i=0; i<syns.length; i++) {
      if (i===0) {
        synsText = syns[i];
      }
      else {
        synsText += ", " + syns[i];
      }
    }

    document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText;

    for(let el of conceptElements) {
      if(el.getAttribute('lemma').replaceAll("_"," ") === selectedWord) {
          el.className += " " + "selected-concept-text";
      }
      else if(syns.includes(el.getAttribute('lemma').replaceAll("_"," "))) {
          el.className += " " + "selected-synonyms-text";
      }
    }

    //console.log(target.getAttribute('lemma'));
  });

  for(let i in $concepts)
    highlightConcept($concepts[i], "transcript")
}

function filterVocabulary(filterText) {

  let vocabulary = $conceptVocabulary
  let newVocabulary = {}

  if(filterText === "") {
    newVocabulary = vocabulary

    showVocabularyBurst(newVocabulary)
  }
  else if(filterText !== "") {
    for(let concept in vocabulary) {
      if(concept.includes(filterText.toString())) {
        newVocabulary[concept] = vocabulary[concept]
      }
    }

    showVocabularyBurst(newVocabulary)
  }
}

function showVocabularyBurst(inputVocabulary){

    document.getElementById("newConcept").value = ""
    document.getElementById("errorConcept").style.display = "none"
    document.getElementById("conceptVocabularyContentBurst").innerHTML = ""

    //let synonyms = [["run","go"],["orbit","eye socket"]];

    let vocabulary = sortVocabulary(inputVocabulary);

    for(let c in vocabulary) {

      c = c.replaceAll("'","&apos;")
      let conceptX = c.replaceAll("_"," ")
      let synonymsX = ""

      for(let i=0; i<vocabulary[c].length; i++) {

        let syn = vocabulary[c][i].replaceAll("_"," ")
        synonymsX = synonymsX + syn
        if(i < vocabulary[c].length -1) {
          synonymsX +=  ", "
        }
      }

      let href = "sub" + c
      let row ="<div class=\" list-group-item list-group-item-action concept-row toRemove\"> " +
          "<a href=\"#"+href+"\" data-toggle=\"collapse\" aria-expanded=\"false\" id='menu_"+c+"' >"

      row += "<p id='concept_"+c+"' class=\" m-concept-text\">"+ conceptX +": </p>"
      row += '<button class="icon-button trash-concept" onclick="deleteConcept(this,'+'"'+c+'"'+')"><i class="fa fa-trash"></i></button>'
      if(synonymsX.length > 0)
        row += "<ul id='synonyms_"+c+"' class=\" m-synonym-text\"><li>"+ synonymsX +"</li></ul>"
    
      row += "</div>"

      document.getElementById("conceptVocabularyContentBurst").innerHTML += row
    }
}


function deleteConcept(button,concept) {

    //rimuovo riga della tabella
    $(button).closest('div').slideUp(function() {
        $(this).remove();
    });

    let synonymsToDel = $conceptVocabulary[concept];
    //cancello concetto e i sinonimi
    delete $conceptVocabulary[concept];
    
    for (let word in $conceptVocabulary) {
      if(word !== concept) {
        $conceptVocabulary[word] = $conceptVocabulary[word].filter(item => item !== concept);
      }
    }
    
    for(let i in $concepts){
        if ( $concepts[i] === concept) {
            $concepts.splice(i, 1);
            break
        }
    }    

    //se il concetto è composto da più parole
    if(concept.split(" ").length > 1){
        concept = concept.replaceAll(" ", "_")
        $("[lemma=" + concept + "]").contents().unwrap()
    }

    $("[lemma=" + concept + "]").removeClass("concept");
    $("[lemma=" + concept + "]").removeClass("selected-concept-text");
    for(let wtd of synonymsToDel) {
      $("[lemma=" + wtd.replaceAll(" ", "_") + "]").removeClass("selected-synonyms-text");
    }
    document.getElementById("transcript-selected-concept").innerHTML = "--";
    document.getElementById("transcript-selected-concept-synonym").innerHTML = "--";

    let oldConceptElements =  document.getElementsByClassName("old-concept");

    for(let el of oldConceptElements) {
      if(concept.replaceAll(" ","_").split("_").includes(el.getAttribute('lemma').replaceAll(" ","_"))) {
        el.className = "concept";
      }
    }

    showVocabularyBurst($conceptVocabulary);
}

function addConcept(){

    let concept = document.getElementById("newConcept").value

    if(concept === "") {
      document.getElementById("errorConcept").innerHTML ="empty field !"
      showMsg("errorConcept", "red")
    }
    else if(!$concepts.includes(concept)) {

        fetch('/annotator/lemmatize_word/' + concept + '?lang=' + $language).then(function (response) {

            response.json().then(function (data) {

                let lemma = data.lemma
                console.log(lemma)
                let present = true

                let words = lemma.split(" ")
                for(let i = 0; i<words.length; i++)
                    if(!$allLemmas.includes(words[i])) {
                        present = false
                        break
                    }

                if (!present){
                    document.getElementById("errorConcept").innerHTML ="the word is not present in the text !"
                    showMsg("errorConcept", "red")
                }

                else if (!$concepts.includes(lemma)){
                    $concepts.push(lemma)
                    $conceptVocabulary[lemma]=[];
                    highlightConcept(lemma, "transcript")
                    $concepts.sort()
                    showVocabularyBurst($conceptVocabulary)
                    console.log($concepts)
                    console.log("--------------------")
                   // $('#conceptsModal').modal('hide')
                    document.getElementById("newConcept").value = ""
                    document.getElementById("errorConcept").innerHTML = "word successfully added to the concepts"
                    showMsg("errorConcept", "green")
                }

            })
        })
    }else{
        document.getElementById("errorConcept").innerHTML ="the word is already a concept !"
        showMsg("errorConcept", "orange")
    }
}

// get conceptVocabulary with synonyms
async function getConceptVocabulary(){

  //loading()

  let data = {
      "concepts":$concepts,
  }

  var js_data = JSON.stringify(data);

  return new Promise(function(resolve, reject) {

    $.ajax({
        url: '/annotator/get_concept_vocabulary',
        type : 'post',
        contentType: 'application/json',
        dataType : 'json',
        data : js_data,
        success: function(result) {
          //console.log(result)
          data = result["conceptVocabulary"];
          resolve(data)
        },
        error: function(err) {
          reject("err") 
        }
    })
  })
}

async function launchBurstAnalysis(burstType){

  console.log("launchBurstAnalysis in burstVocabulary.js")

  // Activate to use advanced synonym burst
  const SYN_BURST = $burstSynonym; 

  let data = {
      "id": $video_id,
      "concepts":$concepts,
      "conceptVocabulary":$conceptVocabulary,
      "syn_burst":SYN_BURST,
      "burst_type": burstType
  }

  console.log(data);
  var js_data = JSON.stringify(data);
  
  result = await $.ajax({
      url: '/annotator/burst_launch',
      type : 'post',
      contentType: 'application/json',
      dataType : 'json',
      data : js_data
  }).done(function(result) {
    showResults(result)
    $downloadableGraph = result.downloadable_jsonld_graph;
    $hasBeenRefined = false;
    $conceptMap = result.concept_map;
  })
  
  return result
}

function refineBurstWithVideoAnalysis() {
  console.log("***** EKEEL - Video Annotation: burstVocabulary.js::refineBurstWithVideoAnalysis() ******");
  var data = {
    "id": $video_id,
    "concepts": $concepts,
    "concept_map":$conceptMap,
    "conceptVocabulary":$conceptVocabulary,
    "definitions":$definitions
  } 

  function showRefinementLoading(){
    document.getElementById("results").style.display = "none";
    var loading_text_elem = document.getElementById("loadingText")
    loading_text_elem.textContent = "Refining results..."
    document.getElementById("loadingAutomatic").style.display = "block";
  }

  function hideRefinementLoading(prev_text) {
    document.getElementById("loadingText").textContent = prev_text;
    document.getElementById("loadingAutomatic").style.display = "none";
    document.getElementById("results").style.display = "block";
  }

  var js_data = JSON.stringify(data);
  
  var prev_text = document.getElementById("loadingText").textContent;
  showRefinementLoading();

  $.ajax({
    url: '/annotator/refinement',
    type : 'post',
    contentType: 'application/json',
    dataType : 'json',
    data: js_data
  }).done(function(result) {
      console.log(result);
      hideRefinementLoading(prev_text);
      printDefinitions(result.definitions,true);
      $hasBeenRefined = true;
      document.getElementById("refinement-button").style.display = "none";
      $downloadableGraph = result.downloadable_jsonld_graph
      $definitions = result.definitions;
  })
}





function showResults(result){
    console.log("***** EKEEL - Video Annotation: burstVocabulary.js::showResults() ******")
    document.getElementById("loadingAutomatic").style.display = "none"
    document.getElementById("results").style.display = "block"
    //document.getElementById("results").innerText += result

    let conceptsWithSynonyms = [];
    let relationsWithSynonyms = [];

    for(let word in $conceptVocabulary) {
        console.log(word)
        let node = [word];
        for(let synonym of $conceptVocabulary[word]) {
            console.log(synonym)
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
        console.log(node)

        conceptsWithSynonyms.push(nodeName);
        console.log(conceptsWithSynonyms)
    }

    let graphNodes = [...new Set(conceptsWithSynonyms)];
    console.log(graphNodes)

    let checkDuplicateArray = []

    for (let item of result.concept_map){
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

    network = showNetwork(graphNodes, relationsWithSynonyms, "network")
    
    let data_summary = result.data_summary

    let resultsToVisualize = " <div class=\"container\">\n" +
        "            <div class=\"table\">\n" +
        "              <table class=\"table table-responsive\">\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Video title</td>\n" +
        "                    <th class=\"col\">" + $title + "</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of concepts</td>\n" +
        "                    <th class=\"col\">" + data_summary.num_concepts+ "</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of extracted descriptions</td>\n" +
        "                    <th class=\"col\">" + data_summary.num_descriptions + "</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of definitions</td>\n" +
        "                    <th class=\"col\">" + data_summary.num_definitions + "</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of in depths</td>\n" +
        "                    <th class=\"col\">" + data_summary.num_depth+ "</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of extracted relations</td>\n" +
        "                    <th class=\"col\">"+ data_summary.num_rels +"</th>\n" +
        "                  </tr>\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of unique relations</td>\n" +
        "                    <th class=\"col\">"+ data_summary.num_unique +"</th>\n" +
        "                  </tr>\n" +
        "\n" +
        "                  <tr class=\"d-flex\">\n" +
        "                    <td class=\"col-3\">Number of transitive relations</td>\n" +
        "                    <th class=\"col\">"+ data_summary.num_transitives +"</th>\n" +
        "                  </tr>\n" +
        "              </table>\n" +
        "            </div>\n" +
        "        </div>"
            
            if(result.agreement != null) {
                
                resultsToVisualize += "<h5 class='titleLower' style='padding-left:15px;'> Comparison with " + result.agreement["name"] + "</h5>"+
                "    <div class=\"container\">\n" +
                "            <div class=\"table\">\n" +
                "              <table class=\"table table-responsive\">\n" +

                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">Agreement </td>\n" +
                "                    <th class=\"col\">" + result.agreement["K"] + "</th>\n" +
                "                  </tr>\n"+
                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">VEO similarity</td>\n" +
                "                    <th class=\"col\">" + result.agreement["VEO"] + "</th>\n" +
                "                  </tr>\n"+
                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">GED similarity </td>\n" +
                "                    <th class=\"col\">" + result.agreement["GED"] + "</th>\n" +
                "                  </tr>\n"+
                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">PageRank </td>\n" +
                "                    <th class=\"col\">" + result.agreement["pageRank"] + "</th>\n" +
                "                  </tr>\n"+
                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">LO </td>\n" +
                "                    <th class=\"col\">" + result.agreement["LO"] + "</th>\n" +
                "                  </tr>\n"+
                "                  <tr class=\"d-flex\">\n" +
                "                    <td class=\"col-3\">PN </td>\n" +
                "                    <th class=\"col\">" + result.agreement["PN"] + "</th>\n" +
                "                  </tr>\n"+
                "              </table>\n" +
                "            </div>\n" +
                "        </div>"
        }



    document.getElementById("data_summary").innerHTML = resultsToVisualize
    printDefinitions(result.definitions,false)
}


function printDefinitions(definitions, update){
  console.log("***** EKEEL - Video Annotation: burstVocabulary.js::printDefinitions() ******");
    if(update) {
      document.getElementById("defsTable").innerHTML = ""
    }
    let definitionTable = document.getElementById("defsTable")

    definitionTable.innerHTML = ""

    for(let i in definitions){
        console.log(definitions[i])
        let c = definitions[i].concept
        let s = definitions[i].start.split(".")[0]
        let e = definitions[i].end.split(".")[0]
        let t = definitions[i].description_type

        let relToVisualize = "<tr><td>"+ c +"</td><td>"+ s + "</td><td>"+ e +"</td><td>"+ t +"</td>"+
            "<td><button class=\"icon-button\" " +
                "onclick=\"playDefinition("+hmsToSeconds(s)+")\">" +
            "<i class=\"fa fa-play\"></i></button></td></tr>"

        definitionTable.innerHTML += relToVisualize

    }

}

//function downloadObjectAsJson(exportObj, exportName){
//  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj,null,2));
//  var downloadAnchorNode = document.createElement('a');
//  downloadAnchorNode.setAttribute("href",     dataStr);
//  downloadAnchorNode.setAttribute("download", exportName + ".json");
//  document.body.appendChild(downloadAnchorNode); // required for firefox
//  downloadAnchorNode.click();
//  downloadAnchorNode.remove();
//}

function DownloadBurstResultAsJson() {
  if($hasBeenRefined){
      namefile = "refined_graph"
  } else {
      namefile = "graph"
  }
  downloadObjectAsJson($downloadableGraph,namefile)
}

function saveBurstGraph(){
  console.log("***** EKEEL - Video Annotation: burstVocabulary.js::saveBurstGraph() ******");
  var data = {
    "id": $video_id,
    "concepts": $concepts,
    "conceptVocabulary":$conceptVocabulary
  } 

  console.log(data)

  var js_data = JSON.stringify(data);  

  console.log(js_data)

  $.ajax({
    url: '/annotator/save_burst_json',
    type : 'post',
    contentType: 'application/json',
    dataType : 'json',
    data: js_data
}).done(function(result) {
    console.log(result);
})     
}

function hmsToSeconds(time){
    let hms = time.split(":")

    return Number(hms[0])*60*60 + Number(hms[1])*60 + Number(hms[2])
}

function playDefinition(start){
    console.log(start)
    video.currentTime = start;
    video.play()
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href")
    console.log(target)
});


// Create and add Synonym sets (vocabualary)
function selectSynonymSet(){
    
    $synonymList=[];

    //console.log("---")

    let wordOfSynonymSet = document.getElementById("selectSynonymSet").value
    // var synonymSet = "run, move"
    //console.log("synonymSetString")
    //console.log(synonymSetString)

    document.getElementById("errorNewSynonym").style.display = "none"
    document.getElementById("errorRemoveSynonym").style.display = "none"

    if(wordOfSynonymSet === "") {
      document.getElementById("errorSynonymSet").innerHTML ="empty field !"
      document.getElementById("synonymSet").style.display = "none"
      showMsg("errorSynonymSet", "red")
    }
    else {

      document.getElementById("errorSynonymSet").style.display = "none"
      document.getElementById("synonymSet").innerHTML = "";

      fetch('/annotator/lemmatize_word/' + wordOfSynonymSet).then(function (response) {

        response.json().then(function (data) {

          let lemma = data.lemma
          //console.log("lemma")
          //console.log(lemma)

          let present = true

          if(!$concepts.includes(lemma)) {
              //console.log("concepts")
              //console.log($concepts) 
              present = false
          }

          if (!present) {
            
            document.getElementById("errorSynonymSet").innerHTML ="the word is not a concept !"
            document.getElementById("synonymSet").style.display = "none"
            showMsg("errorSynonymSet", "red")
            $synonymList = [];

          }
          else if (present) {
            
            let listOfSynonymsOfLemma = $conceptVocabulary[lemma];
            let synonymSetText = lemma;
            for (let i=0; i<listOfSynonymsOfLemma.length; i++) {
              synonymSetText += ", " + listOfSynonymsOfLemma[i];
            }
            $synonymList = [lemma];
            for (let i=0; i<listOfSynonymsOfLemma.length; i++) {
              $synonymList.push(listOfSynonymsOfLemma[i]);
            }
            document.getElementById("synonymSet").style.display = "block"
            document.getElementById("synonymSet").innerHTML = synonymSetText;
            document.getElementById("selectSynonymSet").value = "";
          }
          
        })
      })
    }
  }

  // Create and add Synonym sets (vocabualary)
  function addSynonym(){

    let newSynonym = document.getElementById("synonymWord").value
    
    document.getElementById("errorNewSynonym").style.display = "none"
    document.getElementById("errorRemoveSynonym").style.display = "none"

    if($synonymList.length === 0) {
      document.getElementById("errorNewSynonym").innerHTML ="select a synonym set !"
      showMsg("errorNewSynonym", "red")
    }
    else if (newSynonym === "") {
      document.getElementById("errorNewSynonym").innerHTML ="empty field !"
      showMsg("errorNewSynonym", "red")
    }
    else {

      document.getElementById("errorNewSynonym").style.display = "none"

      fetch('/annotator/lemmatize_word/' + newSynonym).then(function (response) {

        response.json().then(function (data) {

            let lemma = data.lemma
            //console.log(lemma)

            if($synonymList.includes(lemma)) {  // already present
              document.getElementById("errorNewSynonym").innerHTML ="the word typed is already present in the synonym set !"
              showMsg("errorNewSynonym", "orange")
            }
            else if (!$concepts.includes(lemma)){ // not a concept
                document.getElementById("errorNewSynonym").innerHTML ="the word typed is not a concept !"
                showMsg("errorNewSynonym", "red")
            }
            else {  // all good !
              //console.log("synonyms")
              //console.log($synonyms);

              for(let syn of $conceptVocabulary[lemma]) {
                for (let word of $synonymList) {
                  $conceptVocabulary[word].push(syn);          
                }
                for (let word of $synonymList) {
                  $conceptVocabulary[syn].push(word);
                }
              }

              for (let word of $synonymList) {
                $conceptVocabulary[word].push(lemma);          
              }
              for (let word of $synonymList) {
                $conceptVocabulary[lemma].push(word);
              }
              showVocabularyBurst($conceptVocabulary);
              //console.log("synonyms")
              //console.log($synonyms);
              $synonymList = [];
              document.getElementById("synonymSet").innerHTML = "";
              document.getElementById("synonymSet").style.display = "none"
              document.getElementById("selectSynonymSet").value = "";
              document.getElementById("synonymWord").value = "";
              document.getElementById("errorNewSynonym").innerHTML = "word successfully added to the synonyms set"
              showMsg("errorNewSynonym", "green")
            }

        })
      })
    }
  }

 
  function removeSynonym(){

    let synonymToRemove = document.getElementById("synonymWord").value
    
    document.getElementById("errorNewSynonym").style.display = "none"
    document.getElementById("errorRemoveSynonym").style.display = "none"

    if($synonymList.length === 0) {
      document.getElementById("errorRemoveSynonym").innerHTML ="select a synonym set !"
      showMsg("errorRemoveSynonym", "red")
    }
    else if (synonymToRemove === "") {
      document.getElementById("errorRemoveSynonym").innerHTML ="empty field !"
      showMsg("errorRemoveSynonym", "red")
    }
    else {

      document.getElementById("errorRemoveSynonym").style.display = "none"

      fetch('/annotator/lemmatize_word/' + synonymToRemove).then(function (response) {

        response.json().then(function (data) {

            let lemma = data.lemma
            console.log(lemma)

            if (!$concepts.includes(lemma)){ // not a concept
                document.getElementById("errorRemoveSynonym").innerHTML ="the word typed is not a concept !"
                showMsg("errorRemoveSynonym", "red")
            }
            else if(!$synonymList.includes(lemma)) {  // not a synonym
              document.getElementById("errorRemoveSynonym").innerHTML ="the word typed is not in the selected synonym set !"
              showMsg("errorRemoveSynonym", "orange")    
            }
            else if($synonymList.includes(lemma)) {  // present in the synonymset, to remove
              
              $conceptVocabulary[lemma] = []; 

              for (let word of $synonymList) {
                if(word !== lemma) {
                  $conceptVocabulary[word] = $conceptVocabulary[word].filter(item => item !== lemma);
                }
              }

              showVocabularyBurst($conceptVocabulary);
              //console.log("synonyms")
              //console.log($synonyms);
              $synonymList = [];
              document.getElementById("synonymSet").innerHTML = "";
              document.getElementById("synonymSet").style.display = "none"
              document.getElementById("selectSynonymSet").value = "";
              document.getElementById("synonymWord").value = "";
              document.getElementById("errorRemoveSynonym").innerHTML = "word successfully removed from the synonyms set"
              showMsg("errorRemoveSynonym", "green")
            }
            
        })
      })
    }
  }
