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

  player.pause()
  UpdateMarkers(player.currentTime())

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
    row += '<button class="icon-button trash" onclick="deleteConcept(this,'+"'"+c_in_text+"'"+')"><i class="fa-solid fa-trash"></i></button>'
    if(synonymsX.length > 0)
      row += '<ul id="synonyms_'+c_in_text+'" class=\" m-synonym-text\"><li>'+ synonymsX +'</li></ul>'
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row;
  }
}

function showVocabularyDiv(){
  
  state="concepts"
  clearAnnotatorVisualElements()
  //$("html, body").animate({ scrollTop: 0 }, "slow");
  $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");
  $("#conceptsModal").dimBackground({ darkness: .75, fadeInDuration: 600})
  $("input[name='askConfirmDeleteConcept']").prop("checked", !(getCookie("pref-skip-confirm-delete-concept") == "true"))

  document.getElementById("newConcept").value = ""
  document.getElementById("errorConcept").style.display = "none"

  player.pause()
  UpdateMarkers(player.currentTime())

  let vocabulary = sortVocabulary($conceptVocabulary);

  for(let c in vocabulary) {

    c_in_text = c.replaceAll("'","’")
    let conceptX = c.replaceAll("_"," ")
    let synonymsX = ""

    for(let i=0; i<vocabulary[c].length; i++) {

      //console.log(vocabulary[c][i])
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
    row += '<button class="icon-button trash" onclick="deleteConcept(this,'+"'"+c_in_text+"'"+')"><i class="fa-solid fa-trash"></i></button>'
    if(synonymsX.length > 0)
      row += '<ul id="synonyms_'+c_in_text+'" class=\" m-synonym-text\"><li>'+ synonymsX +'</li></ul>'
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row;
  }

  let transcriptElement = $('#transcript.transcript')

  // Store the original CSS values in an object
  originalTranscriptCSS = {
    position: transcriptElement.css('position'),
    right: transcriptElement.css('right'),
    top: transcriptElement.css('top'),
    width: transcriptElement.css('width'),
    minWidth: transcriptElement.css('min-width'),
    height: transcriptElement.css('height'),
    overflow: transcriptElement.css('overflow'),
    padding: transcriptElement.css('padding'),
    border: transcriptElement.css('border'),
    borderRadius: transcriptElement.css('border-radius')
  };

  // Apply CSS to position the cloned transcript to the right of the modal-content
  transcriptElement.css({
      'position': 'absolute',
      'right': '650px', // Adjust this value to control the distance from the modal
      'top': '-10vh',
      'width': '30vw',
      'min-width': '300px',
      'height': "70vh",
      'overflow': 'auto',
      'padding': '10px 20px 0px',
      'border': '1px solid rgba(0,0,0,.2)',
      'border-radius': '.3rem'
  });

  // Ensure modal-content is positioned relatively
  $('#conceptsModal').find('.modal-content')
                     .css('position', 'relative')
                     .append(transcriptElement.detach());

  $(document).on('keydown.dismiss', function(event) {
    if (event.key === 'Escape')
        closeVocabularyDiv();
  });

}

function closeVocabularyDiv(){
  $(document).off('keydown.dismiss')
  state="home"
  document.getElementById('filter-vocabulary').value = ''
  document.getElementById("conceptVocabularyContent").innerHTML = ''
  let detachedTranscript = $('#conceptsModal').find("#transcript.transcript").detach();

  // Re-append to #right-body .col.relations as the third child
  $('#right-body .col.relations').children().eq(2).after(detachedTranscript);
  detachedTranscript.css(originalTranscriptCSS)

  $("#conceptsModal").undim({ fadeOutDuration: 600 }).hide()
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
    if (occurrence.getAttribute("lemma") == conceptWords[conceptWords.length-1] || occurrence.innerText.trim() == conceptWords[conceptWords.length-1]){
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



// Add concept manually to the list of concepts (vocabulary)
function addConcept(){

  let concept = document.getElementById("newConcept").value

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

function removeConcept(button, concept){
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
    $("[concept~=" + wtd.replaceAll(" ", "_") + "]").removeClass("selected-synonym-text");
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

function confirmConceptDeletion(button, concept){

  $("#confirmDeleteConceptBox").remove()

  $("<div></div>", {
      class: 'box',
      id: "confirmDeleteConceptBox",
      css: {
          position: 'relative',
          top: '-50%',
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
      
      removeConcept(button,concept)

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
  // Check if the concept is part of relations or definitions
  const isInRelations = relations.some(
    (relation) => relation.prerequisite === concept || relation.target === concept
  );
  const isInDefinitions = definitions.some(
    (definition) => definition.concept === concept
  );

  // Show alert if concept cannot be deleted
  if (isInRelations || isInDefinitions) {
    if (!$("#cannotDeleteConceptAlert").is(":visible")) {
      $(".custom-modal").css("height","570px")
      $("#cannotDeleteConceptAlert").fadeIn(150).delay(4000).fadeOut(200, function(){
        $(".custom-modal").css("height","550px")
      });
    }
    return
  } 

  $(".icon-button.trash.active").removeClass("active")
  $(button).addClass("active");

  if(!$("input[name='askConfirmDeleteConcept']").is(":checked")){
    removeConcept(button, concept)
    $(".icon-button.trash.active").removeClass("active")
    return
  }
  confirmConceptDeletion(button, concept);  
}

/* highlight a concept in a div with id div_id */
function highlightConcept(concept, div_id) {

  let words = concept.split(" ")
  let foundAny = false; 
  let elements = $("#" + div_id + " [lemma='" + words[0] + "'], #" + div_id + " span[lemma]:contains('" + words[0] + "')")
  if(words.length == 1) {
    elements.each((_,conceptElem) => {
          let currentConcept = conceptElem.getAttribute("concept") || " "; // Get existing concept or a space string
          if (!currentConcept.includes(" " + words[0]+" ")) {
            currentConcept = currentConcept + words[0] + " ";
            conceptElem.setAttribute("concept", currentConcept); // Update concept attribute
          }
          conceptElem.classList.add("concept");
          foundAny = true
        });
  } else {

    elements.each(function () {

      let allSpan = [this]
      let currentSpan = this
      let isConcept = true
      let num_words_tol = 1 // number of words of tolerance to skip when looking for a concept 
      // (concept = "poligono concavo", words in text "il poligono e' sempre e solo concavo" )

      for(let j=1; j<words.length; j++){

        let nextSpan =  $(currentSpan).nextAll('span:first')
        let nextWord = []

        if(nextSpan[0] !== undefined){

          nextWord = [$(nextSpan[0]).attr("lemma"), $(nextSpan[0]).text().trim()]
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
                  nextWord = [$(nextSpan[0]).attr("lemma"), $(nextSpan[0]).text().trim()]  
                  //nextWord = currentSpan.attributes[0].nodeValue
            }
        }
        if (nextWord.includes(words[j])) {
          allSpan.push(currentSpan)
          num_words_tol = 1
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
  }
  return foundAny;
}


function toggleAnnotationStatus(){
  const checkbox = document.querySelector(".switch input");
  isCompleted = checkbox.checked;
  uploadManuGraphOnDB();

}

function toggleAskConfirmConceptDelete(){
  const wantConfirm = $("input[name='askConfirmDeleteConcept']").is(":checked")
  document.cookie = `pref-skip-confirm-delete-concept=${!wantConfirm}; path=/annotator;`;
}