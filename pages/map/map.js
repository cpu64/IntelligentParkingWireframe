// ./js/map.js
let map = null;

export async function init() {
  // Cleanup existing map just in case
  if (map) {
    map.remove();
    map = null;
  }

  const mapEl = document.getElementById("map");

  if (!mapEl) return;

  const L = window.L;

  map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 4,
    zoomSnap: 0.25,
    attributionControl: false,
  });

  const width = 2000;
  const height = 1200;

  const bounds = [
    [0, 0],
    [height, width],
  ];

  L.imageOverlay("/map.svg", bounds).addTo(map);

  map.fitBounds(bounds);

  // markers
  const layers = {
    trucks: L.layerGroup().addTo(map),
    routes: L.layerGroup().addTo(map),
    cameras: L.layerGroup().addTo(map),
    cones: L.layerGroup().addTo(map),
    alerts: L.layerGroup().addTo(map),
    parking: L.layerGroup().addTo(map),
  };

  const truckA = L.circleMarker([1020, 720], {
    radius: 12,
    color: "#22d3ee",
    fillColor: "#22d3ee",
    fillOpacity: 0.8,
    weight: 2,
  })
    .addTo(layers.trucks)
    .bindPopup("Truck T-102");

  truckA.feature = {
    type: "truck",
    id: "truck-102",
    name: "Truck T-102",
  };

  const routeA = L.polyline(
    [
      [400, 700],
      [460, 760],
      [530, 820],
    ],
    {
      color: "#60a5fa",
      weight: 12, // larger click target
      opacity: 0.7,

      interactive: true,
      bubblingMouseEvents: false,
    },
  ).addTo(layers.routes);

  routeA.feature = {
    type: "route",
    id: "route-a",
    name: "Inbound Route A",
  };

  const cameraA = L.rectangle(
    [
      [820, 820],
      [860, 860],
    ],
    {
      color: "#4ade80",
      fillColor: "#4ade80",
      fillOpacity: 0.9,
      weight: 2,
    },
  )
    .addTo(layers.cameras)
    .bindPopup("Camera C-12");

  cameraA.feature = {
    type: "camera",
    id: "cam-12",
    name: "Camera C-12",
  };

  const coneA = L.polygon(
    [
      [840, 840],
      [720, 1020],
      [1000, 1020],
    ],
    {
      color: "#c084fc",
      fillColor: "#c084fc",
      fillOpacity: 0.25,
      weight: 1,
    },
  ).addTo(layers.cones);

  coneA.feature = {
    type: "vision-cone",
    id: "cone-a",
    name: "Vision Cone A",
  };

  const alertA = L.circle([920, 1180], {
    radius: 35,
    color: "#f87171",
    fillColor: "#f87171",
    fillOpacity: 0.35,
    weight: 2,
  })
    .addTo(layers.alerts)
    .bindPopup("Unauthorized Parking");

  alertA.feature = {
    type: "alert",
    id: "alert-1",
    name: "Unauthorized Parking",
  };

  const parkingA = L.rectangle(
    [
      [1080, 1020],
      [1140, 1140],
    ],
    {
      color: "#facc15",
      fillColor: "#facc15",
      fillOpacity: 0.35,
      weight: 2,
    },
  )
    .addTo(layers.parking)
    .bindPopup("Parking A-17");

  parkingA.feature = {
    type: "parking",
    id: "parking-a17",
    name: "Parking A-17",
  };

  bindTruckContextMenu(truckA);
  bindCameraContextMenu(cameraA);
  bindAlertContextMenu(alertA);
  bindParkingContextMenu(parkingA);
  bindRouteContextMenu(routeA);

  // close menu when clicking map
  map.on("click", () => {
    closeContextMenu();
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  bindLayerControls();
}

export function destroy() {
  if (map) {
    map.remove();
    map = null;
  }
}

function bindLayerControls() {
  // GLOBAL COLLAPSE
  const collapseBtn = document.getElementById("layersCollapseBtn");
  const container = document.getElementById("layersContainer");
  const icon = document.getElementById("layersCollapseIcon");

  // TRUCKS COLLAPSE
  const trucksBtn = document.getElementById("trucksCollapseBtn");
  const trucksContainer = document.getElementById("trucksContainer");
  const trucksIcon = document.getElementById("trucksCollapseIcon");

  // ALERTS COLLAPSE
  const alertsBtn = document.getElementById("alertsCollapseBtn");
  const alertsContainer = document.getElementById("alertsContainer");
  const alertsIcon = document.getElementById("alertsCollapseIcon");

  if (trucksBtn && trucksContainer) {
    trucksBtn.addEventListener("click", () => {
      const collapsed = trucksContainer.classList.contains("hidden");

      trucksContainer.classList.toggle("hidden");

      trucksIcon.style.transform = collapsed
        ? "rotate(0deg)"
        : "rotate(-90deg)";
    });
  }

  if (alertsBtn && alertsContainer) {
    alertsBtn.addEventListener("click", () => {
      const collapsed = alertsContainer.classList.contains("hidden");

      alertsContainer.classList.toggle("hidden");

      alertsIcon.style.transform = collapsed
        ? "rotate(0deg)"
        : "rotate(-90deg)";
    });
  }

  if (collapseBtn && container) {
    collapseBtn.addEventListener("click", () => {
      const collapsed = container.classList.contains("hidden");

      container.classList.toggle("hidden");

      icon.style.transform = collapsed ? "rotate(0deg)" : "rotate(-90deg)";
    });
  }

  // VISIBILITY TOGGLES
  document.querySelectorAll(".layer-visibility").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const enabled = toggle.dataset.enabled === "true";

      toggle.dataset.enabled = (!enabled).toString();

      const knob = toggle.firstElementChild;

      if (enabled) {
        toggle.classList.remove("bg-cyan-500");
        toggle.classList.add("bg-slate-700");

        knob.classList.remove("right-0.5");
        knob.classList.add("left-0.5");
      } else {
        toggle.classList.remove("bg-slate-700");
        toggle.classList.add("bg-cyan-500");

        knob.classList.remove("left-0.5");
        knob.classList.add("right-0.5");
      }
    });
  });

  // OPACITY LABELS
  document.querySelectorAll('input[type="range"]').forEach((slider) => {
    slider.addEventListener("input", () => {
      const wrapper = slider.parentElement;

      const label = wrapper.querySelector(".opacity-value");

      if (label) {
        label.textContent = `${slider.value}%`;
      }
    });
  });
}

function bindTruckContextMenu(layer) {
  layer.on("click", (e) => {
    closeContextMenu();

    const truck = layer.feature;

    const container = document.createElement("div");

    container.id = "mapContextMenu";

    container.className = `
    absolute z-[9999]
    w-[360px]
    max-h-[calc(100vh-256px)]
    overflow-y-auto
    rounded-2xl
    border border-slate-700
    bg-slate-900/95
    backdrop-blur
    shadow-2xl
    text-slate-200
    `;

    positionContextMenu(container, e);

    container.innerHTML = `
    <!-- HEADER -->
    <div class="px-4 py-4 border-b border-slate-800">
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-sm font-semibold text-white">
    ${truck.name}
    </div>

    <div class="text-xs text-slate-500 mt-1">
    Freightliner Cascadia • Active Assignment
    </div>
    </div>

    <div class="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-300 uppercase tracking-wide">
    2 Alerts
    </div>
    </div>
    </div>

    <!-- METADATA -->
    <div class="p-4 space-y-3 border-b border-slate-800">
    <div class="grid grid-cols-2 gap-3 text-xs">
    <div>
    <div class="text-slate-500 mb-1">
    Assignment
    </div>

    <div class="text-slate-200">
    Dock B-12 Delivery
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Driver
    </div>

    <div class="text-slate-200">
    John Peterson
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Speed
    </div>

    <div class="text-slate-200">
    12 km/h
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    ETA
    </div>

    <div class="text-slate-200">
    4 min
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Last Camera
    </div>

    <div class="text-slate-200">
    Camera C-12
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Route
    </div>

    <div class="text-slate-200">
    Route A
    </div>
    </div>
    </div>

    <!-- AI -->
    <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
    <div class="text-[11px] uppercase tracking-wide text-yellow-300 mb-2">
    AI Anomalies
    </div>

    <div class="space-y-2 text-xs text-yellow-100">
    <div>
    • Unscheduled stop detected
    </div>

    <div>
    • Route deviation risk: low
    </div>
    </div>
    </div>
    </div>

    <!-- ACTIONS -->
    <div class="p-3 grid grid-cols-2 gap-2">
    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Follow Truck
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Cameras
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Playback
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Alerts
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Show Route History
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Related Cameras
    </button>
    </div>
    `;

    // document.body.appendChild(container);

    // prevent map click from instantly closing
    requestAnimationFrame(() => {
      container.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    });
  });
}

function bindCameraContextMenu(layer) {
  layer.on("click", (e) => {
    closeContextMenu();

    const camera = layer.feature;

    const container = document.createElement("div");

    container.id = "mapContextMenu";

    container.className = `
    absolute z-[9999]
    w-[360px]
    max-h-[calc(100vh-256px)]
    overflow-y-auto
    rounded-2xl
    border border-slate-700
    bg-slate-900/95
    backdrop-blur
    shadow-2xl
    text-slate-200
    `;

    positionContextMenu(container, e);

    container.innerHTML = `
    <!-- HEADER -->
    <div class="px-4 py-4 border-b border-slate-800">
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-sm font-semibold text-white">
    ${camera.name}
    </div>

    <div class="text-xs text-slate-500 mt-1">
    Active Surveillance Camera
    </div>
    </div>

    <div class="flex items-center gap-2">
    <div class="w-2 h-2 rounded-full bg-emerald-400"></div>

    <span class="text-[11px] text-emerald-300 uppercase tracking-wide">
    Online
    </span>
    </div>
    </div>
    </div>

    <!-- DETAILS -->
    <div class="p-4 space-y-4 border-b border-slate-800">
    <div class="grid grid-cols-2 gap-3 text-xs">
    <div>
    <div class="text-slate-500 mb-1">
    Zone
    </div>

    <div class="text-slate-200">
    North Gate
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Resolution
    </div>

    <div class="text-slate-200">
    4K
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    FPS
    </div>

    <div class="text-slate-200">
    30 FPS
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    AI Detection
    </div>

    <div class="text-slate-200">
    Enabled
    </div>
    </div>
    </div>

    <!-- RELATED ALERTS -->
    <!-- RELATED ALERTS -->
    <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
    <div class="text-[11px] uppercase tracking-wide text-red-300 mb-3">
    Related Alerts
    </div>

    <div class="space-y-2">
    <!-- ALERT -->
    <button
    class="w-full text-left rounded-lg border border-red-500/10 bg-slate-950/40 hover:bg-red-500/10 transition p-3 group"
    >
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-xs text-red-100 font-medium">
    Unauthorized parking detected
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    2 min ago • Zone A-12
    </div>
    </div>

    <div
    class="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-200 uppercase tracking-wide shrink-0"
    >
    High
    </div>
    </div>
    </button>

    <!-- ALERT -->
    <button
    class="w-full text-left rounded-lg border border-yellow-500/10 bg-slate-950/40 hover:bg-yellow-500/10 transition p-3 group"
    >
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-xs text-yellow-100 font-medium">
    Pedestrian in restricted zone
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    7 min ago • Corridor B
    </div>
    </div>

    <div
    class="text-[10px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-200 uppercase tracking-wide shrink-0"
    >
    Medium
    </div>
    </div>
    </button>
    </div>
    </div>

    <!-- ACTIONS -->
    <div class="p-3 grid grid-cols-2 gap-2">
    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Live Feed
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Playback
    </button>
    </div>
    `;

    // document.body.appendChild(container);

    requestAnimationFrame(() => {
      container.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    });
  });
}

function bindAlertContextMenu(layer) {
  layer.on("click", (e) => {
    closeContextMenu();

    const alert = layer.feature;

    const container = document.createElement("div");

    container.id = "mapContextMenu";

    container.className = `
    absolute z-[9999]
    w-[360px]
    max-h-[calc(100vh-256px)]
    overflow-y-auto
    rounded-2xl
    border border-slate-700
    bg-slate-900/95
    backdrop-blur
    shadow-2xl
    text-slate-200
    `;

    positionContextMenu(container, e);

    container.innerHTML = `
    <!-- HEADER -->
    <div class="px-4 py-4 border-b border-slate-800">
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-sm font-semibold text-white">
    ${alert.name}
    </div>

    <div class="text-xs text-slate-500 mt-1">
    Security Alert Event
    </div>
    </div>

    <div
    class="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/20 text-[10px] uppercase tracking-wide text-red-200"
    >
    Critical
    </div>
    </div>
    </div>

    <!-- DETAILS -->
    <div class="p-4 space-y-4 border-b border-slate-800">
    <div class="grid grid-cols-2 gap-3 text-xs">
    <div>
    <div class="text-slate-500 mb-1">
    Alert Type
    </div>

    <div class="text-slate-200">
    Unauthorized Parking
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Timestamp
    </div>

    <div class="text-slate-200">
    19:42:13
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Alert State
    </div>

    <div class="text-yellow-300">
    Investigating
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Escalation
    </div>

    <div class="text-red-300">
    Escalated L2
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Assigned Operator
    </div>

    <div class="text-slate-200">
    Operator A12
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Driver
    </div>

    <div class="text-slate-200">
    John Peterson
    </div>
    </div>
    </div>

    <!-- ASSOCIATIONS -->
    <div class="space-y-3">
    <!-- TRUCK -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Truck Association
    </div>

    <button
    class="w-full text-left rounded-lg border border-cyan-500/10 bg-cyan-500/10 hover:bg-cyan-500/20 transition p-3"
    >
    <div class="text-xs text-cyan-100 font-medium">
    Truck T-102
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    Freightliner Cascadia
    </div>
    </button>
    </div>

    <!-- PARKING -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Parking Space
    </div>

    <button
    class="w-full text-left rounded-lg border border-yellow-500/10 bg-yellow-500/10 hover:bg-yellow-500/20 transition p-3"
    >
    <div class="text-xs text-yellow-100 font-medium">
    Parking A-17
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    North Loading Zone
    </div>
    </button>
    </div>

    <!-- CAMERAS -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Nearby Cameras
    </div>

    <div class="space-y-2">
    <button
    class="w-full text-left rounded-lg border border-emerald-500/10 bg-emerald-500/10 hover:bg-emerald-500/20 transition p-3"
    >
    <div class="text-xs text-emerald-100 font-medium">
    Camera C-12
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    North Gate • 14m away
    </div>
    </button>

    <button
    class="w-full text-left rounded-lg border border-emerald-500/10 bg-emerald-500/10 hover:bg-emerald-500/20 transition p-3"
    >
    <div class="text-xs text-emerald-100 font-medium">
    Camera C-18
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    Dock Corridor • 28m away
    </div>
    </button>
    </div>
    </div>

    <!-- HANDOVER -->
    <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
    <div class="text-[11px] uppercase tracking-wide text-blue-300 mb-2">
    Shift Handover Notes
    </div>

    <div class="text-xs text-blue-100 leading-relaxed">
    Vehicle remained stationary beyond scheduled unload window.
    Driver contacted. Awaiting supervisor confirmation.
    </div>
    </div>
    </div>
    </div>

    <!-- ACTIONS -->
    <div class="p-3 grid grid-cols-2 gap-2">
    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Alert
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Open Replay
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Related Cameras
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 text-red-100 text-xs text-left">
    Escalate
    </button>
    </div>
    `;

    // document.body.appendChild(container);

    requestAnimationFrame(() => {
      container.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    });
  });
}

function bindParkingContextMenu(layer) {
  layer.on("click", (e) => {
    closeContextMenu();

    const parking = layer.feature;

    const container = document.createElement("div");

    container.id = "mapContextMenu";

    container.className = `
    absolute z-[9999]
    w-[360px]
    max-h-[calc(100vh-256px)]
    overflow-y-auto
    rounded-2xl
    border border-slate-700
    bg-slate-900/95
    backdrop-blur
    shadow-2xl
    text-slate-200
    `;

    positionContextMenu(container, e);

    container.innerHTML = `
    <!-- HEADER -->
    <div class="px-4 py-4 border-b border-slate-800">
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-sm font-semibold text-white">
    ${parking.name}
    </div>

    <div class="text-xs text-slate-500 mt-1">
    Smart Parking Space
    </div>
    </div>

    <div
    class="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/20 text-[10px] uppercase tracking-wide text-red-200"
    >
    Unauthorized
    </div>
    </div>
    </div>

    <!-- STATES -->
    <div class="p-4 space-y-4 border-b border-slate-800">
    <div class="grid grid-cols-2 gap-3 text-xs">
    <div>
    <div class="text-slate-500 mb-1">
    Occupancy
    </div>

    <div class="text-red-300">
    Unauthorized
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Reservation
    </div>

    <div class="text-yellow-300">
    Reserved
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Long Stay
    </div>

    <div class="text-orange-300">
    2h 18m
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Conflict State
    </div>

    <div class="text-red-300">
    Active
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Assigned Truck
    </div>

    <div class="text-slate-200">
    Truck T-102
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Zone
    </div>

    <div class="text-slate-200">
    North Loading
    </div>
    </div>
    </div>

    <!-- RELATED ALERTS -->
    <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
    <div class="text-[11px] uppercase tracking-wide text-red-300 mb-3">
    Related Alerts
    </div>

    <div class="space-y-2">
    <button
    class="w-full text-left rounded-lg border border-red-500/10 bg-slate-950/40 hover:bg-red-500/10 transition p-3"
    >
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-xs text-red-100 font-medium">
    Unauthorized occupancy
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    3 min ago
    </div>
    </div>

    <div
    class="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-200 uppercase tracking-wide"
    >
    High
    </div>
    </div>
    </button>

    <button
    class="w-full text-left rounded-lg border border-orange-500/10 bg-slate-950/40 hover:bg-orange-500/10 transition p-3"
    >
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-xs text-orange-100 font-medium">
    Long-stay violation
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    21 min ago
    </div>
    </div>

    <div
    class="text-[10px] px-2 py-1 rounded bg-orange-500/20 text-orange-200 uppercase tracking-wide"
    >
    Medium
    </div>
    </div>
    </button>
    </div>
    </div>

    <!-- RELATED OBJECTS -->
    <div class="space-y-3">
    <!-- TRUCK -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Assigned Truck
    </div>

    <button
    class="w-full text-left rounded-lg border border-cyan-500/10 bg-cyan-500/10 hover:bg-cyan-500/20 transition p-3"
    >
    <div class="text-xs text-cyan-100 font-medium">
    Truck T-102
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    Freightliner Cascadia
    </div>
    </button>
    </div>

    <!-- RESERVATION -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Reservation
    </div>

    <button
    class="w-full text-left rounded-lg border border-yellow-500/10 bg-yellow-500/10 hover:bg-yellow-500/20 transition p-3"
    >
    <div class="text-xs text-yellow-100 font-medium">
    Reserved for T-102
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    19:00 → 22:00
    </div>
    </button>
    </div>

    <!-- CAMERAS -->
    <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
    Related Cameras
    </div>

    <div class="space-y-2">
    <button
    class="w-full text-left rounded-lg border border-emerald-500/10 bg-emerald-500/10 hover:bg-emerald-500/20 transition p-3"
    >
    <div class="text-xs text-emerald-100 font-medium">
    Camera C-12
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    North Gate • 14m away
    </div>
    </button>

    <button
    class="w-full text-left rounded-lg border border-emerald-500/10 bg-emerald-500/10 hover:bg-emerald-500/20 transition p-3"
    >
    <div class="text-xs text-emerald-100 font-medium">
    Camera C-18
    </div>

    <div class="text-[11px] text-slate-500 mt-1">
    Parking Corridor • 22m away
    </div>
    </button>
    </div>
    </div>
    </div>
    </div>

    <!-- ACTIONS -->
    <div class="p-3 grid grid-cols-2 gap-2">
    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Occupancy History
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Related Alerts
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Truck Details
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Reservation Details
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left">
    Related Cameras
    </button>

    <button class="context-action px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/20 text-cyan-100 text-xs text-left">
    Assigned Truck
    </button>
    </div>
    `;

    requestAnimationFrame(() => {
      container.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    });
  });
}

function bindRouteContextMenu(layer) {
  layer.on("click", (e) => {
    closeContextMenu();

    const route = layer.feature;

    const container = document.createElement("div");

    container.id = "mapContextMenu";

    container.className = `
    absolute z-[9999]
    w-[320px]
    max-h-[calc(100vh-256px)]
    overflow-y-auto
    rounded-2xl
    border border-slate-700
    bg-slate-900/95
    backdrop-blur
    shadow-2xl
    text-slate-200
    `;

    positionContextMenu(container, e);

    container.innerHTML = `
    <!-- HEADER -->
    <div class="px-4 py-4 border-b border-slate-800">
    <div class="flex items-start justify-between gap-3">
    <div>
    <div class="text-sm font-semibold text-white">
    ${route.name}
    </div>

    <div class="text-xs text-slate-500 mt-1">
    Active Navigation Route
    </div>
    </div>

    <div
    class="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] uppercase tracking-wide text-cyan-200"
    >
    Active
    </div>
    </div>
    </div>

    <!-- DETAILS -->
    <div class="p-4 space-y-3">
    <div class="grid grid-cols-2 gap-3 text-xs">
    <div>
    <div class="text-slate-500 mb-1">
    Assigned Truck
    </div>

    <div class="text-slate-200">
    Truck T-102
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Route Length
    </div>

    <div class="text-slate-200">
    420m
    </div>
    </div>

    <div>
    <div class="text-slate-500 mb-1">
    Destination
    </div>

    <div class="text-slate-200">
    Parking A-17
    </div>
    </div>
    </div>
    </div>
    `;

    requestAnimationFrame(() => {
      container.addEventListener("click", (ev) => {
        ev.stopPropagation();
      });
    });
  });
}

function positionContextMenu(container, e) {
  const x = e.originalEvent.clientX + 12;
  const y = e.originalEvent.clientY + 12;

  // must exist in DOM before measuring
  document.body.appendChild(container);

  const rect = container.getBoundingClientRect();

  const padding = 16;

  let left = x;
  let top = y;

  // right overflow
  if (left + rect.width > window.innerWidth - padding) {
    left = window.innerWidth - rect.width - padding;
  }

  // bottom overflow
  if (top + rect.height > window.innerHeight - padding) {
    top = window.innerHeight - rect.height - padding;
  }

  // prevent negative positions
  left = Math.max(padding, left);
  top = Math.max(padding, top);

  container.style.left = `${left}px`;
  container.style.top = `${top}px`;
}

function closeContextMenu() {
  const existing = document.getElementById("mapContextMenu");

  if (existing) {
    existing.remove();
  }
}
