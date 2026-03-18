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
  modalInfo.classList.add("visible"); // CSS opacity fade-in?
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
let movedWrapper = null;
// remembers the original parent (archive-container) so we can return the wrapper to it
let originalParent = null;
// remembers the next sibling so the wrapper goes back in the exact same position in the DOM
let originalNextSibling = null;


// each image
images.forEach(wrapper => {

  wrapper.addEventListener("mousedown", function (e) {

    moved = false;

    topZ++;
    wrapper.style.zIndex = topZ;

    activeDrag = wrapper;
    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;

    e.preventDefault();
  });


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
      document.body.classList.add("modal-open"); // locks background when modal opens

      originalParent      = wrapper.parentNode;
      originalNextSibling = wrapper.nextSibling;

      // move wrapper out of archive-container and directly into <body>
      // blur filter on archive-container cannot reach it
      document.body.appendChild(wrapper);
      movedWrapper = wrapper;
      showModalInfo(wrapper);

    } else {

      // remove dim when collapsing
      overlay.classList.remove("active");
      archiveContainer.classList.remove("blurred");
      document.body.classList.remove("modal-open"); // unlock background scroll when modal closes

      returnWrapper();

      hideModalInfo();

    }

    activeDrag = null;

  });

});


// put expanded wrapper back where it came from
function returnWrapper() {
  if (movedWrapper && originalParent) {
    // insertBefore with a null nextSibling is the same as appendChild — handles both cases
    originalParent.insertBefore(movedWrapper, originalNextSibling);
  }
  movedWrapper        = null;
  originalParent      = null;
  originalNextSibling = null;
}


// move image -> mouse
document.addEventListener("mousemove", function (e) {
  if (!activeDrag) return;

  moved = true;

  activeDrag.style.left = (e.clientX - offsetX) + "px";
  activeDrag.style.top  = (e.clientY - offsetY) + "px";
});


// stop dragging
document.addEventListener("mouseup", function () {
  activeDrag = null;
});


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
  document.body.classList.remove("modal-open"); // unlocks background scroll when reset eye is clicked

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


// -------- CLICK OUTSIDE TO CLOSE --------

document.addEventListener("click", function (e) {

  const expanded = document.querySelector(".image-wrapper.expanded");
  if (!expanded) return;

  const clickedInsideImage = e.target.closest(".image-wrapper");
  if (clickedInsideImage === expanded) return;

  expanded.style.left = expanded.dataset.savedLeft || "";
  expanded.style.top  = expanded.dataset.savedTop  || "";

  expanded.classList.remove("expanded");

  // remove dim on outside click
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  document.body.classList.remove("modal-open"); // unlocks background scroll when clicking outside the modal

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
  document.body.classList.remove("modal-open"); // unlock background scroll when clicking the dim overlay

  returnWrapper();

  hideModalInfo(); // hide info panel when click the dim overlay 

});