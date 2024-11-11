let markers = []

addSubtitles();
initializeMarkers();
attachPlayerKeyEvents();

function attachPlayerKeyEvents(){
  $(document).on("keydown", function(event) {

    event.preventDefault(); // Prevent default scrolling
    clearAnnotatorVisualElements();
    player.userActive(true);

    switch (event.keyCode) {
        case 32: // Space key
          player.paused() ? player.play() : player.pause();
          break;

        case 37: // Left Arrow key
          player.currentTime(Math.max(0, player.currentTime() - skipSeconds)); // Go back 10 seconds
          break;

        case 39: // Right Arrow key
          player.currentTime(Math.min(videoDuration, player.currentTime() + skipSeconds)); // Go forward 10 seconds
          break;
    }
  });
}

function attachRelationKeyEvents(){
  $(document).off("keydown")
  $(document).on('keydown', function(event) {
    
    // If an input field or textarea is focused, return early
    if ($(document.activeElement).is('input, textarea')) {
      return;
    }

    event.preventDefault(); // Prevent default scrolling
    player.userActive(true);

    switch (event.keyCode) {
        case 32: // Space key
            player.paused() ? player.play() : player.pause();
            break;

        case 37: // Left Arrow key
            player.currentTime(Math.max(0, player.currentTime() - skipSeconds)); // Go back 10 seconds
            break;

        case 39: // Right Arrow key
            player.currentTime(Math.min(videoDuration, player.currentTime() + skipSeconds)); // Go forward 10 seconds
            break;
        
        case 27:
            closeRelationDiv();
            break;
    }
  });
}

function showRelationDiv(){
  state="rel"
  clearAnnotatorVisualElements()
  $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");
  $("#slidesContainer, #mainButtonsContainer").hide()
  $("#descriptionsTable, #relationsTable").css("overflow", "visible")


  document.getElementById("prerequisite").value = ""
  const targetSelector = $(document.getElementById("targetSelector")).val("")

  player.pause()
  UpdateMarkers(player.currentTime())

  const transcript = $(document.getElementById("transcript"))

  transcript.detach();
  transcript.insertAfter($("#videoAndSliderContainer").children().eq(1));
  transcript.css({marginTop:"1em", width: "auto"})
  transcript.find(".selected-concept-text").removeClass("selected-concept-text")

  transcript.off("click")
  transcript.on('click', '.concept', function() {
    $(".selected-concept-text").removeClass("selected-concept-text")
    targetSelector.attr("readonly","true")
                  .val("")
                  .find("option:not([value=''])")
                  .remove();
    targetSelector.find("option[value='']")
                  .text("-> Select here the concept <-")
    targetSelector.get()[0].classList = ["form-control"]

    //let prevSelectedConcept = document.getElementById("target").value;
    let targetConcepts = $(this).attr("concept")
                                .split(" ")
                                .filter(elem => elem.length > 0 )
                                .map(elem => elem.replaceAll("_"," "))                              

    let selectedConcept = targetConcepts[0]
    let clickedElement = this

    if(targetConcepts.length == 1) {
      this.classList.add("selected-concept-text")
      $(this).siblings(".concept").get()
                                  .filter( elem => $(elem).attr("concept").includes(" "+selectedConcept.replaceAll(" ","_")+" ") )
                                  .forEach( elem => elem.classList.add("selected-concept-text") );
      targetSelector.attr("sent_id", $(".selected-concept-text").get()[0].getAttribute("sent_id"))
                    .attr("word_id", $(".selected-concept-text").get()[0].getAttribute("word_id"))
                    .removeAttr("readonly")
                    .append(new Option(selectedConcept, selectedConcept))
                    .val(selectedConcept)
                    .addClass("filled");

    } else {
      targetSelector.addClass("focused")
                    .removeAttr("readonly")
                    .find("option[value='']")
                    .text("-> Select here the concept <-")
      
      for(concept of targetConcepts)
        targetSelector.append(new Option(concept, concept))

      // Aggiungi evento "change" per rilevare quando un'opzione viene selezionata
      targetSelector.off("change")
      targetSelector.on("change", function() {
        let selectedConcept = $(this).val()
        if (selectedConcept != "")
          $(".selected-concept-text").removeClass("selected-concept-text")
        $(this).removeClass("focused")
               .addClass("filled");

        let selectedConceptUnderscore = selectedConcept.replaceAll(" ", "_");
        // TODO currently takes only siblings (same row words and not other rows for performances but may break some annotations)
        let nearElements = $(clickedElement).addClass("selected-concept-text")
                                  .siblings(".concept")
                                  .filter(function() {
                                      return $(this).attr("concept").includes(" "+selectedConceptUnderscore+" ");
                                  });
        for(let words_counter in selectedConcept.split(" ").slice(1))
          $(nearElements[words_counter]).addClass("selected-concept-text");
        nearElements.filter(function() { $(this).hasClass("selected-concept-text") })
        targetSelector.attr("sent_id", nearElements.get().length 
                              ? nearElements.get()[0].getAttribute("sent_id") : clickedElement.getAttribute("sent_id"))
                      .attr("word_id", nearElements.get().length 
                              ? nearElements.get()[0].getAttribute("word_id") : clickedElement.getAttribute("word_id"))
      });      
    }
  });

  $('#right-body').hide();
  $('#relation').show();
  $('#canvas-wrap, #relation, #transcript').dimBackground({ darkness: bgDarknessOnOverlay })
  attachRelationKeyEvents()
}


function reattachTranscriptAnnotator(){
  const transcript = $(document.getElementById("transcript"));
  transcript.detach();
  transcript.insertAfter($("#transcriptContainer").children().eq(2));
}

function closeRelationDiv(){
  state="home"
  removeCanvas()
  $("#slidesContainer, #mainButtonsContainer").fadeIn("fast")
  $("#descriptionsTable, #relationsTable").css("overflow", "hidden auto")

  const targetSelector = $("#targetSelector")
  targetSelector.get()[0].classList = ["form-control"]

  targetSelector.val("")
                .find("option:not([value=''])")
                .remove();
  targetSelector.find("option[value='']")
                .text("Click on a concept...")
  $('#relation').hide();
  $('#right-body').show();
  $(document).off('keydown');
  document.body.style.overflow = 'auto';
  const transcript = $(document.getElementById("transcript"))
  transcript.off("click");
  transcript.find(".selected-concept-text").removeClass("selected-concept-text")
  
  reattachTranscriptAnnotator();
  attachClickListenerOnConcepts();
  attachUpdateTimeListenerOnTranscript();
  attachPlayerKeyEvents();
  transcript.css("margin-top","0")
  $('#canvas-wrap, #relation, #transcript').undim({ fadeOutDuration: 300 });
}


function attachClickListenerOnConcepts(){
  $(document.getElementById("transcript")).on("click", ".concept", function (e) {

    let conceptElements = document.getElementsByClassName("concept");
  
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
      if (state == "desc")
        document.getElementById("conceptDescribed").value = ""
      return
    }
    
    if (state == "desc")
      document.getElementById("conceptDescribed").value = selectedConceptText;
    document.getElementById("transcript-selected-concept").innerHTML = selectedConceptText;
  
    let syns = $conceptVocabulary[selectedConceptText] || [];
    let synsText = syns.join(", ");
  
    document.getElementById("transcript-selected-concept-synonym").innerHTML = synsText || "--";
  
    $("#transcript").find("[concept]")
      .filter(function() {
        return $(this).attr("concept").includes(" "+selectedConcept+" ");
      })
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
}


function addSubtitles(){

  let transcriptDiv = document.getElementById("transcript");

  if($isTempTranscript)
    document.getElementById("temp-transcript-warning").style.display = "block";
  
  for (let x in $captions) {
    transcriptDiv.innerHTML +=
      '<p class=" sentence-marker " data-start="' + $captions[x].start + '" data-end="' + $captions[x].end + '">' +
        '<b class="timestamp"> ' + secondsToHms($captions[x].start) + ": </b>" + $lemmatizedSubs[x].text + '</p>';
  }
  
  // Add event listener for click to prevent time change on concept click
  attachUpdateTimeListenerOnTranscript()
  for(let i in $concepts)
    // Highlighting words
    highlightConcept($concepts[i],"")
  
  attachClickListenerOnConcepts()
}

function attachUpdateTimeListenerOnTranscript(){
  $(document.getElementById("transcript")).on('click', function (event) {
    clearAnnotatorVisualElements();
    if (event.target.classList.contains("concept"))
      return;

    // If not a concept, change the time
    let marker = event.target.closest('[lemma]');
    if (marker)
      player.currentTime(parseFloat(marker.getAttribute('start_time')));
  });
}


function initializeMarkers() {
  var elements = $("#transcript .sentence-marker").get();
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
  
  markers[0].forEach(function(marker) {

    if (parseFloat(marker.time_start)-1 < current_time & current_time < parseFloat(marker.time_end)+1) {
      marker.dom.classList.add("current-marker");

      // Cycle through child spans
      marker.dom.querySelectorAll('span').forEach(function(span) {
        span.classList.remove("current-marker");
        let spanStart = parseFloat(span.getAttribute('start_time'));
        let spanEnd = parseFloat(span.getAttribute('end_time'));
        if (spanStart-0.4 < current_time & current_time < spanEnd+0.4) {
          span.classList.add("current-marker");
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
      if (marker.dom.classList.contains("current-marker"))
        marker.dom.classList.remove("current-marker");
      marker.dom.querySelectorAll('span').forEach(function(span) {
        var classList = span.classList;
        if (classList.contains("current-marker"))
          classList.remove("current-marker");
      })
    }
  });

}

function highlightExplanationInTranscript(start, end) {

  let definition_start = typeof(start) == "string" ? timeToSeconds(start) : start
  let definition_end = typeof(end) == "string" ? timeToSeconds(end) : end

  let subtitleElements = $("#transcript .sentence-marker").get()//Array.from(document.querySelectorAll(class_field));
  
  // Iterate over each subtitle element to highlight the matching ones
  subtitleElements.forEach((element,index) => {
    element.querySelectorAll('span').forEach(function(word) {
      word.classList.remove('highlighted-text');
      wordStart = parseFloat(word.getAttribute('start_time'));
      wordEnd = parseFloat(word.getAttribute('end_time')) 
      if (wordStart >= definition_start & wordEnd <= definition_end)
        word.classList.add('highlighted-text');
    });
  });
}

function playExplanation(button, start, end) {
  if ($(button).hasClass("active")){
    $(".highlighted-text").removeClass("highlighted-text");
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
      $(".highlighted-text").removeClass("highlighted-text");
      player.off("timeupdate")
      player.on("timeupdate", function (){ UpdateMarkers(player.currentTime()) })
    }
  });
  highlightExplanationInTranscript(start,end)

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

function secondsToTimeCropped(d){
  str = secondsToHms(d)
  return str + "." + Number(d).toFixed(2).split(".")[1] || "0";
}

function secondsToTimeShorter(d){
  str = secondsToTimeCropped(d)
  return str.replace(/^0+:/, '').replace(/^0(\d)/, '$1'); 
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


function timeToSeconds(timeStr){
  // Regex to match hours:minutes:seconds.millis or minutes:seconds.millis or seconds.millis
  // matches all 3.53 and 3:3.53 and 3:03.53
  const HHmmSSms_pattern = /((?<hours>[1-9]|[0-1][1-9]|2[0-3]):)?((?<minutes>[0-9]|[0-5][0-9]):)(?<seconds>[0-9]|[0-5][0-9]).(?<millis>\d+)$/
  match = timeStr.match(HHmmSSms_pattern)
  
  if (!match){
    const SSms_pattern = /(?<seconds>[0-5]?[0-9]).(?<millis>\d+)$/
    match = timeStr.match(SSms_pattern)
    if (!match)
      return null
  }
  
  const hours = parseInt(match.groups.hours || 0);
  const minutes = parseInt(match.groups.minutes || 0);
  const seconds = parseInt(match.groups.seconds || 0);
  const millis = parseFloat(`0.${match.groups.millis || 0}`);
  
  return hours * 3600 + minutes * 60 + seconds + millis;
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