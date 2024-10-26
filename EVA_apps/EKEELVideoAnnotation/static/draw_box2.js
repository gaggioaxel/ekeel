function deleteBox(conceptType){
    $("#"+conceptType+"Box").remove()
    box = null
    $("#drawButton").text("Add Box").prop("disabled",false).css("cursor","pointer");
    $("#clearDrawButton").fadeOut("fast");
    $("#insertRelationButton").prop("disabled",false).css("cursor","pointer");
    $("#canvasBox").remove()
    player.controls(true);
}

function initDraw(conceptType) {

    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

    let classBox 
    if(conceptType=="target")
        classBox = "rectangleTarget"

    else if (conceptType=="prerequisite")
        classBox = "rectanglePrerequisite"
    
    //se già presente elimino box precedente
    deleteBox(conceptType)
    player.controls(false);

    let parentDiv = document.getElementById('canvas-wrap');

    let canvas = document.createElement("canvas");
    
    canvas.id = "canvasBox";

    parentDiv.prepend(canvas);

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    
    $("#drawButton").text("Drawing...").prop("disabled",true).css("cursor","not-allowed");
    $("#insertRelationButton").prop("disabled",true).css("cursor","not-allowed");

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

    if( typeof(box) == "undefined" )
        box = null
    else if( box != null )
        box.remove()
    

    canvas.onmousemove = function (e) {
        setMousePosition(e);

        if (box !== null) {
            box.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            box.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            box.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            box.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    canvas.onmouseover = function (e){
        canvas.style.cursor = "crosshair"
    }

    canvas.onclick = function (e) {

        if (box !== null) {
            //end position = mouse.x, mouse.y

            box = null;
            canvas.style.cursor = "default";
            canvas.remove()
            $("#drawButton").text("Redo Box").prop("disabled",false).css("cursor","pointer");
            $("#clearDrawButton").fadeIn("fast");
            $("#insertRelationButton").prop("disabled",false).css("cursor","pointer");

        } else {
            //start position
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            box = document.createElement('div');
            box.className = classBox
            box.id = conceptType+"Box"
            box.style.left = mouse.x + 'px';
            box.style.top = mouse.y + 'px';
            parentDiv.appendChild(box)
            canvas.style.cursor = "crosshair";
            $("#helpAddBox").hide();
        }
    }
}

function removeCanvas(){
    $("#canvasBox").remove()
    deleteBox("target")
}


function showDrawTutorial(){
    $("#helpAddBox").addClass("active")
    removeCanvas();
    $("#drawButton").text("Add Box").prop("disabled",false).css("cursor","pointer");
    $("#clearDrawButton").fadeOut("fast");
    $("#insertRelationButton").prop("disabled",false).css("cursor","pointer");
    player.controls(false);
    let parentDiv = document.getElementById('canvas-wrap');
    let canvas = document.createElement("canvas");
    let parent_size = document.getElementById('canvas-wrap').getBoundingClientRect()
    canvas.width = parent_size.width;
    canvas.height = parent_size.height;
    
    let ctx = canvas.getContext("2d");
    
    canvas.id = "canvasBox";
    parentDiv.prepend(canvas);

    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    function easeInOutCirc(x) {
        return x < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
        
    }

    function easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;    
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    function easeOutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);    
    }



    function drawRect(circle){
    
        // Set the trajectory
        startX = circle.x;
        startY = circle.y;
        endX = canvas.width/6*5;
        endY = canvas.height/4*3;
    
        let t = 0;
        rect.x = startX;
        rect.y = startY;
        let timer = null;
        let trigger_start = false
    
        // Move point diagonally
        let diagonalizer = setInterval(() => {

            if(!trigger_start){
                t = 0;
                setTimeout(() => {
                    trigger_start = true;
                }, 800)
            }
    
            // Clear the canvas
            ctx.clearRect(rect.x-100, rect.y-100, rect.w+200, rect.h+200);
    
            // Draw the point
            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.strokeStyle = "dodgerblue";
            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle="red";
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.stroke();
    
            // Update the coordinates
            rect.w = easeOutBack(t)*(endX-startX)
            rect.h = easeOutBack(t)*(endY-startY)
            
            circle.x = startX + easeOutBack(t)*(endX-startX)
            circle.y = startY + easeOutBack(t)*(endY-startY)

            // Update the radius for the pulsing effect
            circle.radius += circle.pulseDirection * 1.1;
            if (circle.radius >= 20 || circle.radius <= 10) {
                circle.pulseDirection *= -1; // Reverse the direction when reaching size limits
            }
            t = clamp(t+0.01)

            // Stop the animation when the point reaches the end
            if (t >= 1 && timer==null) {
                timer = setTimeout(() => {
                    clearInterval(diagonalizer);
                    clickPointer(circle,1);
                }, 1200);
            }
    
        }, 40);
    }

    function clickPointer(circle,phase){
        circle.pulseDirection = 1;
        let alpha = 1;
        let t = 0;
        let timer = null;
        
        if (phase==0) {
            
            // Move point diagonally with pulsing effect
            let pointerClick = setInterval(() => {

                // Clear the canvas
                ctx.clearRect(circle.x-100, circle.y-100, 200, 200);
            
                // Draw the pulsing point
                ctx.beginPath();
                ctx.lineWidth = 2+t/10;
                ctx.strokeStyle = `rgba(30,144,255,${alpha})`;
                ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                ctx.stroke();
                
                // Expand the radius
                circle.radius += circle.pulseDirection * 4;
                alpha = 1-easeOutExpo(t); 
                t = clamp(t+0.05);

                // Stop the animation when the point reaches the end
                if (t >= 1 && timer==null) {
                    timer = setTimeout(() => {
                        clearInterval(pointerClick);
                        circle.radius = 10;
                        drawRect(circle);
                    }, 150);
                }

            }, 40); 

        } else {

            // Move point diagonally with pulsing effect
            let pointerClick = setInterval(() => {

                // Clear the canvas
                ctx.clearRect(rect.x-100, rect.y-100, rect.w+200, rect.h+200);
            
                // Draw the pulsing point
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(30,144,255,${alpha})`;
                ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle="red";
                ctx.rect(rect.x, rect.y, rect.w, rect.h);
                ctx.stroke();
                
                // Expand the radius
                circle.radius += circle.pulseDirection * 4;
                alpha = 1-easeOutExpo(t); 
                t = clamp(t+0.05);

                // Stop the animation when the point reaches the end
                if (t >= 1 && timer==null) {
                    timer = setTimeout(() => {
                        clearInterval(pointerClick);
                        removeCanvas();
                        player.controls(true);
                        $("#helpAddBox").removeClass("active");
                    }, 1500);
                }

            }, 40); 
            
        }
    }

    function movePointer(circle){
        let startX = canvas.width;
        let startY = canvas.height/6;
        let endX = canvas.width/6;
        let endY = canvas.height/4;

        let t = 0;
        let timer = null;
        circle.x = startX;
        circle.y = startY;

        // Move point diagonally with pulsing effect
        let pointerMover = setInterval(() => {

            // Stop the animation when the point reaches the end
            if (t >= 1 && timer==null) {
                timer = setTimeout(() => {
                    clearInterval(pointerMover);
                    clickPointer(circle,0);
                }, 1000);
            }
            
            // Clear the canvas
            ctx.clearRect(circle.x-100, circle.y-100, 200, 200);

            circle.x = startX + easeInOutCirc(t)*(endX-startX)
            circle.y = startY + easeInOutCirc(t)*(endY-startY)
    
            // Update the radius for the pulsing effect
            circle.radius += circle.pulseDirection * 1.05;
            if (circle.radius >= 20 || circle.radius <= 10) {
                circle.pulseDirection *= -1; // Reverse the direction when reaching size limits
            }
            t = clamp(t+0.015);
    
            // Draw the pulsing point
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "dodgerblue";
            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            ctx.stroke();
    
        }, 40); 
    }

    const circle = {
        x: 0,
        y: 0,
        radius: 10,
        pulseDirection: 1
    }

    const rect = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };

    movePointer(circle)
}

function clearAnnotatorVisualElements(){
    $("#canvasBox").remove()
    if(typeof(box) != "undefined" && box!=null) {
        box.remove()
        box = null
    }
    $(".visual-effect.active").removeClass("active");
    player.controls(true);
}

function toggleBoundingBox(element){
    let index = parseInt($(element).parents("tr:first").attr("index"))
    let activeElement = $(".icon-button.expand.active");
    clearAnnotatorVisualElements();
    if (activeElement.length != 0){
        // same element => user is deselecting 
        if (parseInt($(activeElement).parents("tr:first").attr("index")) == index){
            player.currentTime(prevTime);
            player.controls(true);
            $(element).removeClass("active");
            box = null
            return
        }
    }

    $(element).addClass("active")
    let parentDiv = document.getElementById('canvas-wrap');
    let canvas = document.createElement("canvas");
    canvas.id = "canvasBox";
    canvas.style.display = "none";

    // Append the canvas to the parent and move the video inside the canvas
    parentDiv.prepend(canvas);

    // Set the canvas dimensions to match the video's size
    let videoActive = document.getElementById('video-active');
    canvas.style.top = videoActive.offsetTop + 'px';
    canvas.style.left = videoActive.offsetLeft + 'px';
    canvas.style.width = videoActive.offsetWidth + 'px';
    canvas.style.height = videoActive.offsetHeight + 'px';

    let canvasRect = {
        x: videoActive.offsetLeft,
        y: videoActive.offsetTop,
        w: videoActive.offsetWidth,
        h: videoActive.offsetHeight
    };

    let xywhPercent = relations[index].xywh.split(":")[1].split(',').map(Number).map(a => a/100);
    let relation = $(element).parents("tr:first").find("td").get();
    //let concept = relation[0].innerText
    //let prerequisite = relation[1].innerText
    let start_time = timeToSeconds(relation[3].innerText);
    prevTime = player.currentTime();
    player.play();
    player.pause();
    player.currentTime(start_time);
    player.controls(false);

    box = document.createElement('div');
    box.className = "rectangleTarget";
    box.id = "targetBox"
    box.style.display = "none";
    box.style.left = Math.floor(canvasRect.x + canvasRect.w*xywhPercent[0]) + 'px';
    box.style.top = Math.floor(canvasRect.y + canvasRect.h*xywhPercent[1]) + 'px';
    box.style.width = Math.floor(canvasRect.w*xywhPercent[2]) + 'px';
    box.style.height = Math.floor(canvasRect.h*xywhPercent[3]) + 'px';
    parentDiv.appendChild(box)

    $(canvas).fadeIn("slow")
    $(box).fadeIn("slow")

    // Animate the outline using the Web Animations API
    box.animate([
        { outline: '1px solid #FF0000' }, // Start state
        { outline: '5px solid #FF0000' },  // End state
        { outline: '3px solid #FF0000' }
    ], {
        duration: 700,  // Animation duration in milliseconds
        iterations: Infinity, // Repeat the animation indefinitely
        direction: 'alternate' // Alternate between the states
    });

    window.scrollTo({
        top: canvas.offsetTop-50,
        behavior: 'smooth'
      });
}

function afterAddBoundingBox(element){

    // removes the eventual visual elements
    let index = parseInt($(element).parents("tr:first").attr("index"))
    let relation = $(element).parents("tr:first").find("td").get();

    showRelationDiv();
    $("#newRelationTitle").text("Edit Relation").get()[0].parentElement.children[1].style.display ="none";

    $("#prerequisite").prop("value", relation[1].innerText).prop("readonly",true);
    $("#targetSelector").prop("value", relation[0].innerText).prop("readonly",true);

    function revertChanges(){
        $("#newRelationTitle").text("Add Relation") // change back title text
                              .get()[0].parentElement.children[1].style.display ="block"; //show again the hint
        $("#prerequisite").prop("readonly",false);
        $("#targetSelector").prop("readonly",false);
        $("button.clone").remove()
        $("#insertRelationButton").show()
        $("#closeRelationButton").show()
        clearAnnotatorVisualElements();
    }

    let clonedAddRelationButton = $("#insertRelationButton").clone(false)
                                        .addClass("clone")
                                        .removeAttr("onclick") // Clone without events
                                        .text("Save Changes")
                                        .on("click", function(){
                                            addRelation(index);
                                            revertChanges();
                                        }); 
    $("#insertRelationButton").hide()
                             .parent()
                             .append(clonedAddRelationButton);

    let clonedCloseButton = $("#closeRelationButton").clone(false)
                                                     .addClass("clone")
                                                     .removeAttr("onclick")
                                                     .on("click", function() {
                                                        closeRelationDiv();
                                                        revertChanges();
                                                    })
    $("#closeRelationButton").hide()
                             .parent()
                             .append(clonedCloseButton);

}

function afterEditBoundingBox(element){
    afterAddBoundingBox(element);
    let helpButton = $("#helpAddBox")
    let prevStateHelpButton = helpButton.css("display")
    helpButton.hide()
    $("button.clone").on("click", function(){
        if (prevStateHelpButton == "block")
            helpButton.show()
    })
    $("#drawButton").text("Redo Box").prop("disabled",false).css("cursor","pointer");
    $("#clearDrawButton").show();
    toggleBoundingBox(element.parentElement.children[0])
}