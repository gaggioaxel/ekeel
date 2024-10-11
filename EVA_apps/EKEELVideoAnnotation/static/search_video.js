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
  // Target the button associated with this video_id
  let button = $(`label[video=${video_id}] .btn-expanding.delete`);
  let statusButton = $(`label[video=${video_id}] .btn-expanding.status`);
  
  // Start the animation (e.g., fade out)
  button.fadeOut(300, function() {
    // Perform the AJAX request after the fadeOut
    $.ajax({
      url: '/annotator/delete_annotation',
      type: 'post',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ "video_id": video_id })
    }).done(function(result) {
      // After the AJAX call completes
    
      // Disable the delete button and the status button
      $(this).prop('disabled', true);
      statusButton.prop('disabled', true);
    
      // Optionally, remove the annotation status visually
      // Change the status button to reflect the annotation has been removed
      statusButton.fadeOut(300, function() {
        $(this).remove();
      });
      
      // Optionally remove the "Unannotate" button entirely
      $(this).remove();
    });
  });
}

//$(document).ready(function() {
//  $(window).keydown(function(event){
//    if( (event.keyCode == 13))  {
//      event.preventDefault();
//      return false;
//    }
//  });
//});