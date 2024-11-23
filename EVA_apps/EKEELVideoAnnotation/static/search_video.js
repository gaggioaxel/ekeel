function search_video(){

  let input, filter, titles, a, i, txtValue;

  input = document.getElementById('searchbar');
  filter = input.value.toUpperCase();
  console.log(filter)

  titles = document.getElementsByClassName("video_title")

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < titles.length; i++) {

    txtValue = titles[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      titles[i].parentElement.style.display = "";
      console.log(txtValue.toUpperCase().indexOf(filter))
    } else {
      titles[i].parentElement.style.display = "none";
    }
  }

}

function deleteAnnotation(video_id){

  // Hide the box
  function closeConfirmBox() {
    $("#confirmEraseAnnotationBox").fadeOut(200, function() {
        $('body').css('overflow', 'auto'); // Ripristina lo scrolling
        $(this).remove()
    }).undim({ fadeOutDuration: 200 });
  }

  // Ceate confirm box
  $('<div></div>', {
    class: 'box',
    id: "confirmEraseAnnotationBox",
    css: {
        position: 'fixed',
        top: '40%',
        left: '48%',
        width: 'auto',
        height: 'auto',
        backgroundColor: 'white',
        border: '2px solid gray',
        borderRadius: '10px',
        transform: 'translate(-50%, -50%)',
        display: 'none',
        padding: '1em',
        textAlign: 'center'
    }
  }).appendTo('body');
  
  let box = $("#confirmEraseAnnotationBox")
  
  // Add confirmation text
  let title = $("<div><h2 style='margin: 1em;'>Are you sure you want to delete your annotations of this video?</h2></div>").css({
    margin: '0 0 1em',
    color: '#333'
  }).appendTo(box);
  $('<hr>').css("margin-bottom","3em").appendTo(title);


  // Clone the image, wrap it in a div, and append to box
  $(`<div></div>`).append($(`img[video=${video_id}]`).clone()).appendTo(title);

  $(`<div style="margin:2em 0;"></div>`).append($(`p[video=${video_id}]`).clone()).appendTo(title);
  $('<hr>').css("margin-bottom","5em").appendTo(title);

  // Create button container for symmetry
  const buttonsContainer = $("<div></div>").appendTo(title);

  // Add 'No' button
  $("<button class='btn btn-primary btn-addrelation btn-dodgerblue'>No</button>")
    .css({
      position: 'absolute',
      bottom: '2em',
      left: '5%'
    })
    .on("click", function() {
      closeConfirmBox() // Restore scroll on close
    })
    .appendTo(buttonsContainer);

  // Add 'Yes' button
  $("<button class='btn btn-primary btn-addrelation delete'>Yes</button>")
    .css({
      position: 'absolute',
      bottom: '2em',
      left: '81%'
    })
    .on("click", function() {
      closeConfirmBox()
      // Target the button associated with this video_id
      let button = $(`label[video=${video_id}] .btn-expanding.erase`);
      let statusButton = $(`label[video=${video_id}] .btn-expanding.status`);

      // Start the animation (e.g., fade out)
      statusButton.fadeOut(300, function() {
        // Perform the AJAX request after the fadeOut
        $.ajax({
          url: '/annotator/delete_annotation',
          type: 'post',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify({ "video_id": video_id })
        }).done(function(result) {
        
          $(button).fadeOut(300, function() {
            $(button).replaceWith('<span class="spacer"></span>');
          });

        });
      });
    })
    .appendTo(buttonsContainer);


  $('body').css('overflow', 'hidden');
  box.css({opacity: 0, display: 'flex'}).animate({
    opacity: 1
  }, 500).dimBackground({ darkness: bgDarknessOnOverlay });

}

function deleteVideo(video_id){

  // Hide the box
  function closeConfirmBox() {
    $("#confirmDeleteVideoBox").fadeOut(200, function() {
        $('body').css('overflow', 'auto'); // Ripristina lo scrolling
        $(this).remove()
    }).undim({ fadeOutDuration: 200 });
  }

  // Ceate confirm box
  $('<div></div>', {
    class: 'box',
    id: "confirmDeleteVideoBox",
    css: {
        position: 'fixed',
        top: '40%',
        left: '48%',
        width: 'auto',
        height: 'auto',
        backgroundColor: 'white',
        border: '2px solid gray',
        borderRadius: '10px',
        transform: 'translate(-50%, -50%)',
        display: 'none',
        padding: '1em',
        textAlign: 'center'
    }
  }).appendTo('body');
  
  let box = $("#confirmDeleteVideoBox")
  
  // Add confirmation text
  let title = $("<div><h2 style='margin: 1em;'>Are you sure you want to delete this video?</h2></div>").css({
    margin: '0 0 1em',
    color: '#333'
  }).appendTo(box);
  $('<hr>').css("margin-bottom","3em").appendTo(title);


  // Clone the image, wrap it in a div, and append to box
  $(`<div></div>`).append($(`img[video=${video_id}]`).clone()).appendTo(title);

  $(`<div style="margin:2em 0;"></div>`).append($(`p[video=${video_id}]`).clone()).appendTo(title);
  $('<hr>').css("margin-bottom","5em").appendTo(title);

  // Create button container for symmetry
  const buttonsContainer = $("<div></div>").appendTo(title);

  // Add 'No' button
  $("<button class='btn btn-primary btn-addrelation btn-dodgerblue'>No</button>")
    .css({
      position: 'absolute',
      bottom: '2em',
      left: '5%'
    })
    .on("click", function() {
      closeConfirmBox() // Restore scroll on close
    })
    .appendTo(buttonsContainer);

  // Add 'Yes' button
  $("<button class='btn btn-primary btn-addrelation delete'>Yes</button>")
    .css({
      position: 'absolute',
      bottom: '2em',
      left: '81%'
    })
    .on("click", function() {
      closeConfirmBox()
      $.ajax({
          url: '/annotator/delete_video',
          type : 'post',
          contentType: 'application/json',
          dataType : 'json',
          data: JSON.stringify({"video_id":video_id})
        }).done(function(result) {
          if(result.done) {
            console.log("removed")
          }
        }
      )
      $(`label.video_radio[video=${video_id}]`).fadeOut(600, function() { 
        if ($(this).closest(".creator-group").find("label.video_radio").length == 1) {
          $(this).closest(".creator-group").remove(); // Remove container if empty
        } else
          $(this).remove();
      })
    })
    .appendTo(buttonsContainer);


  $('body').css('overflow', 'hidden');
  box.css({opacity: 0, display: 'flex'}).animate({
    opacity: 1
  }, 500).dimBackground({ darkness: bgDarknessOnOverlay });
  // Show box and disable scrolling
  //box.fadeIn(200, function() {
  //  $('body').css('overflow', 'hidden'); // Disabilita lo scrolling
  //}).dimBackground({ darkness: bgDarknessOnOverlay });

}

//$(document).ready(function() {
//  $(window).keydown(function(event){
//    if( (event.keyCode == 13))  {
//      event.preventDefault();
//      return false;
//    }
//  });
//});