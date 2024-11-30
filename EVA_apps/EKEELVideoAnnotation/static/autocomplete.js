
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("prerequisite")) {
    autocomplete(document.getElementById("prerequisite"), $concepts, []);
  }

  if (document.getElementById("conceptDescribed")) {
    autocomplete(document.getElementById("conceptDescribed"), $concepts, []);
  }

  if (document.getElementById("selectSynonymSet")) {
    autocomplete(document.getElementById("selectSynonymSet"), $concepts, []);
  }

  if (document.getElementById("synonymWord")) {
    autocomplete(document.getElementById("synonymWord"), $concepts, []);
  }

  if (document.getElementById("searchbar")) {
    autocomplete(document.getElementById("searchbar"), $(".video_title").map((_, elem) => elem.innerText).get(), []);
  }
});

function autocomplete(inp, arr, classes) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  if(inp !== null) {
    inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.style.display = 'none';
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      for(let cls of classes) {
        a.className += " " + cls;
      } 
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      let counter = 0;
      for (let i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].toLowerCase().includes(val.toLowerCase())) {

          counter++;
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          let indices = [arr[i].toLowerCase().indexOf(val.toLowerCase()), arr[i].toLowerCase().indexOf(val.toLowerCase())+val.length]
          b.innerHTML = arr[i].slice(0,indices[0]) + `<strong>${arr[i].slice(indices[0],indices[1])}</strong>` + arr[i].slice(indices[1]);
          //b.innerHTML = b.innerHTML.replace(val.toLowerCase(), `<strong>${val.toLowerCase()}</strong>`)
          //b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              if(inp.id == "selectSynonymSet")
                selectSynonymSet()
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }

      if (counter != 0)
        $(a).fadeIn() 

    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          e.preventDefault()
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          e.preventDefault()
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          //e.preventDefault();
          /*and simulate a click on the "active" item:*/
          if (x && x[currentFocus]){
            inp.value = x[currentFocus].innerText
          }
          closeAllLists()
        }
    });
  }
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    let scrollParentOnlyIfScrollable = function (element) {
      const parent = element.parentElement;
      
      if (parent && parent.scrollHeight > parent.clientHeight) {
          // Get the parent's scrollable offset and the element's offset within the parent
          const parentRect = parent.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
  
          // Calculate how much the parent needs to scroll to make the element visible
          const offsetTop = elementRect.top - parentRect.top + parent.scrollTop;
          const offsetBottom = elementRect.bottom - parentRect.bottom + parent.scrollTop;
  
          // Scroll the parent smoothly if the element is outside the visible area
          if (elementRect.top < parentRect.top) {
              parent.scrollTo({ top: offsetTop, behavior: "smooth" });
          } else if (elementRect.bottom > parentRect.bottom) {
              parent.scrollTo({ top: offsetBottom, behavior: "smooth" });
          }
      }
    }
  
    // Example usage
    scrollParentOnlyIfScrollable(x[currentFocus]);
    //x[currentFocus].scrollIntoView({ behavior: "smooth", inline: "center" });
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");

  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}
