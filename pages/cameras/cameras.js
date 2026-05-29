// ./js/cameras.js

let handleDocumentClick;
let handleContextMenu;
let cleanupFns = [];

export function init() {
  handleDocumentClick = () => {
    const menu = document.getElementById("cameraContextMenu");

    if (menu) {
      menu.hidden = true;
    }
  };

  handleContextMenu = (event) => {
    const target = event.target.closest("[data-camera-context]");

    if (!target) return;

    openCameraContextMenu(event);
  };

  document.addEventListener("click", handleDocumentClick);

  document.addEventListener("contextmenu", handleContextMenu);

  document
    .getElementById("openViewManagerBtn")
    ?.addEventListener("click", openViewManager);

  document
    .getElementById("closeViewManagerBtn")
    ?.addEventListener("click", closeViewManager);

  bindCollapsibleSection({
    buttonId: "toggleCameraSectionButton",
    sectionId: "cameraSection",
    chevronId: "cameraChevron",
  });

  bindCollapsibleSection({
    buttonId: "toggleViewSectionButton",
    sectionId: "viewSection",
    chevronId: "viewChevron",
  });
}

export function destroy() {
  document.removeEventListener("click", handleDocumentClick);

  document.removeEventListener("contextmenu", handleContextMenu);

  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];

  console.log("cameras page destroy");
}

function bindCollapsibleSection({ buttonId, sectionId, chevronId }) {
  const button = document.getElementById(buttonId);
  const section = document.getElementById(sectionId);
  const chevron = document.getElementById(chevronId);

  if (!button || !section || !chevron) return;

  const toggle = () => {
    const collapsed = section.classList.contains("hidden");

    if (collapsed) {
      section.classList.remove("hidden");
      chevron.classList.remove("-rotate-90");
    } else {
      section.classList.add("hidden");
      chevron.classList.add("-rotate-90");
    }
  };

  button.addEventListener("click", toggle);

  cleanupFns.push(() => {
    button.removeEventListener("click", toggle);
  });
}

export function openCameraContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById("cameraContextMenu");

  if (!menu) return;

  const offset = 6;
  const menuWidth = 320;
  const menuHeight = 520;

  let x = event.clientX + offset;
  let y = event.clientY + offset;

  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 12;
  }

  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 12;
  }

  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.hidden = false;
}

export function openViewManager() {
  document.getElementById("mainLeft")?.classList.add("hidden");

  const vm = document.getElementById("viewManager");

  if (!vm) return;

  vm.classList.remove("hidden");
  vm.classList.add("flex");
}

export function closeViewManager() {
  const vm = document.getElementById("viewManager");

  if (!vm) return;

  vm.classList.add("hidden");
  vm.classList.remove("flex");

  document.getElementById("mainLeft")?.classList.remove("hidden");
}
