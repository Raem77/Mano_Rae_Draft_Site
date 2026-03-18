// all image in containers
const images = document.querySelectorAll(".image-wrapper");

let topZ = 10;        
let activeDrag = null; 
let offsetX = 0;
let offsetY = 0;
let moved = false;   


//////////-------------------  MODAL INFO PANEL -------------------/////////////////////////

// modal content ->
const modalInfo  = document.getElementById("modalInfo");
const modalTitle = document.getElementById("modalTitle");
const modalDate  = document.getElementById("modalDate");
const modalDesc  = document.getElementById("modalDesc");
 
// modal window info
function showModalInfo(wrapper) {
  modalTitle.textContent = wrapper.dataset.title || "";
  modalDate.textContent  = wrapper.dataset.date  || "";
  modalDesc.textContent  = wrapper.dataset.desc  || "";
  modalInfo.classList.add("visible"); // CSS opacity fade-in
}
 
// hide modal info panel
function hideModalInfo() {
  modalInfo.classList.remove("visible");
  // clear text after the fade-out transition finishes (0.3s)
  setTimeout(() => {
    modalTitle.textContent = "";
    modalDate.textContent  = "";
    modalDesc.textContent  = "";
  }, 300);
}


/////////// <div class="overlay" id="overlay"></div>/////////////

const overlay = document.getElementById("overlay");
const archiveContainer = document.querySelector(".archive-container");
const bgBlur = document.getElementById("bgBlur"); // grabs the dedicated background blur div

let movedWrapper = null;
// remembers the original parent (archive-container) so we can return the wrapper to it
let originalParent = null;
// remembers the next sibling so the wrapper goes back in the exact same position in the DOM
let originalNextSibling = null;

// call when drag starts —> records starting position and which wrapper is being dragged
function startDrag(wrapper, clientX, clientY) {
  moved = false;
  topZ++;
  wrapper.style.zIndex = topZ;
  activeDrag = wrapper;
  offsetX = clientX - wrapper.offsetLeft; //////// distance mouse/finger to left edge of image
  offsetY = clientY - wrapper.offsetTop;  //////// distance mouse/finger to top edge of image
}

// repositions the active wrapper
function moveDrag(clientX, clientY) {
  if (!activeDrag) return;
  moved = true;
  activeDrag.style.left = (clientX - offsetX) + "px";
  activeDrag.style.top  = (clientY - offsetY) + "px";
}

// call when the drag end -> clear the active drag reference
function endDrag() {
  activeDrag = null;
}

// each image
images.forEach(wrapper => {

  //////////////////---------------- MOUSE DRAG (desktop)----------------------///////////////////////
  // calls the shared startDrag helper
  wrapper.addEventListener("mousedown", function (e) {
    startDrag(wrapper, e.clientX, e.clientY);
    e.preventDefault();
  });

  //////////////////---------------- TOUCH DRAG (mobile)----------------------///////////////////////
  // touchstart listener = images drag
  // { passive: true } tells the browser this listener won't block scrolling
  wrapper.addEventListener("touchstart", function (e) {
    const touch = e.touches[0]; // get the first touch point
    startDrag(wrapper, touch.clientX, touch.clientY);
  }, { passive: true });


  // -------------- expand/collapse -------------------------//
  wrapper.addEventListener("click", function () {

    if (moved) return;

    images.forEach(img => {
      if (img !== wrapper) {
        img.classList.remove("expanded");
      }
    });

    wrapper.style.left = "";
    wrapper.style.top  = "";

    wrapper.classList.toggle("expanded");

    if (wrapper.classList.contains("expanded")) {

      topZ++;
      wrapper.style.zIndex = topZ;

      // activate dim background
      overlay.classList.add("active");
      archiveContainer.classList.add("blurred");
      bgBlur.classList.add("active");           
      document.body.classList.add("modal-open"); 

      originalParent      = wrapper.parentNode;
      originalNextSibling = wrapper.nextSibling;

      document.body.appendChild(wrapper);
      movedWrapper = wrapper;
      showModalInfo(wrapper);

    } else {

      // remove dim when collapsing
      overlay.classList.remove("active");
      archiveContainer.classList.remove("blurred");
      bgBlur.classList.remove("active");             
      document.body.classList.remove("modal-open");   

      returnWrapper();
      hideModalInfo();

    }

    activeDrag = null;

  });

});

// put expanded wrapper back 
function returnWrapper() {
  if (movedWrapper && originalParent) {
    originalParent.insertBefore(movedWrapper, originalNextSibling);
  }
  movedWrapper        = null;
  originalParent      = null;
  originalNextSibling = null;
}




// move image -> mouse
document.addEventListener("mousemove", function (e) {
  moveDrag(e.clientX, e.clientY);
});

// stop dragging
document.addEventListener("mouseup", endDrag);

document.addEventListener("touchmove", function (e) {
  const touch = e.touches[0]; // first touch point
  moveDrag(touch.clientX, touch.clientY);
}, { passive: true }); // keeps scrolling (mobile)

document.addEventListener("touchend", endDrag); // end drag when finger lift


////////////////////// ---------------- RESET EYE ----------------//////////////////////////////////////

const resetEye = document.getElementById("resetEye"); 

resetEye.addEventListener("click", function () {      

  resetEye.src = resetEye.dataset.closed;

  images.forEach(wrapper => {
    wrapper.style.opacity = "0.4";
  });

  // overlay off
  // image expanded, user clicks reset = dim disappears
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");             
  document.body.classList.remove("modal-open");  

  // return the wrapper to archive-container before resetting positions
  returnWrapper();

  setTimeout(() => {

    topZ = 10;

    images.forEach(wrapper => {

      wrapper.classList.remove("expanded");

      wrapper.style.left    = "";
      wrapper.style.top     = "";
      wrapper.style.zIndex  = "";
      wrapper.style.opacity = "1";

    });

    resetEye.src = resetEye.dataset.open;

  }, 400);

  hideModalInfo();

});


// -------- CLICK OUTSIDE TO CLOSE -------- //

document.addEventListener("click", function (e) {

  const expanded = document.querySelector(".image-wrapper.expanded");
  if (!expanded) return;

  const clickedInsideImage = e.target.closest(".image-wrapper");
  if (clickedInsideImage === expanded) return;

  // ignores click on the modal info panel 
  const clickedInfo = e.target.closest("#modalInfo");
  if (clickedInfo) return;

  expanded.style.left = expanded.dataset.savedLeft || "";
  expanded.style.top  = expanded.dataset.savedTop  || "";

  expanded.classList.remove("expanded");

  // remove dim on outside click
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");              
  document.body.classList.remove("modal-open");   

  returnWrapper();

  hideModalInfo(); // hides the info panel when click outside image

});


//////////////////////////// Clicking on the dim background also closes image////////////////////////////////////////

overlay.addEventListener("click", function () {

  const expanded = document.querySelector(".image-wrapper.expanded");
  if (!expanded) return;

  expanded.classList.remove("expanded");
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");              
  document.body.classList.remove("modal-open"); 

  returnWrapper();

  hideModalInfo(); // hide info panel when click the dim overlay 

});