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

$(document).ready(function() {
  $(window).keydown(function(event){
    if( (event.keyCode == 13))  {
      event.preventDefault();
      return false;
    }
  });
});