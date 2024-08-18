let main_markers = []
let in_description_markers = []

addSubtitles("transcript");
addSubtitles("transcript-in-description")
MarkersInit(main_markers,".youtube-marker");
MarkersInit(in_description_markers,".youtube-in-description-marker");


// $(document).ready(function(){
//   $("#video-active").on(
//     "timeupdate",
//     function(event){
//       console.log("hello")
//       UpdateMarkers(this.currentTime);
//     });
// });


function showRelationDiv(){

  //$("html, body").animate({ scrollTop: 0 }, "slow");
  $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

  document.getElementById("prerequisite").value = ""
  document.getElementById("target").value = ""

  video.pause()
  //video.removeAttribute( 'controls' );
  player.controls(false)

  $('#canvas-wrap').dimBackground();
  $('#drawButton').dimBackground();
  $('#relation').show();
  $('#relationText').show();
  $('#right-body').hide();
  $('#relation').dimBackground();
  $('#relationText').dimBackground();

  //getLastRows()
  getLastSentence()

  targetSentID = null
  targetWordID = null


}

function closeRelationDiv(){

  $('#canvas-wrap').undim();
  $('#drawButton').undim();
  $('#relation').hide();
  $('#right-body').show();
  $('#relation').undim();
  $('#relationText').hide();
  $('#relationText').undim();
  $('.rectanglePrerequisite').hide();
  $('.rectangleTarget').hide();

  removeCanvas()


  //video.play()
  //video.setAttribute( 'controls', '' );
  player.controls(true)

}

function addSubtitles(id){

  let transcriptDiv = document.getElementById(id);
  
  if (id == "transcript") {
    for (let x in $captions){

      transcriptDiv.innerHTML +=
          '<p class="youtube-marker" data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '" onclick="changeTime(' +$captions[x].start + ')">' +
            '<b> ' + secondsToHms($captions[x].start) +":</b> " +
          $lemmatizedSubs[x].text + '</p>';

    }
  } else if (id == "transcript-in-description") {
    for (let x in $captions){
      transcriptDiv.innerHTML +=
          '<p class="youtube-in-description-marker" data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
            '<b> ' + secondsToHms($captions[x].start) +":</b> " + $lemmatizedSubs[x].text + '</p>';
    }
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
  if (id == "transcript") {
    for(let i in $concepts)
      highlightConcept($concepts[i], "transcript")
  }
}


function changeTime(time){
  video.currentTime = time;
}



function MarkersInit(markers,field) {
  var elements = document.querySelectorAll(field);
  Array.prototype.forEach.call(elements, function(el, i) {
    var time_start = el.dataset.start;
    var time_end = el.dataset.end;
    var id = el.dataset.id;;
    if (id >= 1) {
      id = id - 1;
    } else {
      id = 0;
    }
    marker = {};
    marker.time_start = time_start;
    marker.time_end = time_end;
    marker.dom = el;
    if (typeof(markers[id]) === 'undefined') {
      markers[id] = [];
    }
    markers[id].push(marker);
  });
}


let lastHighlightedSpans = [];

function UpdateMarkers(current_time) {
  scrolled = false
  if (inDescription) markers = main_markers
  else markers = in_description_markers
  markers[0].forEach(function(marker) {
    marker.dom.classList.remove("youtube-marker-current");
    if (marker.time_start-1 < current_time && current_time < marker.time_end) {
      marker.dom.classList.add("youtube-marker-current");
      if (!scrolled){
        marker.dom.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        scrolled = true
      }
      
      // Cycle through child spans
      marker.dom.querySelectorAll('span').forEach(function(span) {
        let spanStart = parseFloat(span.getAttribute('start_time'));
        let spanEnd = parseFloat(span.getAttribute('end_time'));
        span.classList.remove("word-marker-current");
        if (spanStart-0.4 < current_time && current_time < spanEnd) {
          span.classList.add("word-marker-current");
        }
      });
    }
  });

}

let transcriptShownId = null;

function higlightExplanationInTranscript(conceptId, start, end, class_field) {

  // We are in the transcript in the annotator page 
  if (class_field == ".youtube-marker") {
    definition_start = [hours, minutes, seconds] = start.split(':').map(Number);
    definition_start = hours * 3600 + minutes * 60 + seconds;
    definition_end = [hours, minutes, seconds] = end.split(':').map(Number);
    definition_end = hours * 3600 + minutes * 60 + seconds;

    // user is de-selecting the concept
    if (transcriptShownId != null & transcriptShownId == conceptId) {
        definition_start = -1
        definition_end = -1
        transcriptShownId = null
    } else {
        transcriptShownId = conceptId
    }
  // otherwise we are in the transcript in description window and values are passed already as float seconds
  } else {
    definition_start = start
    definition_end = end
  }

  let subtitleElements = document.querySelectorAll(class_field);
  console.log(subtitleElements)
  let scrollToElem = null;
  
  // Iterate over each subtitle element to highlight the matching ones
  subtitleElements.forEach(element => {
    //element.classList.add('definitionInTranscript');
    element.querySelectorAll('span').forEach(function(word) {
      word.classList.remove('definitionInTranscript');
      wordStart = parseFloat(word.getAttribute('start_time'));
      wordEnd = parseFloat(word.getAttribute('end_time')) 
      if (wordStart >= definition_start & wordEnd <= definition_end) {
        word.classList.add('definitionInTranscript');
        if (!scrollToElem) scrollToElem = element;
      }
    });
  });
  if (scrollToElem) {
    scrollToElem.scrollIntoView({ behavior: 'smooth', block: 'start'});
  }

}


function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  /*if (m<10)
    m = "0"+m;*/

  if (s<10)
    s = "0"+s;

  if (h > 0)
    return h +":" + m + ":" + s;
  else
    return m + ":" + s;
}

function secondsToH_m_s_ms(d){

  str = secondsToHms(d)
  return str + "." + (Number(d).toFixed(1) + "").split(".")[1]
}

function secondsToTime(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  if (m<10)
    m = "0"+m;

  if (s<10)
    s = "0"+s;

  if (h<10)
    h = "0"+h;


  return h +":" + m + ":" + s;

  }


function getLastSentence(){

  let timestamp = video.currentTime
  let textDiv = document.getElementById("relationText");
  textDiv.innerHTML = ""

  let sub = getCurrentSubtitle(timestamp)
  let sent_id = getSentenceIDfromSub(sub)

  let next_sent_id = parseInt(sent_id)+1

  $("[sent_id='" + sent_id+ "']").each(function(){
    textDiv.innerHTML += this.outerHTML.replace('style="margin-right: 4px;"','') + " "
  })

  $("[sent_id='" + next_sent_id+ "']").each(function(){
    textDiv.innerHTML += this.outerHTML.replace('style="margin-right: 4px;"','') + " "
  })


  for(let i in $concepts){
     highlightConcept($concepts[i], "relationText")
  }

  //rendo cliccabili i concetti sotto al video
  $('#relationText .concept').each(function(){
    if(!this.parentElement.classList.contains("concept"))
      $(this).addClass('clickableConcept')
  })

}

/**
 * Quando l'utente vuole inserire una relazione, sotto il video vengono mostrati i 3 sottotitoli precedenti al current
 * timestamp, la frase corrente e quella successiva
 *
 * DEPRECATED, ora guarda la frase, non il sottotitolo --> getLastSentence()
 * */
function getLastRows() {

  let timestamp = video.currentTime


  let textDiv = document.getElementById("relationText");
  textDiv.innerHTML = ""

  let currentSubtitleIndex = getCurrentRow(timestamp)

  for(let j=currentSubtitleIndex-3; j<=currentSubtitleIndex+1; j++ )
    if(j>=0 && j<$captions.length)
      textDiv.innerHTML += /*'<b> ' + secondsToHms($captions[j].start) + ":</b> " +*/ $lemmatizedSubs[j].text ;


  for(let i in $concepts){
     highlightConcept($concepts[i], "relationText")
  }

  //rendo cliccabili i concetti sotto al video
  $('#relationText .concept').each(function(){

    if(!this.parentElement.classList.contains("concept"))
      $(this).addClass('clickableConcept')
  })



  /*$('#relationText > span').each(function () {
    let lemma = this.getAttribute("lemma")
  })*/


}

function getCurrentRow(time){
  let currentSubtitleIndex = 0

  for (let x=0; x<$captions.length;x++){

    if($captions[x].start <= time && $captions[x].end >= time ){
      currentSubtitleIndex = x

      if(x+1 < $captions.length && $captions[x+1].start > time)
        break

    }
  }

  return currentSubtitleIndex
}

function getCurrentSubtitle(time){

  let firstSubTime = $(".youtube-marker").first().attr("data-start")

  if(time < firstSubTime)
    return $(".youtube-marker").first()

  let subtitles = $(".youtube-marker").filter(function() {
    return  $(this).attr("data-start") <= time && $(this).attr("data-end") > time;
  });

  //sottotitolo non trovato perchè è un momento di silenzio, prendo quello successivo
  if(subtitles.length == 0) {
    let subs = $(".youtube-marker").filter(function () {
      return $(this).attr("data-start")>=time;
    });
    subtitles = subs.first()
  }

  return subtitles[subtitles.length -1]


}

function getSentenceIDfromSub(sub){

  console.log(sub)
  let startSentID = $(sub).find("span")[0].getAttribute("sent_id")

  //se il primo span è un concetto di più parole ritorna null, allora prendo lo span interno
  if (startSentID == null){
      startSentID = $(sub).find("span span")[0].getAttribute("sent_id")
  }

  return startSentID
}