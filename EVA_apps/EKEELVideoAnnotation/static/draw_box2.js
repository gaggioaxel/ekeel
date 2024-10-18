

function deleteBox(conceptType){
    if(document.getElementById(conceptType+"Box") != null){
        let box = document.getElementById(conceptType+"Box");
        box.parentNode.removeChild(box);
    }
    $("#drawButton").text("Add Box").prop("disabled",false).css("cursor","pointer");
    $("#clearDrawButton").fadeOut("fast");
    $("#insertRelationButton").prop("disabled",false).css("cursor","pointer");
    player.controls(true);
}

function initDraw(conceptType) {

    $("html, body").animate({ scrollTop: $("#navbar").offset().top }, "slow");

    let classBox 
    if(conceptType=="target")
        classBox = "rectangleTarget"

    else if (conceptType=="prerequisite")
        classBox = "rectanglePrerequisite"

    let parentDiv = document.getElementById('canvas-wrap');

    let canvas = document.createElement("canvas");
    
    canvas.id = "canvasBox";

    parentDiv.prepend(canvas);

    //se già presente elimino box precedente
    deleteBox(conceptType)
    player.controls(false);

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
            $("#drawButton").text("Edit Box").prop("disabled",false).css("cursor","pointer");
            $("#clearDrawButton").fadeIn("fast");
            $("#insertRelationButton").prop("disabled",false).css("cursor","pointer");

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
            $("#helpAddBox").hide();
        }
    }
}

function removeCanvas(){
    if(document.getElementById("canvasBox") != null){
      let box = document.getElementById("canvasBox");
      box.parentNode.removeChild(box);
    } 
    deleteBox()
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