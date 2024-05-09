console.log(concept_map)
console.log(concepts)
console.log(sentences)

let options = "<option value='ANY CONCEPT'>ANY CONCEPT</option>";
for(let i = 0; i < concepts.length; i++) {
    options += "<option value='" + concepts[i] + "'>" + concepts[i] + "</option>";
}
$('select[name="prerequisite_name"]').append(options)
$('select[name="target_name"]').append(options)



$("#find").click(function () {

    $('#results').empty();

    //let selectedSentence = $('#sent_id').val();
    let selectedPrereq = $('#prerequisite_name').val();
    let selectedTarget = $('#target_name').val();
    let selectedWeight = $('#edge_weight').val();

    let no_relations_matched = true;
    let counter = 0;
    let index = 0

    for (let rel of concept_map) {

        if ((selectedPrereq === "ANY CONCEPT" || rel['prerequisite'] === selectedPrereq) &&
            (selectedTarget === "ANY CONCEPT" || rel['target'] === selectedTarget) &&
            (selectedWeight === "ANY WEIGHT" || rel['weight'] === selectedWeight) ) /*&&
            (selectedSentence === "ANY SENTENCE" || rel['sent'].toString() === selectedSentence))*/ {

            if(no_relations_matched)
                no_relations_matched = false;

            counter += 1;

            let currSent = rel["sentence"];

            // coloro prerequisito in giallo e target in verde
            var sentence = color_word_in_sentence(rel['prerequisite'], currSent, "#ff6666");
            sentence = color_word_in_sentence(rel['target'], sentence, "lightblue");

            let background = ""
            if(counter % 2 == 0)
                background = 'style="background-color: white"'


            $("#results").append('' +
                '<div '+ background +'>' +
                    '<div class="container" style="padding:10px">'+
                        '<p class="titleLower"> ' +rel["prerequisite"] +'<i style="font-size:18px" class="fas"> &#xf061; </i>' + rel["target"] +
                        '</p>'+ rel["time"]+
                        '<br>'+ sentence+ '<br>'+
                        '<button type="button" class="btn btn-primary btn-sm result_text"'+
                            ' data-rel_id="' + concept_map.indexOf(rel) + '"> Show Context </button>'+
                    '</div>'+
                    '<br>'+
                '</div>'

            );

        }
    }

    if(no_relations_matched)
        $("#results").append('<div class="container"><span style="font-weight: bold;">No relations matched your critera</span></div> ');

    $('html, body').animate({
        scrollTop: $("#results").offset().top
    }, 1000);


    $('.result_text').click(function (e) {

        clickedResult = {
            rel_id: $(this).data( "rel_id" )
        };

        $('#modalAnalysis').modal('show');
    });
});





/* Show Context modal*/

var frase_mostrata;
let network

$('#modalAnalysis').on('show.bs.modal', function(e) {

    $('.nav-tabs a[href="#context_tab"]').tab('show')

    let sent_id = concept_map[clickedResult.rel_id].sent_id
    let prereq = concept_map[clickedResult.rel_id].prerequisite
    let target = concept_map[clickedResult.rel_id].target

    let centralSent = sentences[sent_id-1];
    frase_mostrata = sent_id-1;

    $('#next_button').css("display","block");
    $('#prev_button').css("display","block");

    //erase the paper from previous results and re-populate it
    $('#paper_modal').empty();
    $("#relation").empty();

    centralSent = color_word_in_sentence(prereq,centralSent,"#ff6666");
    centralSent = color_word_in_sentence(target,centralSent,"lightblue");
    $("#relation").append('<span style="font-weight: bold;">Prerequisite:  </span>'+ prereq + '<br><span style="font-weight: bold;">Target: </span> ' + target+'<br><br>');
    $("#paper_modal").append('<table class="table table-bordered result_text_modal" >'+ '<tr><td>'+centralSent + '</td></tr></table>');

    // populate the table in POS tab
    $("#table_pos").find("tr:not(:first)").remove();
    let tokens = conll.filter(x => x.sent_id === sent_id);
    for (let tok of tokens) {
        let table = document.getElementById("table_pos");
        let row = table.insertRow(table.rows.length);
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);
        let cell5 = row.insertCell(5);
        cell0.innerHTML = tok["sent_id"];
        cell1.innerHTML = tok["tok_id"];
        cell2.innerHTML = tok["forma"];
        cell3.innerHTML = tok["lemma"];
        cell4.innerHTML = tok["pos_coarse"];
        cell5.innerHTML = tok["pos_fine"];
    }

    /*grafo: deve comprendere un livello prima e un livello dopo del target*/
    let concepts = [target]
    let relations = []
    for (let rel of concept_map){
        if (rel["target"] == target){
            if(!concepts.includes(rel["prerequisite"]))
                concepts.push(rel["prerequisite"])

            relations.push({"prerequisite": rel["prerequisite"], "target": rel["target"]})
        }

        if (rel["prerequisite"] == target){
            if(!concepts.includes(rel["target"]))
                concepts.push(rel["target"])

            relations.push({"prerequisite": rel["prerequisite"], "target": rel["target"]})
        }

    }

    network = showNetwork(concepts, relations, "graph_canvas")

    network.fit();


});

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  if(target == "#grafo")
    network.fit()
});





$('#prev_button').click(function (e) {

    e.preventDefault();


    let prevSent = sentences[frase_mostrata-1];
    let prereq = concept_map[clickedResult.rel_id].prerequisite
    let target = concept_map[clickedResult.rel_id].target

    frase_mostrata--;

    $('#paper_modal').empty();

    prevSent = color_word_in_sentence(prereq,prevSent,"#ff6666");
    prevSent = color_word_in_sentence(target,prevSent,"lightblue");

    $("#paper_modal").append('<table class="table table-bordered result_text_modal" >'+
            '                   <tr><td>'+ prevSent + '</td></tr></table>');

    if(frase_mostrata == concept_map[clickedResult.rel_id].sent_id-2)
        $('#prev_button').css("display","none");

    $('#next_button').css("display","block");
});


$('#next_button').click(function (e) {

    e.preventDefault();

    let nextSent = sentences[frase_mostrata+1];
    let prereq = concept_map[clickedResult.rel_id].prerequisite
    let target = concept_map[clickedResult.rel_id].target
    frase_mostrata++;

    nextSent = color_word_in_sentence(prereq,nextSent,"#ff6666");
    nextSent = color_word_in_sentence(target,nextSent,"lightblue");

    $('#paper_modal').empty();
    $("#paper_modal").append('<table class="table table-bordered result_text_modal" >'+
            '                   <tr><td>'+ nextSent + '</td></tr></table>');

    if(frase_mostrata == concept_map[clickedResult.rel_id].sent_id)
        $('#next_button').css("display","none");
    $('#prev_button').css("display","block");
});


function color_word_in_sentence(word,sent,color){
    var sentence = sent.toLowerCase();
    word = word.toLowerCase();
    var bigger_concepts = {}; // array con id dei concetti in una frase che includono la parola, ad esempio phone network include network
    // devo dividere la frase in: primo pezzo + parola + ultimo pezzo
    //in modo da evidenziare il concetto giusto ( se la parola è "network" e la frase è "phone network is a network" devo evidenziare il secondo network!)

    //rimpiazzo ogni concetto più grosso con "xxx"
    for(c in concepts){
        if(concepts[c].includes(word) && concepts[c] != word)
            if(sent.includes(concepts[c])){
                var re = new RegExp(concepts[c],"g");
                sentence = sentence.replace(re, "xxx"+c);
                bigger_concepts["xxx"+c] = concepts[c];
            }
    }

    //splitto sul prerequisito
    if(sentence.includes(word)) { // il prerequisito potrebbe non essere nella frase
        sentence = sentence.split(word);
        //coloro prerequisito, se il prerequisito è presente più volte coloro solo la prima occorrenza

        var temp = sentence[0] + '<span style="background-color:'+color+'">' + word + '</span>';

        //se la frase non è finita
        if (sentence[1] != undefined) {
            temp += sentence[1];
            for (i = 2; i < sentence.length; i++)
                temp += word + sentence[i];
        }
        sentence = temp;
    }


    //rimetto i concetti più grossi
    for(b in bigger_concepts){
        var re = new RegExp(b,"g");
        sentence = sentence.replace(re, bigger_concepts[b]);
    }

    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}