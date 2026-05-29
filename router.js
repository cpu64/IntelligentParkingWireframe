// ./js/router.js

let currentModule = null;

const PAGES = {
  live: {
    left: "./pages/cameras/left.html",
    main: "./pages/cameras/main.html",
    right: null,
    bottom: null,
    script: "./pages/cameras/cameras.js",
  },

  replay: {
    left: "./pages/cameras/left.html",
    main: "./pages/cameras/main.html",
    right: null,
    bottom: "./pages/cameras/replay/bottom.html",
    script: "./pages/cameras/cameras.js",
  },

  map: {
    left: "./pages/map/left.html",
    main: "./pages/map/main.html",
    right: null,
    bottom: "./pages/map/bottom.html",
    script: "./pages/map/map.js",
  },

  alerts: {
    left: "./pages/alerts/left.html",
    main: "./pages/alerts/main.html",
    right: "./pages/alerts/right.html",
    bottom: null,
    script: "./pages/alerts/alerts.js",
  },
};

async function loadComponent(id, path) {
  const el = document.querySelector(id);
  if (!el) return;

  if (!path) {
    el.innerHTML = "";
    el.classList.add("hidden");
    return;
  }

  const html = await fetch(path).then((r) => r.text());
  el.innerHTML = html;
  el.classList.remove("hidden");
}

async function loadPage(page) {
  const config = PAGES[page];

  if (!config) return;

  // CLEANUP OLD PAGE
  if (currentModule?.destroy) {
    await currentModule.destroy();
  }

  // LOAD HTML
  await Promise.all([
    loadComponent("#leftSidebar", config.left),
    loadComponent("#mainView", config.main),
    loadComponent("#rightSidebar", config.right),
    loadComponent("#bottomBar", config.bottom),
  ]);

  // LOAD PAGE MODULE
  currentModule = null;

  if (config.script) {
    currentModule = await import(config.script);

    if (currentModule.init) {
      await currentModule.init({
        page,
        config,
      });
    }
  }

  window.currentPage = page;
}

async function initApp() {
  await loadComponent("#header", "./header.html");

  await loadPage("map");

  bindTabs();

  bindSidebarToggle();

  bindRightSidebarToggle();
}

function bindTabs() {
  document.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;

    loadPage(tab.dataset.tab);
  });
}

function bindSidebarToggle() {
  const sidebar = document.getElementById("leftSidebar");
  const btn = document.getElementById("globalSidebarToggle");

  if (!sidebar || !btn) return;

  btn.addEventListener("click", () => {
    const collapsed = sidebar.classList.contains("hidden");

    if (collapsed) {
      sidebar.classList.remove("hidden");
      btn.innerHTML = "◀";
    } else {
      sidebar.classList.add("hidden");
      btn.innerHTML = "▶";
    }

    setTimeout(() => {
      map?.invalidateSize();
    }, 250);
  });
}

function bindRightSidebarToggle() {
  const sidebar = document.getElementById("rightSidebar");
  const btn = document.getElementById("rightSidebarToggle");

  if (!sidebar || !btn) return;

  btn.addEventListener("click", () => {
    const collapsed = sidebar.classList.contains("hidden");

    if (collapsed) {
      sidebar.classList.remove("hidden");
      btn.innerHTML = "▶";
    } else {
      sidebar.classList.add("hidden");
      btn.innerHTML = "◀";
    }
  });
}

export { initApp };
