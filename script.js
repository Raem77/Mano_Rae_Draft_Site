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
  modalInfo.classList.add("visible");
}
 
// hide modal info panel
function hideModalInfo() {
  modalInfo.classList.remove("visible");
  setTimeout(() => {
    modalTitle.textContent = "";
    modalDate.textContent  = "";
    modalDesc.textContent  = "";
  }, 300);
}


/////////// overlay + container ///////////

const overlay          = document.getElementById("overlay");
const archiveContainer = document.querySelector(".archive-container");
const bgBlur           = document.getElementById("bgBlur");

let movedWrapper        = null;
let originalParent      = null;
let originalNextSibling = null;


/////////////////////// DRAG HELPERS ////////////////

function startDrag(wrapper, clientX, clientY) {
  moved = false;
  topZ++;
  wrapper.style.zIndex = topZ;
  activeDrag = wrapper;
  offsetX = clientX - wrapper.offsetLeft;
  offsetY = clientY - wrapper.offsetTop;
}

function moveDrag(clientX, clientY) {
  if (!activeDrag) return;
  moved = true;
  activeDrag.style.left = (clientX - offsetX) + "px";
  activeDrag.style.top  = (clientY - offsetY) + "px";
}

function endDrag() {
  activeDrag = null;
}


///////////////-------------- EACH IMAGE ----------------------///////////////////

images.forEach(wrapper => {

  // mouse drag (desktop)
  wrapper.addEventListener("mousedown", function (e) {
    startDrag(wrapper, e.clientX, e.clientY);
    e.preventDefault();
  });

  // touch drag (mobile)
  wrapper.addEventListener("touchstart", function (e) {
    const touch = e.touches[0];
    startDrag(wrapper, touch.clientX, touch.clientY);
  }, { passive: true });


  // click / tap to expand
  wrapper.addEventListener("click", function () {

    if (moved) return;

    // collapse any other expanded image first
    images.forEach(img => {
      if (img !== wrapper) img.classList.remove("expanded");
    });

    wrapper.style.left = "";
    wrapper.style.top  = "";

    wrapper.classList.toggle("expanded");

    if (wrapper.classList.contains("expanded")) {

      topZ++;
      wrapper.style.zIndex = topZ;

      overlay.classList.add("active");
      archiveContainer.classList.add("blurred");
      bgBlur.classList.add("active");
      document.body.classList.add("modal-open");

      originalParent      = wrapper.parentNode;
      originalNextSibling = wrapper.nextSibling;

      // move wrapper out of archive-container into <body>
      document.body.appendChild(wrapper);
      movedWrapper = wrapper;

      wrapper.style.left   = "";
      wrapper.style.top    = "";
      wrapper.style.width  = "";
      wrapper.style.filter = "none"; // expanded image to be unblurred
                                    

      if (window.innerWidth <= 768) {
        modalInfo.style.top       = "56vh";
        modalInfo.style.left      = "5vw";
        modalInfo.style.transform = "none";
        modalInfo.style.width     = "90vw";
        modalInfo.style.padding   = "20px";
      } else {
        // reset to desktop CSS values 
        modalInfo.style.top       = "";
        modalInfo.style.left      = "";
        modalInfo.style.transform = "";
        modalInfo.style.width     = "";
        modalInfo.style.padding   = "";
      }

      showModalInfo(wrapper);

    } else {

      overlay.classList.remove("active");
      archiveContainer.classList.remove("blurred");
      bgBlur.classList.remove("active");
      document.body.classList.remove("modal-open");

      // clear the inline modal-info styles when close
      modalInfo.style.top       = "";
      modalInfo.style.left      = "";
      modalInfo.style.transform = "";
      modalInfo.style.width     = "";
      modalInfo.style.padding   = "";

      returnWrapper();
      hideModalInfo();
    }

    activeDrag = null;
  });

});


////////////// ------------ RETURN WRAPPER ---------///////////

function returnWrapper() {
  if (movedWrapper && originalParent) {
    originalParent.insertBefore(movedWrapper, originalNextSibling);
  }

  if (movedWrapper) {
    movedWrapper.style.left   = "";
    movedWrapper.style.top    = "";
    movedWrapper.style.width  = "";
    movedWrapper.style.filter = "";
  }
  movedWrapper        = null;
  originalParent      = null;
  originalNextSibling = null;
}


// mouse move // 

document.addEventListener("mousemove", function (e) {
  moveDrag(e.clientX, e.clientY);
});

document.addEventListener("mouseup", endDrag);


// touch move //

document.addEventListener("touchmove", function (e) {
  const touch = e.touches[0];
  moveDrag(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener("touchend", endDrag);


///////////------------------- RESET EYE ------------------///////////

const resetEye = document.getElementById("resetEye"); 

resetEye.addEventListener("click", function () {      

  resetEye.src = resetEye.dataset.closed;

  images.forEach(wrapper => {
    wrapper.style.opacity = "0.4";
  });

  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");
  document.body.classList.remove("modal-open");

  modalInfo.style.top       = "";
  modalInfo.style.left      = "";
  modalInfo.style.transform = "";
  modalInfo.style.width     = "";
  modalInfo.style.padding   = "";

  returnWrapper();

  setTimeout(() => {

    topZ = 10;

    images.forEach(wrapper => {
      wrapper.classList.remove("expanded");
      wrapper.style.left    = "";
      wrapper.style.top     = "";
      wrapper.style.zIndex  = "";
      wrapper.style.opacity = "";
      wrapper.style.filter  = ""; // clear filter on reset
    });

    resetEye.src = resetEye.dataset.open;

  }, 400);

  hideModalInfo();
});


// ----------------------------- CLICK OUT --------------------------------------------

document.addEventListener("click", function (e) {

  const expanded = document.querySelector(".image-wrapper.expanded");
  if (!expanded) return;

  const clickedInsideImage = e.target.closest(".image-wrapper");
  if (clickedInsideImage === expanded) return;

  const clickedInfo = e.target.closest("#modalInfo");
  if (clickedInfo) return;

  expanded.classList.remove("expanded");
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");
  document.body.classList.remove("modal-open");

  modalInfo.style.top       = "";
  modalInfo.style.left      = "";
  modalInfo.style.transform = "";
  modalInfo.style.width     = "";
  modalInfo.style.padding   = "";

  returnWrapper();
  hideModalInfo();
});


//////////////------------------------------- OVERLAY CLICK TO CLOSE -------------------/////////////////

overlay.addEventListener("click", function () {

  const expanded = document.querySelector(".image-wrapper.expanded");
  if (!expanded) return;

  expanded.classList.remove("expanded");
  overlay.classList.remove("active");
  archiveContainer.classList.remove("blurred");
  bgBlur.classList.remove("active");
  document.body.classList.remove("modal-open");

  modalInfo.style.top       = "";
  modalInfo.style.left      = "";
  modalInfo.style.transform = "";
  modalInfo.style.width     = "";
  modalInfo.style.padding   = "";

  returnWrapper();
  hideModalInfo();
});