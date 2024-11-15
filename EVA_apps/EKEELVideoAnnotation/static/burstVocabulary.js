let network;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//$(document).on("click", ".concept", function (e) {
//    
//  let conceptElements =  document.getElementsByClassName("concept");
//
//  // reset classes for the elements
//  for(let el of conceptElements) {
//    el.className = "concept";
//  }
//
//  var target = e.currentTarget;
//  var selectedConcept = target.getAttribute("concept")
//    .split(" ")
//    .sort((a, b) => a.split("_").length - b.split("_").length)
//    .reverse()[0];
//  var selectedConceptText = selectedConcept.replaceAll("_", " ");
//
//  if (document.getElementById("transcript-selected-concept").innerHTML == selectedConceptText) {
//    document.getElementById("transcript-selected-concept").innerHTML = "";
//    document.getElementById("transcript-selected-concept-synonym").innerHTML = "--";
//    return
//  }
//  
//  document.getElementById("transcript-selected-concept").innerHTML = selectedConceptText;
//
//  let syns = $conceptVocabulary[selectedConceptText] || [];
//  let synsText = syns.join(", ");
//
//  document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText || "--";
//
//  $("[concept~='" + " " + selectedConcept + " " + "']").get().forEach(function(element) { element.classList.add("selected-concept-text") });
//  syns.forEach(function(syn) { $("[concept~='" + " " + syn.replaceAll(" ","_") + " " + "']").get().forEach(function(element) { element.classList.add("selected-synonym-text")}) })
//});

$(document).on("click", ".concept-row", function (e) {

  // ignore clicks on the trash
  if (e.target.classList.contains("fa-trash"))
    return

  let conceptElements = $(document.getElementsByClassName("concept"));

  conceptElements.each(function() { this.classList = ["concept"]})

  var target = e.currentTarget;
  let conceptText = target.innerText.split(":")[0]
  let selectedConcept = conceptText.replaceAll(" ","_")

  document.getElementById("transcript-selected-concept").innerHTML = conceptText;

  
  let syns = $conceptVocabulary[conceptText] || [];
  let synsText = syns.join(", ");

  document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText;

  conceptElements.each(function() { 
    let concepts = this.getAttribute("concept")
    if (concepts.includes(" " + selectedConcept + " "))
      this.classList.add("selected-concept-text");
    else {
      for (let syn of syns) 
        if (concepts.includes(" " + syn.replaceAll(" ","_") + " "))
          this.classList.add("selected-synonym-text") 
    }
  });

  // Find all occurrences of the selected concept or synonyms
  let occurrences_text = $("#transcript .selected-concept-text").get();
  if (occurrences_text.length == 0)
    return
  
  conceptWords = conceptText.split(" ");
  obj = []
  occurrences = []
  for(let occurrence of occurrences_text) {
    if (occurrence.getAttribute("lemma") == conceptWords[conceptWords.length-1] || occurrence.innerText == conceptWords[conceptWords.length-1]){
      obj.push(occurrence);
      occurrences.push(obj);
      obj = []
    } else
      obj.push(occurrence)
  }

  let occurrences_syn = $("#transcript .selected-synonym-text");
  obj = [];
  syns = syns.map(syn => syn.replaceAll(" ","_"));

  for(let occurrence of occurrences_syn) {
    for(let syn of syns){
      if (occurrence.getAttribute("concept").includes(" " + syn + " ")) {
        syn = syn.split("_")
        if(syn[syn.length-1] == occurrence.getAttribute("lemma")){
          obj.push(occurrence);
          occurrences.push(obj);
          obj = [];
        } else
          obj.push(occurrence);
      }
    }
  }

  if (occurrences.length == 0)
    return

  let focusIndex = -1;
  for (let i in occurrences){
    if ($(occurrences[i][0]).is("[onfocus=true]"))
      focusIndex = parseInt(i)
    $(occurrences[i][0]).attr("onfocus",false)
  }
  $(occurrences[(focusIndex+1) % occurrences.length][0]).attr("onfocus",true)
      
  // Scroll the second nearest element into view
  let scrollToElem = occurrences[(focusIndex+1) % occurrences.length][0]
  
  scrollToElem.scrollIntoView({ behavior: "smooth", block: "center" });

});


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

async function showMsg(id, color, timer) {
  let element = document.getElementById(id)
  let bgColor = "#0000001a"
  switch (color) {
    case "red":
      bgColor = "#FF00001a"
      break
    case "orange":
      bgColor = "#FFA5001a"
      break
    case "dodgerblue":
      bgColor = "#1E90FF1a"
      break
    case "green":
      bgColor = "#0080001a"
    default:
      break
  }
  element.parentElement.style.backgroundColor = bgColor;
  element.style.color = color;
  element.style.borderColor = color;
  sleep(timer || 2000).then(() => {
    $(element).parent().fadeOut("slow")
  });
}


/* highlight a concept in a div with id div_id */
function selectConcept(conceptWords, firstWordLemma) {
  
  let words = conceptWords.split(" ")
  let firstWord = words[0]
  let conceptOccurencesText = [];
  let elements = $("#transcript span[lemma]").filter(function() {
    let this_query = $(this)
    return this_query.text() == firstWord || this_query.text() == firstWordLemma || this_query.attr("lemma") == firstWord || this_query.attr("lemma") == firstWordLemma;
  })
  if(words.length == 1) {
    elements.each((_,conceptElem) => {
          let currentConcept = conceptElem.getAttribute("concept") || " "; // Get existing concept or a space string
          if (!currentConcept.includes(" " + words[0]+" ")) {
            currentConcept = currentConcept + words[0] + " ";
            conceptElem.setAttribute("concept", currentConcept); // Update concept attribute
          }
          conceptElem.classList.add("concept");
          conceptOccurencesText.push(conceptElem.innerText)
        });
  } else {

    elements.each(function () {

      let allSpan = [this]
      let currentSpan = this
      let isConcept = true
      let num_words_tol = 6 // number of words of tolerance to skip when looking for a concept 
      // constrain: terms must have concordance on genre and number
      // (concept = "poligono concavo", words in text "il poligono e' sempre e solo concavo" )

      for(let j=1; j<words.length; j++){

        let nextSpan =  $(currentSpan).nextAll('span:first')
        let nextWord = []

        if(nextSpan[0] !== undefined){

          nextWord = [$(nextSpan[0]).attr("lemma"), $(nextSpan[0]).text()]
          //nextWord = nextSpan[0].attributes[0].nodeValue
          currentSpan = nextSpan[0]

        }else{

          //controllo che le altre parole non siano nella riga successiva
          //prendo riga successiva
          let nextRow =  $(currentSpan).parent().nextAll('p:first')
          
          //prendo la prima parola
            if(nextRow !== undefined){
                currentSpan = nextRow.find("span")[0]
                if(currentSpan !== undefined)
                  nextWord = [$(currentSpan).attr("lemma"), $(currentSpan).text()]  
                  //nextWord = currentSpan.attributes[0].nodeValue
            }
        }
        if (nextWord.includes(words[j])) {
          allSpan.push(currentSpan)
          num_words_tol = 6
        } else if(num_words_tol > 0) {
          // if a word is part of the concept but not the right one, this is not the same concept
          if (words.includes(nextWord[0]) || words.includes(nextWord[1])) {
            isConcept = false
            break
          }
          num_words_tol--;
          j--;
        } else {
          isConcept = false
          break
        }
      }

      if(isConcept){
        //for (let i in allSpan)
        //  allSpan[i].classList.replace("concept","sub-concept");
        
        //$(allSpan).each((_,span) => span.classList.add("concept"))
        occurrence = ""
        $(allSpan).each((_, span) => {
          let currentConcept = span.getAttribute("concept") || " "; // Get existing concept or empty string
          if (!currentConcept.includes(" " + words.join("_") + " ")) {
            let updatedConcept = currentConcept + words.join("_") + " "; // Append new words
            span.setAttribute("concept", updatedConcept); // Update concept attribute
          }
          span.classList.add("concept");
          occurrence += span.innerText + " "
        });
        conceptOccurencesText.push(occurrence.trim());
      }
    })
  }
  return conceptOccurencesText;
}


function addSubtitles(){

  let transcriptDiv = document.getElementById("transcript");

  for (let x in $captions){

    transcriptDiv.innerHTML +=
        '<p class="sentence-marker" style="cursor:default;" data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
        $lemmatizedSubs[x].text + '</p>';
  }

  for(let i in $concepts)
    selectConcept($concepts[i],"")
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
    document.getElementById("conceptVocabularyContentBurst").innerHTML = ""

    //let synonyms = [["run","go"],["orbit","eye socket"]];

    let vocabulary = sortVocabulary(inputVocabulary);

    for(let c in vocabulary) {

      //c = c.replaceAll("'","&apos;")
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
      row += `<button class="icon-button trash " onclick="deleteConcept(this,`+c+`)"><i class="fa-solid fa-trash"></i></button>`
      if(synonymsX.length > 0)
        row += "<ul id='synonyms_"+c+"' class=\" m-synonym-text\"><li>"+ synonymsX +"</li></ul>"
    
      row += "</div>"

      document.getElementById("conceptVocabularyContentBurst").innerHTML += row
    }
}

function confirmConceptDeleteBurst(button) {
  $("#confirmDeleteConceptBox").remove()

  $("<div></div>", {
      class: 'box',
      id: "confirmDeleteConceptBox",
      css: {
          position: 'absolute',
          top: '50%',
          left: '130%',
          width: '260px',
          height: 'auto',
          backgroundColor: 'white',
          border: '2px solid gray',
          borderRadius: '10px',
          transform: 'translate(-50%, -50%)',
          display: 'none',
          padding: '1em',
          textAlign: 'center',
          zIndex: '1'
      }
  }).appendTo($(button).closest(".modal-content"))
  
  const box = $("#confirmDeleteConceptBox")

  // Add confirmation text
  let title = $(`<div>
                    <h5>Confirm delete?</h5>
                    <span>Navigate also with arrow keys and select with ENTER</span>
                 </div>`).css({
    color: '#333',
    width: '250px'
  }).appendTo(box);
  
  $('<hr>').css("margin-bottom","3em").appendTo(title);

  // Create button container for symmetry
  const buttonsContainer = $("<div></div>").css("margin-top","4em").appendTo(title);

  // Add 'No' button
  $("<button class='btn btn-primary btn-addrelation btn-dodgerblue'>No</button>")
    .css({
      position: 'absolute',
      bottom: '1em',
      left: '5%'
    })
    .on("click", function() {
      $("#confirmDeleteConceptBox").fadeOut(150, function() {
        $('body').css('overflow', 'auto'); // Ripristina lo scrolling
        $(this).remove()
      });
      $(document).off("keydown.navigate")
      $(button).removeClass("active").blur();
    })
    .appendTo(buttonsContainer);

  // Add 'Yes' button
  $("<button class='btn btn-primary btn-addrelation delete'>Yes</button>")
    .css({
      position: 'absolute',
      bottom: '1em',
      left: '55%'
    })
    .on("click", function() {

      $("#confirmDeleteConceptBox").fadeOut(150, function() {
        $('body').css('overflow', 'auto'); // Ripristina lo scrolling
        $(this).remove()
      });
      $(document).off("keydown.navigate")
      
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
      //if(concept.split(" ").length > 1){
      //    concept = concept.replaceAll(" ", "_")
      //    $("[lemma=" + concept + "]").contents().unwrap()
      //}
    
    
      let underlinedConcept = concept.replaceAll(" ","_");
      let elementsToRemove = $("[concept~=" + $.escapeSelector(underlinedConcept) + "]");
      elementsToRemove.removeClass("selected-concept-text");
      for(let wtd of synonymsToDel) {
        $("[concept~=" + $.escapeSelector(wtd.replaceAll(" ", "_")) + "]").removeClass("selected-synonym-text");
      }
      elementsToRemove.each((_, element) => { 
          element.setAttribute("concept", element.getAttribute("concept").replace(underlinedConcept,""));
          if (element.getAttribute("concept").trim().length == 0)
            element.classList.remove("concept");
      })
    
      document.getElementById("transcript-selected-concept").innerHTML = "--";
      document.getElementById("transcript-selected-concept-synonym").innerHTML = "--";
      showVocabularyBurst($conceptVocabulary);

    }).appendTo(buttonsContainer);

  $(document).on('keydown.navigate', function(event) {
    const yesButton = $(".btn:contains('Yes')");  // Select the button with text "Yes"
    const noButton = $(".btn:contains('No')");    // Select the button with text "No"

    // Check which key was pressed
    switch(event.key) {
      case 'ArrowRight':
          yesButton.focus();  // Focus the "Yes" button on left arrow
          break;
      case 'ArrowLeft':
          noButton.focus();   // Focus the "No" button on right arrow
          break;
      case 'Enter':
          // If "Yes" is focused, click it; if "No" is focused, click it
          if (yesButton.is(':focus')) {
              yesButton.click();
          } else if (noButton.is(':focus')) {
              noButton.click();
          }
          break;
    }
  });

  // Show the box
  box.css({opacity: 0, display: 'flex'}).animate({
    opacity: 1
  }, 200)
  $(".btn:contains('No')").focus();
  //$('body').css('overflow', 'hidden');
}

function deleteConcept(button,concept) {

  $(".icon-button.trash.active").removeClass("active")
  $(button).addClass("active");
  confirmConceptDeleteBurst(button);
  setTimeout(function() {
      $(button).removeClass("active").blur();
  }, 3000);
}


function addConcept(){

  let concept = document.getElementById("newConcept").value.replaceAll("  "," ").trim()

  if(concept === "") {
    document.getElementById("errorConcept").innerText ="empty field !"
    showMsg("errorConcept", "red")
    return
  }

  let conceptLemmas = []
  if (concept.split(" ").length == 1 && $allLemmas.includes(concept)){
    conceptLemmas.push(concept);
  } else {
    let conceptWords = concept.split(" ")
    conceptWords.forEach(word => conceptLemmas.push($allWordsLemmas[word]))
  }
  if (conceptLemmas.some(item => item === undefined)) {
    document.getElementById("errorConcept").innerText ="some words are not present in the text !"
    showMsg("errorConcept", "red")
    return
  }
  
  let foundOccurrences = [];
  conceptLemmas[0].forEach(function(firstLemma) {
    foundOccurrences = [...foundOccurrences, ...selectConcept(concept, firstLemma)];
  });
  if(!foundOccurrences.length){
    document.getElementById("errorConcept").innerText ="this sequence of words has not been found in transcript !"
    showMsg("errorConcept", "red")
    return
  }
  let dots = ""
  let sendingLemmaNotification = setInterval(function() {
    dots = dots.length < 5 ? dots+"." : '';
    $("#errorConcept").css({color: "dodgerblue", borderColor:"dodgerblue"})
                      .text("Validating lemma"+dots)
                      .parent()
                      .css("background-color","#1E90FF1a")
                      .show()              
  }, 200)

  let js_data = {
    "lang": $language,
    "video_id": $video_id,
    "concept": {
      "term": concept,
      "variants": foundOccurrences,
      "frequency": foundOccurrences.length,
    }
  }

  $.ajax({
      url: '/annotator/lemmatize_term',
      type : 'post',
      contentType: 'application/json',
      dataType : 'json',
      data : JSON.stringify(js_data)
  }).done(function(result) {
    clearInterval(sendingLemmaNotification)
    let conceptLemma = result.lemmatized_term
    if(conceptLemma == ""){
      document.getElementById("errorConcept").innerText ="error in backend lemmatization process !"
      showMsg("errorConcept", "red")
      return
    }
    if($concepts.includes(conceptLemma)) {
      document.getElementById("errorConcept").innerText ="the concept is already present !"
      showMsg("errorConcept", "orange")
      return
    }
    $concepts.push(conceptLemma)
    $conceptVocabulary[conceptLemma]=[];
    $concepts.sort()
    // If lemma has changed 
    if (conceptLemma != concept)
      $(`.concept[concept~='${$.escapeSelector(concept.replaceAll(" ","_"))}']`).each(function (){
        this.setAttribute("concept", this.getAttribute("concept").replace(" "+concept.replaceAll(" ","_")+" ", " "+conceptLemma.replaceAll(" ","_")+" "))
      })
    showVocabulary($conceptVocabulary)
    //console.log($concepts)
    //console.log("--------------------")
    // $('#conceptsModal').modal('hide')
    document.getElementById("newConcept").value = ""
    document.getElementById("errorConcept").innerText = "Concept added successfully!"
    showMsg("errorConcept", "green", 4000)
    uploadManuGraphOnDB()
  })
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
      printDescriptions(result.definitions,true);
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
    printDescriptions(result.definitions,false)
}


function printDescriptions(definitions, update){
  console.log("***** EKEEL - Video Annotation: burstVocabulary.js::printDescriptions() ******");
    if(update) {
      document.getElementById("defsTable").innerHTML = ""
    }
    let definitionTable = document.getElementById("defsTable")

    definitionTable.innerHTML = ""

    for(let i in definitions){
        console.log(definitions[i])
        let c = definitions[i].concept
        let s = definitions[i].start
        let s_text = secondsToTimeShorter(timeToSeconds(s))
        let e = definitions[i].end
        let e_text = secondsToTimeShorter(timeToSeconds(e))
        let t = definitions[i].description_type

        let descToVisualize = "<tr><td>"+ c +"</td><td>"+ s_text + "</td><td>"+ e_text +"</td><td>"+ t +"</td>"+
            "<td><button class=\"icon-button \" " +
                "onclick=\"playDescription("+hmsToSeconds(s)+")\">" +
            "<i class=\"fa fa-play\"></i></button></td></tr>"

        definitionTable.innerHTML += descToVisualize

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

function playDescription(start){
    player.currentTime(start);
    player.play()
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    //var target = $(e.target).attr("href")
    //console.log(e.target)
    if(e.target.getAttribute("href") == "#add-concept")
      document.getElementById("newConcept").value = ""
    else if(e.target.getAttribute("href") == "#add-synonyms") {
      document.getElementById("synonymSet").value = ""
    } else if(e.target.getAttribute("href") == "#concepts") {
      document.getElementById("filter-vocabulary").value = ""
      filterVocabulary("")
    }
});


// Create and add Synonym sets (vocabualary)
function selectSynonymSet(){
  
  $synonymList=[];

  //console.log("---")

  let wordOfSynonymSet = document.getElementById("selectSynonymSet").value
  // var synonymSet = "run, move"
  //console.log("synonymSetString")
  //console.log(synonymSetString)

  if(wordOfSynonymSet === "") {
    document.getElementById("printMessageSynonymSet").innerHTML ="empty field !"
    document.getElementById("synonymSet").value = ""
    showMsg("printMessageSynonymSet", "red")
    return
  }
  document.getElementById("synonymSet").value = "";
  let lemma = wordOfSynonymSet;
  if(!$concepts.some((concept) => concept.text == lemma)) {
    document.getElementById("printMessageSynonymSet").innerHTML ="the word is not a concept !"
    showMsg("printMessageSynonymSet", "red")
    $synonymList = [];
    return
  }

  let listOfSynonymsOfLemma = $conceptVocabulary[lemma];
  let synonymSetText = lemma;
  for (let i=0; i<listOfSynonymsOfLemma.length; i++) {
    synonymSetText += ", " + listOfSynonymsOfLemma[i];
  }
  $synonymList = [lemma];
  for (let i=0; i<listOfSynonymsOfLemma.length; i++) {
    $synonymList.push(listOfSynonymsOfLemma[i]);
  }
  document.getElementById("synonymSet").value = synonymSetText;
  document.getElementById("selectSynonymSet").value = "";
}


// Create and add Synonym sets (vocabualary)
function addSynonym(){

  let newSynonym = document.getElementById("synonymWord").value
  

  if (newSynonym === "") { // empty
    document.getElementById("printMessageSynonymAdd").innerText ="empty field !"
    showMsg("printMessageSynonymAdd", "red")
    return
  }

  if($synonymList.length === 0) { // not selected synset
    document.getElementById("printMessageSynonymAdd").innerText ="select a synonym set !"
    showMsg("printMessageSynonymAdd", "red")
    return
  }

  if($synonymList.includes(newSynonym)) {  // already present
    document.getElementById("printMessageSynonymAdd").innerText ="the word typed is already present in the synonym set !"
    showMsg("printMessageSynonymAdd", "orange")
    return
  }
  let lemma = newSynonym;
  
  if (!$concepts.some((concept) => concept.text == lemma)){ // not a concept
      document.getElementById("printMessageSynonymAdd").innerText ="the word typed is not a concept !"
      showMsg("printMessageSynonymAdd", "red")
      return
  }

  
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

  showVocabulary($conceptVocabulary);
  uploadManuGraphOnDB()

  document.getElementById("selectSynonymSet").value = document.getElementById("synonymSet").value.split(",")[0];
  selectSynonymSet()
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("printMessageSynonymAdd").innerText = "word successfully added to the synonyms set !"
  showMsg("printMessageSynonymAdd", "green")
}


function removeSynonym(){

  let synonymToRemove = document.getElementById("synonymWord").value
  

  if (synonymToRemove === "") {
    document.getElementById("printMessageSynonymAdd").innerText ="empty field !"
    showMsg("printMessageSynonymAdd", "red")
    return
  }

  if($synonymList.length === 0) {
    document.getElementById("printMessageSynonymAdd").innerText ="select a synonym set !"
    showMsg("printMessageSynonymAdd", "red")
    return
  }

  let lemma = synonymToRemove;
  if (!$concepts.some((concept) => concept.text == lemma)){ // not a concept
    document.getElementById("printMessageSynonymAdd").innerText ="the word typed is not a concept !"
    showMsg("printMessageSynonymAdd", "red")
    return
  }
  if(!$synonymList.includes(lemma)) {  // not a synonym
    document.getElementById("printMessageSynonymAdd").innerText ="the word typed is not in the selected synonym set !"
    showMsg("printMessageSynonymAdd", "orange")
    return
  }


  $conceptVocabulary[lemma] = []; 

  for (let word of $synonymList) {
    if(word !== lemma) {
      $conceptVocabulary[word] = $conceptVocabulary[word].filter(item => item !== lemma);
    }
  }

  showVocabulary($conceptVocabulary);
  uploadManuGraphOnDB()
  
  document.getElementById("selectSynonymSet").value = $synonymList[0]
  selectSynonymSet()
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("printMessageSynonymAdd").innerText = "word successfully removed from the synonyms set"
  showMsg("printMessageSynonymAdd", "green")
}