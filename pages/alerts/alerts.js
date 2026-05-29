// ./js/alerts.js

let interval;

let handleOutsideFilterClick;

export function init() {
  console.log("alerts init");

  bindFilterModal();
  bindAlertRows();
  bindControlsSidebar();

  interval = setInterval(() => {
    console.log("checking alerts...");
  }, 5000);
}

//
// LEFT SIDEBAR (ROW CLICK)
//
function bindAlertRows() {
  const rows = document.querySelectorAll("[data-alert-row]");

  const leftSidebar = document.getElementById("leftSidebar");
  const leftToggle = document.getElementById("globalSidebarToggle");

  if (!rows.length || !leftSidebar) return;

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const hidden = leftSidebar.classList.contains("hidden");

      if (hidden) {
        leftSidebar.classList.remove("hidden");

        if (leftToggle) {
          leftToggle.innerHTML = "◀";
        }
      } else {
        leftSidebar.classList.add("hidden");

        if (leftToggle) {
          leftToggle.innerHTML = "▶";
        }
      }
    });
  });
}

//
// RIGHT SIDEBAR (CONTROLS BUTTON)
//
function bindControlsSidebar() {
  const btn = document.getElementById("toggleAlertsControls");

  const sidebar = document.getElementById("rightSidebar");
  const toggle = document.getElementById("rightSidebarToggle");

  if (!btn || !sidebar || !toggle) return;

  btn.addEventListener("click", () => {
    const hidden = sidebar.classList.contains("hidden");

    if (hidden) {
      sidebar.classList.remove("hidden");

      toggle.classList.remove("hidden");

      toggle.innerHTML = "▶";
    } else {
      sidebar.classList.add("hidden");

      toggle.innerHTML = "◀";
    }
  });
}

//
// FILTER MODAL
//
function bindFilterModal() {
  const openBtn = document.getElementById("openAlertsFilterModal");
  const closeBtn = document.getElementById("closeAlertsFilterModal");
  const modal = document.getElementById("alertsFilterModal");

  if (!openBtn || !closeBtn || !modal) return;

  //
  // OPEN / TOGGLE
  //
  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    modal.classList.toggle("hidden");
  });

  //
  // CLOSE BUTTON
  //
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  //
  // OUTSIDE CLICK
  //
  handleOutsideFilterClick = (e) => {
    const insideModal = modal.contains(e.target);
    const clickedButton = openBtn.contains(e.target);

    if (!insideModal && !clickedButton) {
      modal.classList.add("hidden");
    }
  };

  document.addEventListener("click", handleOutsideFilterClick);
}

//
// CLEANUP
//
export function destroy() {
  console.log("alerts destroy");

  clearInterval(interval);

  if (handleOutsideFilterClick) {
    document.removeEventListener("click", handleOutsideFilterClick);
  }
}
