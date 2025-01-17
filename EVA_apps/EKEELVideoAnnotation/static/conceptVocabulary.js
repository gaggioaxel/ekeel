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
  let parent = element.parentElement;
  parent.style.backgroundColor = bgColor;
  $(parent).fadeIn();
  element.style.color = color;
  element.style.borderColor = color;
  sleep(timer || 2000).then(() => {
    $(parent).fadeOut("slow")
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

  player.pause()
  UpdateMarkers(player.currentTime())

  document.getElementById("conceptVocabularyContent").innerHTML = ""

  let vocabulary = sortVocabulary(inputVocabulary);

  for(let c in vocabulary) {

    c_in_text = c
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
        `<a href=\"#${href}\" data-toggle=\"collapse\" aria-expanded=\"false\" id=\"menu_${c_in_text}\" >`

    row += `<p id=\"concept_${c_in_text}\" class=\" m-concept-text\">${conceptX}:</p>`
    row += `<button class="icon-button trash" onclick="deleteConcept(this,\`${c}\`)"><i class="fa-solid fa-trash"></i></button>`
    if(synonymsX.length > 0)
      row += `<ul id=\"synonyms_${c_in_text}\" class=\" m-synonym-text\"><li>${synonymsX}</li></ul>`
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row;
  }
}

document.querySelector("ul#myTab").addEventListener("click", function(event) {
    //TODO  
    switch(event.target.getAttribute("href")){
      case("#concepts"):
        document.getElementById("filter-vocabulary").value= "";
        setTimeout(function() { $("#filter-vocabulary").focus() }, 200);
        break
      case("#add-concept"):
        document.getElementById("newConcept").value = "";
        setTimeout(function() { $("#newConcept").focus() }, 200);
        break
      case("#add-synonyms"):
        document.getElementById("synonymSet").value = "--";
        $synonymList = [];
        document.getElementById("selectSynonymSet").value = ""
        setTimeout(function() { $("#selectSynonymSet").focus() }, 200);
        document.getElementById("synonymWord").value = ""
        break
    }
    // Add your specific logic here
});

function showVocabularyDiv(){
  state="concepts"
  $(document).off("keydown")
  player.pause()
  clearAnnotatorVisualElements()
  player.controls(false)
  //$("html, body").animate({ scrollTop: 0 }, "slow");
  $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");
  document.body.style.overflow = 'hidden';
  $("input[name='askConfirmDeleteConcept']").prop("checked", !(getCookie("pref-skip-confirm-delete-concept") == "true"))

  document.getElementById("newConcept").value = ""

  let vocabulary = sortVocabulary($conceptVocabulary);

  for(let c in vocabulary) {

    c_in_text = c
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
        `<a href=\"#${href}\" data-toggle=\"collapse\" aria-expanded=\"false\" id=\"menu_${c_in_text}\" >`

    row += `<p id=\"concept_${c_in_text}\" class=\" m-concept-text\">${conceptX}:</p>`
    row += '<button class=\"icon-button trash\" onclick=\"deleteConcept(this,\`'+c_in_text+'\`)\"><i class=\"fa-solid fa-trash\"></i></button>'
    if(synonymsX.length > 0)
      row += `<ul id=\"synonyms_${c_in_text}\" class=\" m-synonym-text\"><li>${synonymsX}</li></ul>`
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row;
  }

  let transcriptElement = $(document.getElementById("transcript"));

  $(".current-marker").removeClass("current-marker")
  transcriptElement.off("click")

  // Store the original CSS values in an object
  originalTranscriptCSS = {
    position: transcriptElement.css('position'),
    right: transcriptElement.css('right'),
    top: transcriptElement.css('top'),
    width: transcriptElement.css('width'),
    minWidth: transcriptElement.css('min-width'),
    height: transcriptElement.css('height'),
    maxHeight: transcriptElement.css('max-height'),
    overflow: transcriptElement.css('overflow'),
    padding: transcriptElement.css('padding'),
    border: transcriptElement.css('border'),
    borderRadius: transcriptElement.css('border-radius')
  };

  // Attach transcript to correct position
  transcriptElement.detach()
                   .appendTo($('#conceptsModal').find('.modal-content')
                                                .css('position', 'relative'))

  // Apply CSS to position the cloned transcript to the right of the modal-content
  transcriptElement.css({
    'position': 'absolute',
    'right': '110%', // Relative to the modal
    'top': '-10vh',
    'width': '30vw',
    'min-width': '300px',
    'height': "auto",
    'max-height': "70vh",
    'overflow': 'auto',
    'padding': '10px 20px 0px',
    'border': '1px solid rgba(0,0,0,.2)',
    'border-radius': '.3rem'
  });

  $(document).on('keydown', function(event) {
    if (event.key === 'Escape')
        closeVocabularyDiv();
    
    // If Enter is pressed while focusing on #newConcept, call addConcept
    if (event.key === 'Enter') {
      if ($(document.activeElement).is('#newConcept')) {
        event.preventDefault(); // Prevents any default action for Enter key (optional)
        addConcept();
      } else if($(document.activeElement).is('#selectSynonymSet')) {
        event.preventDefault();
        selectSynonymSet()
      }
    }
  });
  setTimeout(function() { $("#filter-vocabulary").focus() }, 800);
}

function closeVocabularyDiv(){
  $(document).off('keydown')
  state="home"
  document.body.style.overflow = 'auto';
  document.getElementById('filter-vocabulary').value = ''
  document.getElementById("conceptVocabularyContent").innerHTML = ''
  document.getElementById("synonymSet").value = "--"
  $synonymList = []

  const transcript = $('#conceptsModal').find("#transcript").detach();
  $('#right-body .col.relations').children().eq(2).after(transcript);
  transcript.css(originalTranscriptCSS);
  player.controls(true)
  attachUpdateTimeListenerOnTranscript()
  attachClickListenerOnConcepts()
  attachPlayerKeyEvents()
  setConceptSelectionElements("--")
}

/**
 * Handles the click event on a concept row in the UI.
 * Highlights the selected concept and its synonyms in the transcript,
 * updates the transcript selection display, and scrolls to the next occurrence
 * of the concept or synonym in the transcript.
 *
 * @param {Event} e - The click event triggered by the user interaction.
 * @returns {void}
 *
 * Workflow:
 * 1. **Ignore Trash Icon Clicks**:
 *    - If the user clicks on the trash icon (with class `fa-trash`), the function exits immediately.
 *
 * 2. **Deselect Previous Highlights**:
 *    - Finds all elements with the `concept` class that are currently highlighted (via `selected-concept-text` or `selected-synonym-text`) 
 *      and resets their classes to only `concept`.
 *
 * 3. **Identify Selected Concept**:
 *    - Retrieves the concept text from the clicked row, sanitizes it (replacing spaces with underscores), 
 *      and updates the transcript selection fields (`#transcript-selected-concept` and `#transcript-selected-concept-synonym`).
 *    - Fetches the synonyms of the selected concept from `$conceptVocabulary` and formats them as a comma-separated string for display.
 *
 * 4. **Highlight Concept and Synonyms**:
 *    - Iterates through all elements with the `concept` class and:
 *      - Adds the `selected-concept-text` class to elements that match the selected concept.
 *      - Adds the `selected-synonym-text` class to elements that match any synonym of the selected concept.
 *
 * 5. **Group Occurrences**:
 *    - Finds all occurrences of the selected concept (`.selected-concept-text`) and groups consecutive elements representing 
 *      multi-word concepts into arrays.
 *    - Similarly groups occurrences of synonyms (`.selected-synonym-text`), ensuring that multi-word synonyms are handled correctly.
 *
 * 6. **Handle Focus and Navigation**:
 *    - Determines the currently focused occurrence and removes its focus.
 *    - Advances to the next occurrence in the list (or wraps to the first occurrence if at the end).
 *    - Updates the focus attribute of the new occurrence.
 *
 * 7. **Scroll to Element**:
 *    - Smoothly scrolls the next focused occurrence into view, centering it in the viewport.
 *
 * @dependencies:
 * - Global variables:
 *   - `$conceptVocabulary`: Object storing concepts and their synonyms.
 * - Uses the following DOM elements:
 *   - `.concept-row`: Rows representing concepts in the UI.
 *   - `.concept`: Elements marked with the `concept` attribute.
 *   - `#transcript`: Container holding the transcript content.
 *   - `#transcript-selected-concept`: Displays the currently selected concept.
 *   - `#transcript-selected-concept-synonym`: Displays the synonyms of the selected concept.
 * - Assumes all concepts and synonyms are annotated in the DOM with a `concept` attribute.
 *
 * @example
 * // Triggered by clicking on a row with class `concept-row`.
 * $(".concept-row").trigger("click");
 */
$(document).on("click", ".concept-row", function (e) {

  // ignore clicks on the trash
  if (e.target.classList.contains("fa-trash"))
    return

  let conceptElements = $(document.getElementsByClassName("concept"));

  conceptElements.filter(".selected-concept-text, .selected-synonym-text").each(function() { this.classList = ["concept"]})

  var target = e.currentTarget;
  let conceptText = target.innerText.split(":")[0]
  let selectedConcept = conceptText.replaceAll(" ","_")

  document.getElementById("transcript-selected-concept").innerText = conceptText;

  
  let syns = $conceptVocabulary[conceptText] || [];
  let synsText = syns.join(", ");

  document.getElementById("transcript-selected-concept-synonym").innerText = synsText;

  conceptElements.each(function() { 
    let concepts = this.getAttribute("concept")
    if (concepts.includes(" " + selectedConcept + " ") || concepts.includes(" " + selectedConcept.toLowerCase() + " "))
      this.classList.add("selected-concept-text");
    else {
      for (let syn of syns) 
        if (concepts.includes(" " + syn.replaceAll(" ","_") + " ") || concepts.includes(" " + syn.replaceAll(" ","_").toLowerCase() + " "))
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
  for(let i in occurrences_text) {
    if(i % conceptWords.length == conceptWords.length-1) { 
      obj.push(occurrences_text[i]);
      occurrences.push(obj);
      obj = []
    } else
      obj.push(occurrences_text[i])
  }

  let occurrences_syn = $("#transcript .selected-synonym-text");
  obj = [];
  let synsUndescored = syns.map(syn => syn.replaceAll(" ","_"));

  for(let syn of synsUndescored){
    synWords = syn.split("_")
    let this_syn_occurrences = occurrences_syn.filter(`[concept~="${syn}"]`)
    for(let i in this_syn_occurrences.get()) {
      if(i % synWords.length == synWords.length-1) { 
        obj.push(this_syn_occurrences[i]);
        occurrences.push(obj);
        obj = []
      } else
        obj.push(this_syn_occurrences[i])
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
  if(focusIndex+1 == occurrences.length) {
    document.getElementById("transcript-selected-concept").innerText = "--";
    document.getElementById("transcript-selected-concept-synonym").innerText = "--"
    conceptElements.filter(".selected-concept-text, .selected-synonym-text").each(function() { this.classList = ["concept"]})
    return
  }
  $(occurrences[(focusIndex+1) % occurrences.length][0]).attr("onfocus",true)
  
      
  // Scroll the second nearest element into view
  let scrollToElem = occurrences[(focusIndex+1) % occurrences.length][0]
  
  scrollToElem.scrollIntoView({ behavior: "smooth", block: "center" });

});



// Add concept manually to the list of concepts (vocabulary)
function addConcept(){

  let concept = document.getElementById("newConcept").value.replaceAll("  "," ").trim()

  if(concept === "") {
    document.getElementById("errorConcept").innerText ="empty field !"
    showMsg("errorConcept", "red")
    return
  }

  let conceptLemmas = []
  // Allow both lemmas present in the text and the concept words 
  if (concept.split(" ").length == 1 && $allLemmas.includes(concept)){
    conceptLemmas.push([concept]);
  } else {
    let conceptWords = concept.split(" ")
    conceptWords.forEach(word => conceptLemmas.push($allWordsLemmas[word] || $allWordsLemmas[capitalize(word)]))
  }
  if(conceptLemmas.some(item => item === undefined)) {
    document.getElementById("errorConcept").innerText ="some words are not present in the text !"
    showMsg("errorConcept", "red")
    return
  }
  if($concepts.includes(concept)) {
    // debug purposes distinguish between words already present and lemmatized concept already present
    document.getElementById("errorConcept").innerText ="this concept is already present at word level !" 
    showMsg("errorConcept", "orange")
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
    "concept": concept
  }

  $.ajax({
      url: '/annotator/lemmatize_term',
      type : 'post',
      contentType: 'application/json',
      dataType : 'json',
      data : JSON.stringify(js_data)
  }).done(function(term) {
    clearInterval(sendingLemmaNotification)
    if(Object.keys(term).length === 0) {
      document.getElementById("errorConcept").innerText ="error in the lemmatization process !"
      showMsg("errorConcept", "red")
      return
    }
    let conceptLemma = selectConcept(term);
    if(!conceptLemma){
      document.getElementById("errorConcept").innerText ="this concept has not been found in transcript !"
      showMsg("errorConcept", "red")
      return
    }
    term.text = conceptLemma
    for (let concept of $concepts)
      if(concept == conceptLemma) {
        document.getElementById("errorConcept").innerText ="the concept is already present at lemmas level !"
        showMsg("errorConcept", "orange")
        return
      }
    $conceptsStructured.push(term)
    $concepts.push(conceptLemma)
    $conceptVocabulary[conceptLemma]=[];
    $concepts.sort()
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


// Create and add Synonym sets (vocabualary)
function selectSynonymSet(showMessage){
  
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
  if(!$concepts.some((concept) => concept == lemma )) {
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
  if(showMessage || showMessage === undefined){
    document.getElementById("printMessageSynonymSet").innerHTML ="a synonym set has been selected !"
    showMsg("printMessageSynonymSet", "green", 4000)
  }
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
  
  if (!$concepts.some((concept) => concept == lemma)){ // not a concept
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
  selectSynonymSet(false)
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("printMessageSynonymAdd").innerText = "word successfully added to the synonyms set !"
  showMsg("printMessageSynonymAdd", "green")
}

/**
 * Removes a synonym from the currently selected synonym set.
 * 
 * This function handles the removal of a specified synonym word from the selected 
 * synonym set in the global `$conceptVocabulary`. It validates the input, updates 
 * the vocabulary, and refreshes the user interface to reflect the change.
 * 
 * @returns {void}
 * 
 * Workflow:
 * 1. **Input Validation**:
 *    - Checks if the input field `#synonymWord` is empty. If so, displays an error 
 *      message ("empty field !") in the `#printMessageSynonymAdd` element and exits.
 *    - Checks if no synonym set is currently selected (`$synonymList` is empty). If so, 
 *      displays an error message ("select a synonym set !") and exits.
 *    - Verifies that the word entered is a concept. If not, displays an error 
 *      message ("the word typed is not a concept !") and exits.
 *    - Verifies that the word is part of the selected synonym set. If not, displays 
 *      an error message ("the word typed is not in the selected synonym set !") and exits.
 * 
 * 2. **Update Vocabulary**:
 *    - Clears all synonyms associated with the target word in `$conceptVocabulary`.
 *    - Removes the target word from the synonym lists of all other words in the synonym set.
 * 
 * 3. **Update UI**:
 *    - Calls `showVocabulary` to refresh the vocabulary view.
 *    - Updates the synonym set selection dropdown to default to the first synonym 
 *      in the updated list (if any).
 *    - Clears the input field `#synonymWord`.
 *    - Displays a success message ("word successfully removed from the synonyms set") 
 *      in `#printMessageSynonymAdd`.
 * 
 * 4. **Database Update**:
 *    - Calls `uploadManuGraphOnDB()` to persist the updated vocabulary data to the database.
 * 
 * @example
 * // Example usage:
 * removeSynonym();
 * 
 * @dependencies:
 * - Global variables:
 *   - `$conceptVocabulary`: Object storing concept vocabulary and their associated synonyms.
 *   - `$synonymList`: Array containing the currently selected synonym set.
 *   - `$concepts`: Array storing all concepts.
 * - Uses the following DOM elements:
 *   - `#synonymWord`: Input field for the synonym to remove.
 *   - `#printMessageSynonymAdd`: Element for displaying messages to the user.
 *   - `#selectSynonymSet`: Dropdown for selecting synonym sets.
 * - Calls external functions:
 *   - `showVocabulary`: Updates the displayed vocabulary.
 *   - `uploadManuGraphOnDB`: Saves updated vocabulary data to the database.
 *   - `selectSynonymSet`: Handles UI updates when a synonym set is selected.
 */
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
  if (!$concepts.some((concept) => concept == lemma)){ // not a concept
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
  selectSynonymSet(false)
  document.getElementById("selectSynonymSet").value = "";
  document.getElementById("synonymWord").value = "";
  document.getElementById("printMessageSynonymAdd").innerText = "word successfully removed from the synonyms set"
  showMsg("printMessageSynonymAdd", "green")
}

/**
 * Removes a concept and its related elements from the UI and internal data structures.
 * 
 * This function handles the deletion of a concept and its synonyms from the global 
 * `$conceptVocabulary`, `$concepts` array, and the DOM elements where the concept 
 * appears. It also updates the user interface to reflect the removal.
 * 
 * @param {HTMLElement} button 
 *        The button element that triggered the removal.
 * 
 * @param {string} concept 
 *        The concept to be removed, represented as a string.
 * 
 * Workflow:
 * 1. **Remove Row from Table**:
 *    - Slides up the closest container (div) of the button that triggered the action 
 *      and removes it from the DOM. #TODO removal works but animation does not work and can't figure out why  
 * 
 * 2. **Update Vocabulary**:
 *    - Deletes the concept and its synonyms from the `$conceptVocabulary`.
 *    - Removes the concept from the synonym lists of other concepts.
 *    - Calls `showVocabulary` to refresh the displayed vocabulary.
 * 
 * 3. **Update Concepts Array**:
 *    - Finds and removes the concept from the `$concepts` array.
 * 
 * 4. **Remove Concept Class and Attributes from Transcript**:
 *    - Identifies all elements in the transcript where the concept is tagged.
 *    - Removes the `concept` attribute and the `concept` class from these elements.
 *    - Ensures elements no longer associated with any concept have their `concept` 
 *      class removed.
 * 
 * 5. **Clear Selected Concept Fields**:
 *    - Updates the fields `#transcript-selected-concept` and `#transcript-selected-concept-synonym` 
 *      to show `--` (indicating no selected concept or synonym).
 * 
 * 6. **Remove Associated Definition Div**:
 *    - Deletes the sidebar div (if it exists) that displays the concept definition.
 * 
 * 7. **Database Update**:
 *    - Calls `uploadManuGraphOnDB()` to persist the updated concept data to the database.
 * 
 * @example
 * // Example usage:
 * removeConcept(document.querySelector('#deleteButton'), 'hardware resources');
 * 
 * @dependencies:
 * - Relies on global variables `$conceptVocabulary` (object storing concept vocabulary) 
 *   and `$concepts` (array storing all concepts).
 * - Uses jQuery for DOM manipulation and event handling.
 * - Calls external functions `showVocabulary` and `uploadManuGraphOnDB`.
 */
function removeConcept(button, concept){
  //rimuovo riga della tabella
  $(button).closest('div').slideUp("slow", function() {
    $(this).remove();
  });

  let synonymsToDel = $conceptVocabulary[concept];
  
  //cancello concetto e i sinonimi
  delete $conceptVocabulary[concept];
  for (let word in $conceptVocabulary)
    $conceptVocabulary[word] = $conceptVocabulary[word].filter(item => item !== concept);
  
  showVocabulary($conceptVocabulary)

  let conceptIndx = -1
  $($concepts).each((indx,conc) => { if(conc == concept || conc == concept.toLowerCase()) conceptIndx = indx; })
  if (conceptIndx > -1) $concepts.splice(conceptIndx,1)

  // remove the concept from the concept field and unset the concept class if the field is empty
  // (i.e. the lemmas are not anymore part of any concept)
  let underscoredConcept = concept.replaceAll(" ","_");
  let elementsToRemove = $("[concept~=" + $.escapeSelector(underscoredConcept) + "], [concept~=" + $.escapeSelector(underscoredConcept.toLowerCase())+ "]");
  elementsToRemove.removeClass("selected-concept-text");
  for(let wtd of synonymsToDel) {
    $("[concept~=" + $.escapeSelector(wtd.replaceAll(" ", "_")) + "]").removeClass("selected-synonym-text");
  }
  elementsToRemove.each((_, element) => { 
      element.setAttribute("concept", element.getAttribute("concept")
             .replace(" "+underscoredConcept+" ","")
             .replace(" "+underscoredConcept.toLowerCase()+" ",""));
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

/**
 * Displays a confirmation box for deleting a concept and handles user input.
 * 
 * This function dynamically creates a modal-like confirmation box near the specified button
 * to confirm whether the user wants to delete the selected concept. The confirmation box
 * contains "Yes" and "No" buttons, along with support for keyboard navigation using arrow keys
 * and selection using the ENTER key.
 * 
 * @param {HTMLElement} button 
 *        The button element that triggered the confirmation box.
 * 
 * @param {*} concept 
 *        The concept object to be deleted upon confirmation.
 * 
 * Workflow:
 * 1. Removes any existing confirmation box (`#confirmDeleteConceptBox`).
 * 2. Dynamically creates a new confirmation box with the following properties:
 *    - Styled with absolute positioning and CSS for alignment and appearance.
 *    - Contains a title with confirmation text and a note about keyboard navigation.
 *    - Includes two buttons: "Yes" to confirm deletion and "No" to cancel.
 * 3. Button functionality:
 *    - "No": Closes the confirmation box and restores normal UI behavior.
 *    - "Yes": Calls the `removeConcept` function to delete the concept and closes the box.
 * 4. Adds keyboard navigation:
 *    - Left Arrow (`ArrowLeft`): Focuses the "No" button.
 *    - Right Arrow (`ArrowRight`): Focuses the "Yes" button.
 *    - Enter (`Enter`): Triggers the focused button's click event.
 * 5. Fades in the confirmation box and sets the initial focus to the "No" button.
 * 6. Removes keyboard navigation and cleans up the box upon closure.
 * 
 * Dependencies:
 * - Uses jQuery for DOM manipulation and event handling.
 * - Relies on the external `removeConcept` function to handle concept deletion.
 * 
 * @example
 * // Example usage:
 * confirmConceptDelete(document.querySelector('#deleteButton'), conceptObject);
 */
function confirmConceptDelete(button, concept){

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
      $("#cannotDeleteConceptAlert").fadeIn(150).delay(3500).fadeOut(200)
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
  confirmConceptDelete(button, concept);
}

MAX_TOL_WORDS = 8

/**
 * Processes a given concept to identify and tag its occurrences in the transcript.
 * 
 * This function uses lemmatization data and other attributes of the concept to find matching words or 
 * phrases in the transcript. It handles single-word concepts as well as multi-word concepts, including
 * cases where the concept spans multiple spans of text or lines in the transcript. It also considers 
 * syntactic and grammatical features to ensure accurate tagging.
 * 
 * @param {*} concept 
 *        An object representing the concept to be processed. It contains the following properties:
 *        - `text` (String): The textual representation of the concept.
 *        - `lemmatization_data` (Object): Data related to lemmatization of the concept, including:
 *          - `tokens` (Array): An array of token objects, where each token has properties `word` and `lemma`.
 *          - `head_indx` (Number): The index of the head token in the `tokens` array.
 * 
 * @returns {String|null} 
 *          The identified lemma of the concept if a match is found; otherwise, `null`.
 * 
 * Workflow:
 * 1. Identify all elements in the transcript matching the first term of the concept using lemma or word comparisons.
 * 2. For single-word concepts:
 *    - Count occurrences of the word and prioritize the most frequent or grammatically appropriate match.
 * 3. For multi-word concepts:
 *    - Start from the head term and attempt to match subsequent words.
 *    - Handle cases where:
 *      - Words are split across spans.
 *      - Words are merged into a single token in the transcript.
 *    - Allow for a tolerance of unrelated words or punctuation within the concept.
 *    - Stop matching on encountering terminal punctuation (e.g., ".", "!", "?") or a verb.
 * 4. Tag matching spans with the identified concept using the "concept" attribute.
 * 5. If no exact match for the head term is found, fallback to the most frequent or closest match.
 */
function selectConcept(concept) {
  
  let concept_words = concept.lemmatization_data.tokens
  let firstTerm = concept_words[0]
  
  let elements = $("#transcript span[lemma]").filter(function() {
    let this_query = $(this)
    let this_text = this_query.text()
    let this_lemma = this_query.attr("lemma")
    return  capitalize(this_text) == capitalize(firstTerm.word) ||
            capitalize(this_text) == capitalize(firstTerm.lemma) || 
            capitalize(this_lemma) == capitalize(firstTerm.word) || 
            capitalize(this_lemma) == capitalize(firstTerm.lemma) ||
            capitalize(this_text) == capitalize(concept.text.split(" ")[0]);
  })
  if(!elements.length)
    return null

  // Concept made of a single word
  // It must be the head
  if(concept_words.length == 1) {
    let occurrences = {};
    elements.each(function() {
      let textContent = $(this).text();
      occurrences[textContent] = (occurrences[textContent] || 0) + 1;
    });
    occurrences = Object.entries(occurrences)
                        .sort((a, b) => b[1] - a[1]) // Sort by count (second element in each entry)
                        .map(([key]) => key);
    
    let conceptLemma = occurrences[0]
    if (elements.get().some(elem => elem.innerText == firstTerm.lemma))
      conceptLemma = firstTerm.lemma
    // else try selecting
    else
      for(element of elements)
        if(element.getAttribute("num")=="s") {
          conceptLemma = element.innerText
          if(element.getAttribute("gen")=="m")
            break
        }

    elements.each((_,conceptElem) => {
      let currentConcept = conceptElem.getAttribute("concept") || " "; // Get existing concept or a space string
      if (!currentConcept.includes(" " + conceptLemma +" ")) {
        currentConcept = currentConcept + conceptLemma + " ";
        conceptElem.setAttribute("concept", currentConcept); // Update concept attribute
      }
      conceptElem.classList.add("concept");
    });
    return conceptLemma
  } 
    
  // Concept made of multiple words
  let occurrences = [];
  let allSpansPerConcept = []

  // Take the head term
  let head_indx = concept.lemmatization_data.head_indx
  let head_lemma = concept.lemmatization_data.tokens[head_indx].lemma
  let conceptLemma = null


  elements.each(function () {

    let foundSingularTerm = false
    let allSpan = [this]
    if (head_indx == 0 && this.getAttribute("num") == "s")
      foundSingularTerm = true
    let currentSpan = this
    let isConcept = true
    let num_words_tol = MAX_TOL_WORDS // number of words of tolerance to skip when looking for a concept 
    // (concept = "poligono concavo", words in text "il poligono e' sempre e solo concavo" )
    
    let nextWord = [$(this).attr("lemma"), $(this).text()]
    let j = 0
    if(!nextWord.some(word => word == concept_words[0].word || word == concept_words[0].lemma)) // partial match
      for(let jj=j; jj < concept_words.length; jj++)
        if(nextWord[1].endsWith(concept_words[jj].word))
          j = jj
          

    for( j++; j<concept_words.length; j++){

      let nextSpan =  $(currentSpan).nextAll('span:first')
      nextWord = []

      if(nextSpan[0] !== undefined){

        nextWord = [$(nextSpan[0]).attr("lemma"), $(nextSpan[0]).text(), $(nextSpan[0]).attr("num"), $(nextSpan[0]).attr("pos"), $(nextSpan[0]).attr("gen")]
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
                nextWord = [$(currentSpan).attr("lemma"), $(currentSpan).text(), $(currentSpan).attr("num"),$(currentSpan).attr("pos"),$(currentSpan).attr("gen")]
          }
      }
      // transcript is finished
      if (!nextWord.length){
        isConcept = false
        break
      // found the word in one of possible variant matches
      } else if (nextWord[0].toLowerCase() == concept_words[j].word || 
          nextWord[1].toLowerCase() == concept_words[j].word        || 
          nextWord[0].toLowerCase() == concept_words[j].lemma       ||
          nextWord[1].toLowerCase() == concept_words[j].lemma){
        allSpan.push(currentSpan)
        num_words_tol = MAX_TOL_WORDS
        
        // head word is num singular
        if(j == head_indx && nextWord[2] == "s")
          foundSingularTerm = true

      // multiword has been split in the input concept but merged in the transcript
      // skip words of the concept
      } else if(nextWord[1].toLowerCase().includes(concept_words[j].word)){
        for(jj=j; jj < concept_words.length; jj++){
          // last part of the concept
          if(nextWord[1].toLowerCase().endsWith(concept_words[jj].word)){
            j = jj
            allSpan.push(currentSpan)
            break
          // one part does not match 
          } else if(!nextWord[1].toLowerCase().includes(concept_words[jj].word)){
            isConcept = false
            break
          }
        }
        if(!isConcept)
          break
      
      // concept may be unitary term but split in transcript ("3","D" and term "3D") part of the concept
      } else if(concept_words[j].word.includes(nextWord[1].toLowerCase())) {
        allSpan.push(currentSpan)
        if(!concept_words[j].word.endsWith(nextWord[1].toLowerCase()))
          j--;
        num_words_tol = MAX_TOL_WORDS

      // we have still tolerance
      } else if(num_words_tol > 0) {
        // found a new word that matches the first word of the concept
        // will keep on next iteration
        if(concept_words[0].word == nextWord[0] || concept_words[0].word == nextWord[1]){
          isConcept = false
          break
        // commas don't count in words count tol
        } else if([","].includes(nextWord[1]))
          num_words_tol++;
        // other punctuation elements terminate the search
        // also if a verb (form not indefinite eg. infinite, gerund, participle) occurr, meaning there is a new syntactic period 
        else if([".","!","?"].includes(nextWord[1]) || (nextWord[3] == "V" && !nextWord[4])){
          isConcept = false
          break
        }
        j--;
        num_words_tol--;
      } else {
        isConcept = false
        break
      }
    }

    if(isConcept){
      let occurrence = ""
      $(allSpan).each((_, span) => {
        occurrence += span.innerText + " "
      });
      if(foundSingularTerm && (conceptLemma == null || occurrence.trim().length < conceptLemma.length) )
        conceptLemma = occurrence.trim()
      occurrences[occurrence.trim()] = (occurrences[occurrence.trim()] || 0) + 1;
      allSpansPerConcept.push(allSpan);
    }
  })

  // if not found concept lemma as an occurrence with singular head term
  if(!conceptLemma) {
    occurrences = Object.entries(occurrences)
                        .sort((a, b) => b[1] - a[1]) // Sort by count (second element in each entry)
                        .map(([key]) => key);

    conceptLemma = occurrences[0] || "";
    if (!conceptLemma.length) return

    for(let occurrence of occurrences)
      if(occurrence.includes(head_lemma))
        conceptLemma = occurrence
  }

  let conceptLemmaUnderscored = conceptLemma.replaceAll(" ","_")
  allSpansPerConcept.forEach( allSpan => {
    allSpan.forEach( currSpan => {
      currSpan.classList.add("concept");
      let currentConcept = currSpan.getAttribute("concept") || " "; // Get existing concept or empty string
      if (!currentConcept.includes(" " + conceptLemmaUnderscored + " "))
        currSpan.setAttribute("concept", currentConcept + conceptLemmaUnderscored + " "); // Update concept attribute
    })
  })
  return conceptLemma
}


function toggleAnnotationStatus(){
  const checkbox = document.querySelector(".switch input");
  isCompleted = checkbox.checked;
  uploadManuGraphOnDB();
}

function toggleAskConfirmConceptDelete(){
  setCookie("pref-skip-confirm-delete-concept", !$("input[name='askConfirmDeleteConcept']").is(":checked"))
}