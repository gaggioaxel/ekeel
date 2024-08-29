let definingSynonyms = []

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

    /*
      row += '</a>'+
        '<ul class="collapse list-unstyled" id="'+href+'">'
      if(isDefinition) {
          for (let j in definitions) {
              if (definitions[j].concept == $concepts[i]){
                  let deleteParameters = "'"+$concepts[i]+"','"+ definitions[j].start +"','"+ definitions[j].end + "'"

                  row += '<li id="definition' +definitions[j].id + '">' +
                      '<span style="margin-left:5%">Start: ' + definitions[j].start + ' End: ' + definitions[j].end +
                      '<button class="deleteDefinitionIcon" ' +
                        'onclick="deleteDefinition('+ deleteParameters +')">' +
                        '<i class="fa fa-times"></i>' +
                      '</button></a></span>' +
                      '</li>'
              }
          }
      }
      row += '</ul></div>'
    */
  
    row += "</div>"

    document.getElementById("conceptVocabularyContent").innerHTML += row
  }

  $(document).on("click", ".concept-row", function (e) {
    let conceptElements = document.getElementsByClassName("concept");

    var target = e.currentTarget;
    let conceptText = target.children[0].id.split("menu_")[1]
    let selectedConcept = conceptText.replaceAll(" ","_")

    document.getElementById("transcript-selected-concept").innerHTML = conceptText;

    let synsText = "";
    let syns = [];

    if (selectedConcept in $conceptVocabulary) {
      syns = $conceptVocabulary[selectedConcept];
      
      for (let i = 0; i < syns.length; i++) {
          if (i === 0) {
              synsText = syns[i];
          } else {
              synsText += ", " + syns[i];
          }
      }
    }

    document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText;

    for (let el of conceptElements) {
        el.className = "concept";
        if (el.getAttribute('lemma').replaceAll("_", " ") === selectedConcept) {
            el.className += " selected-concept-text";
        } else if (syns.includes(el.getAttribute('lemma').replaceAll("_", " "))) {
            el.className += " selected-synonyms-text";
        }
    }
    //console.log(conceptText)
    //highlightConcept(conceptText,"transcript")

  });

}



// Add concept manually to the list of concepts (vocabulary)
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
                  showVocabulary($conceptVocabulary)
                  //console.log($concepts)
                  //console.log("--------------------")
                  // $('#conceptsModal').modal('hide')
                  document.getElementById("newConcept").value = ""
                  document.getElementById("errorConcept").innerHTML = "word successfully added to the concepts"
                  showMsg("errorConcept", "green")
                  uploadManuGraphOnDB()
              }

          })
      })
  }else{
      document.getElementById("errorConcept").innerHTML ="the word is already a concept !"
      showMsg("errorConcept", "orange")
  }

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
          document.getElementById("synonymSet").innerHTML = synonymSetText;
          document.getElementById("synonymSet").style.display = "block"
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
          
      })
    })
  }
}

function deleteConcept(button,concept) {

  console.log(concept)
  concept = concept.replaceAll(" ’ ","'")

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

  showVocabulary($conceptVocabulary);

  //rimuovo il div a lato
  if(document.getElementById(concept+"Defined") != null)
      document.getElementById(concept+"Defined").remove()

  uploadManuGraphOnDB()
}

/* highlight a concept in a div with id div_id */

function highlightConcept(concept, div_id) {

  let words = concept.split(" ")

  if(words.length == 1) {
      $("#"+div_id+" [lemma='" + words[0]+ "']").addClass("concept");
  }
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

        for(let s=0; s<allSpan.length -1 ; s++)
          allSpan[s].style.marginRight = "4px"//.innerHTML += " "

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


