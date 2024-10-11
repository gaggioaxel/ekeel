let definingSynonyms = []

$(function() {

  $(".draggable").closest(".modal-content").draggable({
    handle: ".rectangle",  // Only the rectangle is draggable
    containment: "#conceptsModal", // Keeps the dragging inside the window
  });

  $(".draggable").on("mousedown", function() {
    // Set the cursor to "grabbing" when the mouse is pressed down
    $(this).css("cursor", "grabbing");
  });
  $(".draggable").mouseup(function() {
    // Set the cursor to "grabbing" only if dragging starts
    $(this).css("cursor", "grab");
  });
});

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

function filterVocabulary(filterText) {

    let vocabulary = $conceptVocabulary
    let newVocabulary = {}

    if(filterText === "") {
      newVocabulary = vocabulary
      showVocabulary(newVocabulary)
    }
    else if(filterText !== "") {
      for(let concept in vocabulary) {
        if(concept.includes(filterText.toString())) {
          newVocabulary[concept] = vocabulary[concept]
        }
      }
      showVocabulary(newVocabulary)
    }
}

function showVocabulary(inputVocabulary) {

  document.getElementById("newConcept").value = ""
  document.getElementById("errorConcept").style.display = "none"

  video.pause()

  document.getElementById("conceptVocabularyContent").innerHTML = ""

  let vocabulary = sortVocabulary(inputVocabulary);

  for(let c in vocabulary) {

    c_in_text = c.replaceAll("'","’")
    let conceptX = c.replaceAll("_"," ")
    let synonymsX = ""

    for(let i=0; i<vocabulary[c].length; i++) {

      console.log(vocabulary[c][i])
      let syn = vocabulary[c][i].replaceAll("_"," ")
      synonymsX = synonymsX + syn
      if(i < vocabulary[c].length -1) {
        synonymsX +=  ", "
      }
    }

    let href = "sub" + c_in_text
    let row ='<div class=\" list-group-item list-group-item-action concept-row toRemove\"> ' +
        '<a href=\"#'+href+'\" data-toggle=\"collapse\" aria-expanded=\"false\" id="menu_'+c_in_text+'" >'

    row += '<p id="concept_'+c_in_text+'" class=\" m-concept-text\">'+ conceptX +': </p>'
    row += '<button class="icon-button trash-concept" onclick="deleteConcept(this,'+"'"+c_in_text+"'"+')"><i class="fa fa-trash"></i></button>'
    if(synonymsX.length > 0)
      row += '<ul id="synonyms_'+c_in_text+'" class=\" m-synonym-text\"><li>'+ synonymsX +'</li></ul>'
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row
  }
}

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
          this.classList.add("selected-synonyms-text") 
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
    if (occurrence.getAttribute("lemma") == conceptWords[conceptWords.length-1]){
      obj.push(occurrence);
      occurrences.push(obj);
      obj = []
    } else
      obj.push(occurrence)
  }

  let occurrences_syn = $("#transcript .selected-synonyms-text");
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


  let focusIndex = -1;
  for (let i in occurrences){
    if ($(occurrences[i][0]).is("[onfocus=true]"))
      focusIndex = parseInt(i)
    $(occurrences[i][0]).attr("onfocus",false)
  }
  $(occurrences[(focusIndex+1) % occurrences.length][0]).attr("onfocus",true)
      
  // Scroll the second nearest element into view
  occurrences[(focusIndex+1) % occurrences.length][0].scrollIntoView({
    behavior: 'smooth',
    block: 'center' // Align in the middle of the view
  });

});



// Add concept manually to the list of concepts (vocabulary)
function addConcept(){

  let concept = document.getElementById("newConcept").value.toLowerCase()

  if(concept === "") {
    document.getElementById("errorConcept").innerHTML ="empty field !"
    showMsg("errorConcept", "red")
    return
  }

  let conceptLemmas = []
  if ($allLemmas.includes(concept)){
    conceptLemmas.push(concept);
  } else {
    let conceptWords = concept.split(" ")
    conceptWords.forEach(word => conceptLemmas.push($allWordsLemmas[word]))
  }
  if (conceptLemmas.some(item => item === undefined)) {
    document.getElementById("errorConcept").innerHTML ="some words are not present in the text !"
    showMsg("errorConcept", "red")
    return
  }
  conceptLemmas = conceptLemmas.join(" ")
  if($concepts.includes(conceptLemmas)) {
    document.getElementById("errorConcept").innerHTML ="the concept is already present !"
    showMsg("errorConcept", "orange")
    return
  }
  foundAny = highlightConcept(conceptLemmas, "transcript");
  if(!foundAny){
    document.getElementById("errorConcept").innerHTML ="this sequence of words has not been found in transcript !"
    showMsg("errorConcept", "red")
    return
  }
  highlightConcept(conceptLemmas, "transcript-in-description");
  highlightConcept(conceptLemmas, "transcript-in-relation")
  $concepts.push(conceptLemmas)
  $conceptVocabulary[conceptLemmas]=[];
  $concepts.sort()
  showVocabulary($conceptVocabulary)
  //console.log($concepts)
  //console.log("--------------------")
  // $('#conceptsModal').modal('hide')
  document.getElementById("newConcept").value = ""
  document.getElementById("errorConcept").innerHTML = "word successfully added to the concepts"
  showMsg("errorConcept", "green")
  uploadManuGraphOnDB()
}


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
    return
  }
  document.getElementById("errorSynonymSet").style.display = "none"
  document.getElementById("synonymSet").innerHTML = "";
  let lemma = wordOfSynonymSet;
  //let lemmas = []
  //conceptWords.forEach(word => lemmas.push($allWordsLemmas[word] ? $allWordsLemmas[word] : $allLemmas.contains(word)))
  //if (lemmas.some(item => item === undefined)) {
  //  document.getElementById("errorSynonymSet").innerHTML ="some words are not present in the text !"
  //  document.getElementById("synonymSet").style.display = "none"
  //  showMsg("errorSynonymSet", "red")
  //  $synonymList = [];
  //  return
  //}
  //lemma = lemmas.join(" ")
  if(!$concepts.includes(lemma)) {
    document.getElementById("errorSynonymSet").innerHTML ="the word is not a concept !"
    document.getElementById("synonymSet").style.display = "none"
    showMsg("errorSynonymSet", "red")
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
  document.getElementById("synonymSet").innerHTML = synonymSetText;
  document.getElementById("synonymSet").style.display = "block"
  document.getElementById("selectSynonymSet").value = "";
}


// Create and add Synonym sets (vocabualary)
function addSynonym(){

  let newSynonym = document.getElementById("synonymWord").value
  
  document.getElementById("errorNewSynonym").style.display = "none"
  document.getElementById("errorRemoveSynonym").style.display = "none"

  if (newSynonym === "") {
    document.getElementById("errorNewSynonym").innerHTML ="empty field !"
    showMsg("errorNewSynonym", "red")
    return
  }

  if($synonymList.length === 0) {
    document.getElementById("errorNewSynonym").innerHTML ="select a synonym set !"
    showMsg("errorNewSynonym", "red")
    return
  }

  //let conceptWords = newSynonym.split(" ")
  //let lemmas = []
  //conceptWords.forEach(word => lemmas.push($allWordsLemmas[word]))
  //if (lemmas.some(item => item === undefined)) {
  //  document.getElementById("errorConcept").innerHTML ="some words are not present in the text !"
  //  showMsg("errorConcept", "red")
  //  return
  //}

  let lemma = newSynonym;
  if($synonymList.includes(lemma)) {  // already present
    document.getElementById("errorNewSynonym").innerHTML ="the word typed is already present in the synonym set !"
    showMsg("errorNewSynonym", "orange")
    return
  }
  
  if (!$concepts.includes(lemma)){ // not a concept
      document.getElementById("errorNewSynonym").innerHTML ="the word typed is not a concept !"
      showMsg("errorNewSynonym", "red")
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
  //console.log("synonyms")
  //console.log($synonyms);
  $synonymList = [];
  uploadManuGraphOnDB()
  document.getElementById("synonymSet").innerHTML = "";
  document.getElementById("synonymSet").style.display = "none"
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("errorNewSynonym").innerHTML = "word successfully added to the synonyms set"
  showMsg("errorNewSynonym", "green")
}


function removeSynonym(){

  let synonymToRemove = document.getElementById("synonymWord").value
  
  document.getElementById("errorNewSynonym").style.display = "none"
  document.getElementById("errorRemoveSynonym").style.display = "none"

  if (synonymToRemove === "") {
    document.getElementById("errorRemoveSynonym").innerHTML ="empty field !"
    showMsg("errorRemoveSynonym", "red")
    return
  }

  if($synonymList.length === 0) {
    document.getElementById("errorRemoveSynonym").innerHTML ="select a synonym set !"
    showMsg("errorRemoveSynonym", "red")
    return
  }

  let lemma = synonymToRemove;
  if (!$concepts.includes(lemma)){ // not a concept
    document.getElementById("errorRemoveSynonym").innerHTML ="the word typed is not a concept !"
    showMsg("errorRemoveSynonym", "red")
    return
  }
  if(!$synonymList.includes(lemma)) {  // not a synonym
    document.getElementById("errorRemoveSynonym").innerHTML ="the word typed is not in the selected synonym set !"
    showMsg("errorRemoveSynonym", "orange")
    return
  }

  document.getElementById("errorRemoveSynonym").style.display = "none"
  
  $conceptVocabulary[lemma] = []; 

  for (let word of $synonymList) {
    if(word !== lemma) {
      $conceptVocabulary[word] = $conceptVocabulary[word].filter(item => item !== lemma);
    }
  }

  showVocabulary($conceptVocabulary);
  //console.log("synonyms")
  //console.log($synonyms);
  $synonymList = [];
  uploadManuGraphOnDB()
  document.getElementById("synonymSet").innerHTML = "";
  document.getElementById("synonymSet").style.display = "none"
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("errorRemoveSynonym").innerHTML = "word successfully removed from the synonyms set"
  showMsg("errorRemoveSynonym", "green")
}


function deleteConcept(button,concept) {

  console.log(concept)
  //concept = concept.replaceAll(" ’ ","'")

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
  
  const conceptIndx = $concepts.indexOf(concept)
  if (conceptIndx > -1){
    $concepts.splice(conceptIndx,1)
  }  

  //rimuovo relazioni e definizioni del concetto
  let relToRemove = []
  for(let i in relations){
      if(relations[i].target == concept || relations[i].prerequisite == concept)
          relToRemove.push(i)
  }

  for (let i = relToRemove.length -1; i >= 0; i--)
      relations.splice(relToRemove[i],1);

  //ristampo le relazioni, nel caso ne avessi eliminata qualcuna
  if(relToRemove.length > 0)
      printRelations()

  let defToRemove = []
  for(let i in definitions){
      if(definitions[i].concept == concept )
          defToRemove.push(i)
  }

  for (let i = defToRemove.length -1; i >= 0; i--)
      definitions.splice(defToRemove[i],1);

  // remove the concept from the concept field and unset the concept class if the field is empty
  // (i.e. the lemmas are not anymore part of any concept)
  let underlinedConcept = concept.replaceAll(" ","_");
  let elementsToRemove = $("[concept~=" + underlinedConcept + "]");
  elementsToRemove.removeClass("selected-concept-text");
  for(let wtd of synonymsToDel) {
    $("[concept~=" + wtd.replaceAll(" ", "_") + "]").removeClass("selected-synonyms-text");
  }
  elementsToRemove.each((_, element) => { 
      element.setAttribute("concept", element.getAttribute("concept").replace(underlinedConcept,""));
      if (element.getAttribute("concept").trim().length == 0)
        element.classList.remove("concept");
  })
  
  document.getElementById("transcript-selected-concept").innerHTML = "--";
  document.getElementById("transcript-selected-concept-synonym").innerHTML = "--";

  //showVocabulary($conceptVocabulary);

  //rimuovo il div a lato
  if(document.getElementById(concept+"Defined") != null)
      document.getElementById(concept+"Defined").remove()

  uploadManuGraphOnDB()
}

let concepts_spanned = {}
let max_spans = 10
for (let i=1; i<= max_spans; i++)
  concepts_spanned[i] = []

/* highlight a concept in a div with id div_id */
function highlightConcept(concept, div_id) {

  let words = concept.split(" ")
  let foundAny = false; 

  if(words.length == 1) {
      $("#"+div_id+" [lemma='" + words[0]+ "']").each((_,conceptElem) => {
          let currentConcept = conceptElem.getAttribute("concept") || " "; // Get existing concept or a space string
          if (!currentConcept.includes(" " + words[0]+" ")) {
            currentConcept = currentConcept + words[0] + " ";
            conceptElem.setAttribute("concept", currentConcept); // Update concept attribute
          }
          conceptElem.classList.add("concept");
          foundAny = true
        });
  } else {

    $("#"+div_id+" [lemma='" + words[0] + "']").each(function () {

      let allSpan = [this]
      let currentSpan = this
      let isConcept = true
      let num_words_tol = 1 // number of words of tolerance to skip when looking for a concept 
      // (concept = "poligono concavo", words in text "il poligono e' sempre e solo concavo" )

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
        if (nextWord == words[j]) {
          allSpan.push(currentSpan)
          num_words_tol = 1
        } else if(num_words_tol > 0) {
          // if a word is part of the concept but not the right one, this is not the same concept
          if (words.includes(nextWord)) {
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
        $(allSpan).each((_, span) => {
          let currentConcept = span.getAttribute("concept") || " "; // Get existing concept or empty string
          if (!currentConcept.includes(" " + words.join("_") + " ")) {
            let updatedConcept = currentConcept + words.join("_") + " "; // Append new words
            span.setAttribute("concept", updatedConcept); // Update concept attribute
          }
          span.classList.add("concept");
          foundAny = true
        });
      }
    })

    

//    $("#"+div_id+" [lemma='" + words[0] + "']").each(function () {
//
//      let allSpan = [this]
//      let currentSpan = this
//      let isConcept = false
//      let num_words_tol = max_spans // number of words of tolerance to skip when looking for a concept 
//      // (concept = "poligono concavo", words in text "il poligono e' sempre e solo concavo" )
//      let num_skips = 0
//
//      for(let j=1; j<words.length; j++){
//
//        let nextSpan =  $(currentSpan).nextAll('span:first')
//        let nextWord
//
//        if(nextSpan[0] !== undefined){
//
//          nextWord = nextSpan[0].attributes[0].nodeValue
//          currentSpan = nextSpan[0]
//
//        }else{
//
//          //controllo che le altre parole non siano nella riga successiva
//          //prendo riga successiva
//          let nextRow =  $(currentSpan).parent().nextAll('p:first')
//          
//          //prendo la prima parola
//            if(nextRow !== undefined){
//                currentSpan = nextRow.find("span")[0]
//                if(currentSpan !== undefined)
//                    nextWord = currentSpan.attributes[0].nodeValue
//            }
//        }
//        if (nextWord == words[j]) {
//          if(num_words_tol < max_spans) {
//            isConcept = true
//            num_skips = num_skips > max_spans-num_words_tol ? num_skips : max_spans-num_words_tol
//          }
//          num_words_tol = max_spans
//        } else if(num_words_tol > 0) {
//          // if a word is part of the concept but not the right one, this is not the same concept
//          if (words.includes(nextWord)) {
//            isConcept = false
//            break
//          }
//          num_words_tol--;
//          j--;
//        } else {
//          isConcept = false
//          break
//        }
//        allSpan.push(currentSpan)
//      }
//      if(isConcept && div_id=="transcript") {
//        concepts_spanned[num_skips].push({
//          "concept_lemmatized": concept, 
//          "lemmas_segment":allSpan.map((elem) => elem.getAttribute("lemma")).join(" "),
//          "words_segment":allSpan.map((elem) => elem.innerText.trim()).join(" ")
//        })
//      }
//      // to copy results call on devtools: JSON.stringify(concepts_spanned,null, 4) and copy its content
//    })
//    concepts_spanned["transcript"] = $captions.map(elem => elem.text).join(" ")
//    concepts_spanned["all_concepts"] = $concepts
  }
  return foundAny;
}


function toggleAnnotationStatus(){

  const checkbox = document.querySelector(".switch input");
  isCompleted = checkbox.checked;
  uploadManuGraphOnDB();

}