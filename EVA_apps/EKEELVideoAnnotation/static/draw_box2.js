

let video = document.getElementById("video-active")

function deleteBox(conceptType){
    if(document.getElementById(conceptType+"Box") != null){
        let box = document.getElementById(conceptType+"Box");
        box.parentNode.removeChild(box);
        $("#drawButton").get()[0].innerText = "Add Box";
        $("#clearDrawButton").fadeOut("slow");
    }
}

function initDraw(conceptType) {

    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

    player.controls(false);
    //video.pause()
    let classBox 
    if(conceptType=="target")
        classBox = "rectangleTarget"

    else if (conceptType=="prerequisite")
        classBox = "rectanglePrerequisite"

    let parentDiv = document.getElementById('canvas-wrap');

    let canvas = document.createElement("canvas");
    
    canvas.id = "canvasBox"

    parentDiv.prepend(canvas);

    //se già presente elimino box precedente
    deleteBox(conceptType)

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    
    
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX + window.pageXOffset - $('#canvas-wrap').offset().left;
            mouse.y = ev.pageY + window.pageYOffset - $('#canvas-wrap').offset().top;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft - $('#canvas-wrap').offset().left;
            mouse.y = ev.clientY + document.body.scrollTop  - $('#canvas-wrap').offset().top;
        }

    };


    var element = null;

    canvas.onmousemove = function (e) {
        setMousePosition(e);

        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    canvas.onmouseover = function (e){
        canvas.style.cursor = "crosshair"
    }

    canvas.onclick = function (e) {

        if (element !== null) {
            //end position = mouse.x, mouse.y

            element = null;

            canvas.style.cursor = "default";
            canvas.remove()
            $("#drawButton").get()[0].disabled = false;
            $("#drawButton").get()[0].innerText = "Edit Box";
            $("#clearDrawButton").fadeIn("fast");
            player.controls(true)

        } else {
            //start position
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('div');
            element.className = classBox
            element.id = conceptType+"Box"
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            parentDiv.appendChild(element)
            canvas.style.cursor = "crosshair";
            $("#drawButton").get()[0].innerText = "Drawing...";
            $("#drawButton").get()[0].disabled = true;
        }
    }
}

function removeCanvas(){
    if(document.getElementById("canvasBox") != null){
      let box = document.getElementById("canvasBox");
      box.parentNode.removeChild(box);
  }
}