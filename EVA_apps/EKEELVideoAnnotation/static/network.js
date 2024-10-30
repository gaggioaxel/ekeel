function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj,null,2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function downloadManuGraphAsJson(){

    //console.log("***** EKEEL - Video Annotation: create_graph.js::downloadManuGraphAsJson(): Inizio *****")

    let annotations = {
        "id": $video_id,
        "relations":relations,
        "definitions": definitions,
        "annotator": $annotator,
        "conceptVocabulary": $conceptVocabulary,
        "language": $language,
    }

    var js_data = JSON.stringify(annotations);

    $.ajax({
        url: '/annotator/download_graph',
        type : 'post',
        contentType: 'application/json',
        dataType : 'json',
        data : js_data
    }).done(function(result) {
        //console.log(result)
        downloadObjectAsJson(result, "graph");
    })    
}

function uploadManuGraphOnDB(){

    let annotations = {
        "id": $video_id,
        "relations":relations,
        "definitions": definitions,
        "annotator": $annotator,
        "conceptVocabulary": $conceptVocabulary,
        "language": $language,
        "is_completed": isCompleted
    }
    //savedText = document.getElementById("saveGraphText")
    //savedText.style.display = "block"
    //console.log("uploadGraphOnDB")

    var js_data = JSON.stringify(annotations);

    $.ajax({
        url: '/annotator/upload_graph',
        type : 'post',
        contentType: 'application/json',
        dataType : 'json',
        data : js_data
    }).done(function(result) {
        //console.log(result)
        //if(result.done == true) {
        //    savedText.textContent = "Saved graph successfully!"
        //    savedText.style.color = "green";
        //    savedText.style.display = "block";
        //    setTimeout(function() { 
        //        savedText.textContent = "Saving graph...";
        //        savedText.style.color = "black";
        //        savedText.style.display = "none";
        //
        //    } ,2000)
        //}
    })
}