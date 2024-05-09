let definingConcepts = []

//console.log($concepts)

  function showConcepts(){

    document.getElementById("newConcept").value = ""
    document.getElementById("errorConcept").style.display = "none"

    video.pause()
      document.getElementById("conceptsTable").innerHTML = "<div class=\" list-group-item list-group-item-action conceptList \"> </div>"

      for(let i in $concepts){

          //se il concetto è una defizione devo aggiungere il dropdown menu
          //let isDefinition = definedConcepts.includes($concepts[i])

          let c = $concepts[i].replaceAll(" ","_")

          let href = "sub" + c

          let row ="<div class=\" list-group-item list-group-item-action conceptList toRemove\"> " +
              "<a href=\"#"+href+"\" data-toggle=\"collapse\" aria-expanded=\"false\" id='menu_"+c+"' "

          //DEPRECATED
          /*if(isDefinition)
              row += 'class="dropdown-toggle"'*/

          row += ">"+$concepts[i]+
            '<button class="icon-button" onclick="deleteConcept(this,'+"'"+$concepts[i]+"'"+')"><i class="fa fa-trash"></i></button>'

          /*if(document.getElementById($concepts[i]+"Defined") == null)
              row += '<button class="icon-button" id="'+$concepts[i]+'Button" onclick="startDefinition(this,'+"'"+$concepts[i]+"'"+')"><i class="fa fa-play"></i></button>'
          else
              row += '<button class="icon-button" id="'+$concepts[i]+'Button" onclick="stopDefinition('+"'"+$concepts[i]+"'"+')"><i class="fa fa-pause"></i></button>'*/

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



        document.getElementById("conceptsTable").innerHTML += row

      }



  }

  

  function addConcept(){

    let concept = document.getElementById("newConcept").value

    if(!$concepts.includes(concept)) {
        fetch('/annotator/lemmatize_word/' + concept).then(function (response) {

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
                    document.getElementById("errorConcept").innerHTML ="'" + concept +"' is not present in the text"
                    document.getElementById("errorConcept").style.display = "block"
                }

                else if (!$concepts.includes(lemma)){
                    $concepts.push(lemma)
                    highlightConcept(lemma, "transcript")
                    $concepts.sort()
                    showConcepts()
                    console.log($concepts)
                    console.log("--------------------")
                   // $('#conceptsModal').modal('hide')
                    document.getElementById("newConcept").value = ""
                    document.getElementById("errorConcept").style.display = "none"
                }

            })
        })
    }else{
        document.getElementById("errorConcept").innerHTML ="'" + concept +"' is already a concept"
        document.getElementById("errorConcept").style.display = "block"
    }
}


  function deleteConcept(button,concept) {

    //rimuovo riga della tabella
    $(button).closest('div').slideUp(function() {
        $(this).remove();
    });

    //cancello concetto
    for(let i in $concepts){

        if ( $concepts[i] === concept) {
            $concepts.splice(i, 1);
            break
        }

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

    //rimuovo il div a lato
    if(document.getElementById(concept+"Defined") != null)
        document.getElementById(concept+"Defined").remove()

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

        for(let s=0; s<allSpan.length -1 ; s++)
          allSpan[s].style.marginRight = "4px"//.innerHTML += " "


        $(allSpan).wrapAll("<span class='concept' lemma='"+ concept.replaceAll(" ", "_") +"'>")

      }


    })

  }


}




