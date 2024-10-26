let main_markers = []
let in_description_markers = []
let in_relation_markers = []


addSubtitles("transcript");
addSubtitles("transcript-in-description");
addSubtitles("transcript-in-relation");
MarkersInit("#transcript.sentence-marker", main_markers);
MarkersInit("#transcript-in-description.sentence-marker-in-description", in_description_markers);
MarkersInit("#transcript-in-relation.sentence-marker", in_relation_markers);


$("#transcript, #transcript-in-description").on("click", ".concept", function (e) {

  //TODO far si che se il parent e' in-relation allora non selezionare tutti i sinonimi ma solo il concetto

  let conceptElements = document.getElementsByClassName("concept");

  let in_description = e.target.parentElement.classList.contains("sentence-marker-in-description");
  
  // removes the fields for the elements
  $(conceptElements).each( function(){
    $(this).removeClass("selected-concept-text").removeClass("selected-synonym-text")
  })

  var target = e.currentTarget;
  var selectedConcept = target.getAttribute("concept")
    .split(" ")
    .filter(str => str.length > 0)
    .sort((a, b) => a.split("_").length - b.split("_").length)
    .reverse()[0];
  var selectedConceptText = selectedConcept.replaceAll("_", " ");

  if (document.getElementById("transcript-selected-concept").innerHTML == selectedConceptText) {
    document.getElementById("transcript-selected-concept").innerHTML = "";
    document.getElementById("transcript-selected-concept-synonym").innerHTML = "--";
    if (in_description)
      document.getElementById("conceptDefined").value = ""
    return
  }
  
  if (in_description)
    document.getElementById("conceptDefined").value = selectedConceptText;
  document.getElementById("transcript-selected-concept").innerHTML = selectedConceptText;

  let syns = $conceptVocabulary[selectedConceptText] || [];
  let synsText = syns.join(", ");

  document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText || "--";

  $("[concept~='" +  selectedConcept + "']")
    .get()
    .forEach(function(element) { 
      element.classList.add("selected-concept-text") 
    });
  syns.forEach(function(syn) { 
    $("[concept~='" + syn.replaceAll(" ","_") + "']")
      .get()
      .forEach(function(element) { 
        element.classList.add("selected-synonym-text")
      }) 
    })
});



document.getElementById("transcript-in-description").addEventListener('mouseup', function () {

  var selection = window.getSelection()

  if (selection.rangeCount == 0)
    return
  
  var start_container = selection.getRangeAt(0).commonAncestorContainer
  if(!start_container.classList || 
      (!start_container.classList.contains("transcript-in-description") && !start_container.classList.contains("sentence-marker-in-description"))) {
    selection.removeAllRanges()
    return
  }

  var start_time = $(selection.getRangeAt(0).startContainer).closest("[start_time]").attr("start_time")

  var endRange = selection.getRangeAt(selection.rangeCount - 1);
  var end_time = $(endRange.endContainer).closest("[end_time]").attr("end_time");

  selection.removeAllRanges()

  if(!end_time) end_time = document.querySelector('p.sentence-marker-in-description:last-child').getAttribute("data-end");

  if (!start_time || !end_time) return
    
  start_time = Math.trunc(parseFloat(start_time)*100)/100
  end_time = Math.trunc((parseFloat(end_time)+0.01)*100)/100

  // Highlight the selection with the found start and end times
  highlightExplanationInTranscript(start_time, end_time, "#transcript-in-description", ".sentence-marker-in-description");

  // Update the slider values
  $("#videoSlider").slider("values", [start_time, end_time]);
  $("#descriptionRangeInput").val("Start: " + secondsToH_m_s_ms(start_time) + " - End: " + secondsToH_m_s_ms(end_time));
    
  // Update the handle labels
  document.getElementById("handleSinistro").innerHTML = secondsToH_m_s_ms(start_time);
  document.getElementById("handleDestro").innerHTML = secondsToH_m_s_ms(end_time);
});

function showRelationDiv(){
  state="rel"
  clearAnnotatorVisualElements()
  //$("html, body").animate({ scrollTop: 0 }, "slow");
  $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

  document.getElementById("prerequisite").value = ""
  document.getElementById("targetSelector").value = ""

  player.pause()
  UpdateMarkers(player.currentTime())

  $('#canvas-wrap').dimBackground();
  $('#drawButton').dimBackground();
  $('#relation').show();
  //$('#relationText').show();
  $('#right-body').hide();
  $('#transcript-in-relation').dimBackground();
  $('#transcript-in-relation').show();
  $('#relation').dimBackground();
  //$("#targetSelector").addClass("focused");

  //$('#relationText').dimBackground();
  
  

  //getLastRows()
  //getLastSentence()

  targetSentID = null
  targetWordID = null
  targetTime = null
}

function closeRelationDiv(){

  $('#canvas-wrap').undim();
  $('#drawButton').undim();
  $('#relation').hide();
  $('#transcript-in-relation').undim();
  $('#transcript-in-relation').hide();
  $('#right-body').show();
  $('#relation').undim();
  //$('#relationText').hide();
  //$('#relationText').undim();
  $('.rectanglePrerequisite').hide();
  $('.rectangleTarget').hide();

  removeCanvas()
  state="home"
}

function addSubtitles(id){

  let transcriptDiv = document.getElementById(id);

  if($isTempTranscript)
    document.getElementById("temp-transcript-warning").style.display = "block";
  
  if (id == "transcript" || id=="transcript-in-relation") {
    for (let x in $captions) {
      transcriptDiv.innerHTML +=
        '<p class=" sentence-marker " data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
          '<b class="timestamp"> ' + secondsToHms($captions[x].start) + ": </b>" + $lemmatizedSubs[x].text + '</p>';
    }

    // Add event listener for click to prevent time change on concept click
    transcriptDiv.addEventListener('click', function (event) {
      clearAnnotatorVisualElements();
      if (event.target.classList.contains("concept"))
        return;

      // If not a concept, change the time
      let marker = event.target.closest('[lemma]');
      if (marker)
        changeTime(parseFloat(marker.getAttribute('start_time')));
    });
  } else if (id == "transcript-in-description") {
    for (let x in $captions){
      transcriptDiv.innerHTML +=
          '<p class=" sentence-marker-in-description " data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
            '<b class="timestamp"> ' + secondsToHms($captions[x].start) +": </b>" + $lemmatizedSubs[x].text + '</p>';
    }
  }
  for(let i in $concepts)
    highlightConcept($concepts[i], id)
}


function changeTime(time){
  player.currentTime(time);
}



function MarkersInit(html_field, markers) {
  var elements = $(html_field.split(".")[0]).find("."+html_field.split(".")[1]).get();
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


function UpdateMarkers(current_time) {
  let controlsState = player.controls();
  player.controlBar.currentTimeDisplay.updateContent();
  player.controlBar.progressControl.seekBar.update({"percent":(player.currentTime() / player.duration()) * 100});
  player.controls(controlsState)
  scrolled = false
  
  switch (state) {
    case "desc":
      markers = in_description_markers;
      break;
    case "rel":
      markers = in_relation_markers;
      break;
    default:
      markers = main_markers;
      break;
  } 
  
  markers[0].forEach(function(marker) {

    if (parseFloat(marker.time_start)-1 < current_time & current_time < parseFloat(marker.time_end)+1) {
      marker.dom.classList.add("current");

      // Cycle through child spans
      marker.dom.querySelectorAll('span').forEach(function(span) {
        span.classList.remove("word-current");
        let spanStart = parseFloat(span.getAttribute('start_time'));
        let spanEnd = parseFloat(span.getAttribute('end_time'));
        if (spanStart-0.4 < current_time & current_time < spanEnd+0.4) {
          span.classList.add("word-current");
        }
      });

      if (!scrolled){
        if(state != "home")
          marker.dom.parentElement.scrollTo({ top: marker.dom.offsetTop - 40, behavior: "smooth" })
        else
          marker.dom.parentNode.scrollTo({
            top: marker.dom.offsetTop - marker.dom.parentElement.offsetTop - 40,
            behavior: 'smooth'
          });
        scrolled = true
      }

    } else {
      if (marker.dom.classList.contains("current"))
        marker.dom.classList.remove("current");
      marker.dom.querySelectorAll('span').forEach(function(span) {
        var classList = span.classList;
        if (classList.contains("word-current"))
          classList.remove("word-current");
      })
    }
  });

}

function highlightExplanationInTranscript(start, end, parent_id, class_field) {

  // We are in the transcript in the annotator page 
  if (class_field == ".sentence-marker") {
    definition_start = [hours, minutes, seconds] = start.split(':').map(Number);
    definition_start = hours * 3600 + minutes * 60 + seconds;
    definition_end = [hours, minutes, seconds] = end.split(':').map(Number);
    definition_end = hours * 3600 + minutes * 60 + seconds;

  // otherwise we are in the transcript in description window and values are passed already as float seconds
  } else {
    definition_start = start
    definition_end = end
  }

  let subtitleElements = $(parent_id+" "+class_field).get()//Array.from(document.querySelectorAll(class_field));
  
  // Iterate over each subtitle element to highlight the matching ones
  subtitleElements.forEach((element,index) => {
    element.querySelectorAll('span').forEach(function(word) {
      word.classList.remove('highlighted');
      wordStart = parseFloat(word.getAttribute('start_time'));
      wordEnd = parseFloat(word.getAttribute('end_time')) 
      if (wordStart >= definition_start & wordEnd <= definition_end)
        word.classList.add('highlighted');
    });
  });
}

function playExplanation(button, start, end, parent_id, class_field) {
  if ($(button).hasClass("active")){
    $("highlighted").removeClass("highlighted");
    $(button).removeClass("active");
    player.currentTime(prevTime);
    player.pause();
    player.controls(true);
    return
  }
  $(".visual-effect.active").removeClass("active")
  $(button).addClass("active");
  player.pause();
  player.controls(false);
  prevTime = player.currentTime();
  player.currentTime(timeToSeconds(start));

  player.off("timeupdate")
  player.on('timeupdate', function() {
    let currentTime = player.currentTime()
    UpdateMarkers(currentTime)
    if (currentTime >= timeToSeconds(end) || currentTime < timeToSeconds(start)) {
      player.pause();
      player.currentTime(prevTime);
      $(".play-definition.active").removeClass("active");
      $(".highlighted").removeClass("highlighted");
      player.off("timeupdate")
      player.on("timeupdate", function (){ UpdateMarkers(player.currentTime()) })
    }
  });
  highlightExplanationInTranscript(start,end,parent_id,class_field)

  player.play();
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
  return str + "." + Number(d).toFixed(2).split(".")[1] || "0";
}

function secondsToTime(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  var ms = d.toFixed(2).split(".")[1] || "0";

  if (m<10)
    m = "0"+m;

  if (s<10)
    s = "0"+s;

  if (h<10)
    h = "0"+h;


  return h +":" + m + ":" + s + "." + ms;

}

function timeToSeconds(time_text){
  let time = time_text.split(':').map(Number);
  if(time.length == 2)
    time = time[0]*60+time[1];
  else if(time.length == 3)   
    time = time[0]*3600+time[1]*60+time[2];
  return time
}



//function getLastSentence(){
//
//  let timestamp = video.currentTime
//  let textDiv = document.getElementById("relationText");
//  textDiv.innerHTML = ""
//
//  let sub = getCurrentSubtitle(timestamp)
//  let sent_id = getSentenceIDfromSub(sub)
//
//  $("#transcript [sent_id='" + sent_id+ "']").each(function(){
//    textDiv.innerHTML += this.outerHTML + " "
//  })
//  
//  if($isTempTranscript) {
//    to_include = true
//    let next_sent_id = parseInt(sent_id)+1
//    while (to_include) {
//      let elems = $("#transcript [sent_id='" + next_sent_id+ "']")
//      elems.each(function(){
//        if (parseFloat($(this).attr("end_time")) > timestamp + included_time_span)
//          to_include = false
//        else
//          textDiv.innerHTML += this.outerHTML + " "
//      })
//      if(elems.get().length == 0)
//        to_include = false
//      next_sent_id++;
//    }
//  } else {
//    let n_sentences_before_and_after = 2 + (textDiv.innerText.match(/[.,;?!]/g) || [] ).length;
//
//    let sentences_added = (textDiv.innerText.match(/[.,;?!]/g) || [] ).length;
//    let i = 0
//    while(sentences_added < n_sentences_before_and_after) {
//      curr_id = parseInt(sent_id)-(i+1)
//      let elems = $("#transcript [sent_id='" + curr_id+ "']")
//      if(elems.get().length == 0)
//        break
//      let html_to_add = ""
//      elems.each(function(){
//        html_to_add += this.outerHTML + " ";
//      })
//      textDiv.innerHTML = html_to_add + textDiv.innerHTML;
//      sentences_added = (textDiv.innerText.match(/[.,;?!]/g) || [] ).length;
//      i++;
//    }
//    n_sentences_before_and_after += sentences_added
//    i = 0
//    while(sentences_added < n_sentences_before_and_after) {
//      curr_id = parseInt(sent_id)+(i+1)
//      let elems = $("#transcript [sent_id='" + curr_id+ "']")
//      if(elems.get().length == 0)
//        break
//      $("#transcript [sent_id='" + curr_id+ "']").each(function(){
//        textDiv.innerHTML += this.outerHTML + " "
//      })
//      sentences_added = (textDiv.innerText.match(/[.,;?!]/g) || [] ).length;
//      i++;
//    }
//  }
//
//  for(let i in $concepts){
//    highlightConcept($concepts[i], "relationText")
//  }
//
//  $("#relationText [lemma]").each( function() { 
//    $(this).removeClass("word-current")
//  })
//
//  //rendo cliccabili i concetti sotto al video
//  $('#relationText .concept').each(function(){
//    if(!this.parentElement.classList.contains("concept"))
//      $(this).addClass('clickableConcept')
//  })
//
//}

/**
 * Quando l'utente vuole inserire una relazione, sotto il video vengono mostrati i 3 sottotitoli precedenti al current
 * timestamp, la frase corrente e quella successiva
 *
 * DEPRECATED, ora guarda la frase, non il sottotitolo --> getLastSentence()
 * */
//function getLastRows() {
//
//  let timestamp = video.currentTime
//
//
//  let textDiv = document.getElementById("relationText");
//  textDiv.innerHTML = ""
//
//  let currentSubtitleIndex = getCurrentRow(timestamp)
//
//  for(let j=currentSubtitleIndex-3; j<=currentSubtitleIndex+1; j++ )
//    if(j>=0 && j<$captions.length)
//      textDiv.innerHTML += /*'<b> ' + secondsToHms($captions[j].start) + ":</b> " +*/ $lemmatizedSubs[j].text ;
//
//
//  for(let i in $concepts){
//     highlightConcept($concepts[i], "relationText")
//  }
//
//  //rendo cliccabili i concetti sotto al video
//  $('#relationText .concept').each(function(){
//
//    if(!this.parentElement.classList.contains("concept"))
//      $(this).addClass('clickableConcept')
//  })
//
//
//
//  /*$('#relationText > span').each(function () {
//    let lemma = this.getAttribute("lemma")
//  })*/
//
//
//}

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

  let firstSubTime = $(".sentence-marker").first().attr("data-start")

  if(time < firstSubTime)
    return $(".sentence-marker").first()

  let subtitles = $(".sentence-marker").filter(function() {
    return  $(this).attr("data-start") <= time && $(this).attr("data-end") > time;
  });

  //sottotitolo non trovato perchè è un momento di silenzio, prendo quello successivo
  if(subtitles.length == 0) {
    let subs = $(".sentence-marker").filter(function () {
      return $(this).attr("data-start")>=time;
    });
    subtitles = subs.first()
  }

  return subtitles[subtitles.length -1]


}

function getSentenceIDfromSub(sub){

  let startSentID = $(sub).find("span")[0].getAttribute("sent_id")
  console.log(startSentID)

  //se il primo span è un concetto di più parole ritorna null, allora prendo lo span interno
  if (startSentID == null){
      startSentID = $(sub).find("span span")[0].getAttribute("sent_id")
  }

  return startSentID
}