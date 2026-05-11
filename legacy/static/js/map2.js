//=========================== leaflet menu ====================
L.Control.LeafletMenu = L.Control.extend({
    options: {
        mapId: "map",
        items: [],
        button: void 0
    },
    statics: {
        CLASS: "leaflet-menu",
        OverFlow_Y: "overflow-y",
        OverFlow_X: "overflow-x"
    },
    initialize: function (a, b) {
        L.setOptions(this, b),
            this.map = a,
            this.menuItem = [],
            this.menu_div = L.DomUtil.create("div", "menu", document.getElementById(this.options.mapId)),
            this.container(),
            L.DomEvent.on(this.container, "click", this._onMouseClick, this).on(this.container, "mouseover", this._onMouseOver, this).on(this.container, "mouseout", this._onMouseOut, this).on(this.container, "mousewheel", L.DomEvent.stop).on(this.container, "mousedown", L.DomEvent.stop).on(this.container, "dblclick", L.DomEvent.stop).on(this.container, "contextmenu", L.DomEvent.stop).on(window, "click", this.hide, this)
    },
    container: function () {
        return this.container = L.DomUtil.create("div", L.Control.LeafletMenu.CLASS, this.menu_div),
            this.container.style.position = "absolute",
            this.container.style.OverFlow_Y = "auto",
            this.container.style.OverFlow_X = "hidden",
            this
    },
    createMenu: function () {
        var button = L.DomUtil.get("styles-menu"); // Get the button itself
        if (!button) {
            console.error("Button not found");
            return; // Exit if the button is not found
        }

        var buttonRect = button.getBoundingClientRect(); // Get the bounding rectangle of the button

        // Get the map container or a container element positioned relative to the map
        var mapContainer = document.querySelector('.leaflet-container');
        if (!mapContainer) {
            console.error("Map container not found");
            return; // Exit if the map container is not found
        }

        // Adjust the position of the menu based on the button's position relative to the map
        var offset = 2; // Adjust this value as needed
        var menuLeft = buttonRect.right - mapContainer.getBoundingClientRect().left + offset; // Position the menu just to the right of the button with an offset
        var menuTop = buttonRect.top - mapContainer.getBoundingClientRect().top; // Align the top of the menu with the bottom of the button

        // Set the position of the menu relative to the map container
        this.container.style.position = 'absolute';
        this.container.style.left = menuLeft + 'px';
        this.container.style.top = menuTop + 'px';

        // Rest of the code remains the same
        this._removeItems()._createItems();

        return this;
    },
    removeMenu: function () {
        for (; this.menu_div.firstChild;)
            this.menu_div.removeChild(this.menu_div.firstChild)
    },
    _createItems: function () {
        for (var a = this.options.items, b = Object.keys(a), c = 0; c <= b.length - 1; c++)
            if (this.menuItem[c] = L.DomUtil.create("a", "leaflet-menu-item", this.container),
                this.menuItem[c].text = b[c],
                a[b[c]].onClick) {
                if (a[b[c]].onClick && a[b[c]].href)
                    throw "Menu item could not be clickable and redirectable at the same time"
            } else
                this.menuItem[c].href = a[b[c]].href;
        return this
    },
    _removeItems: function () {
        for (; this.container.firstChild;)
            this.container.removeChild(this.container.firstChild);
        return this
    },
    show: function () {
        try {
            this.createMenu(),
                this.container.style.display = "block",
                this.options.button && this.options.button.state("hide-menu")
        } catch (a) {
            console.log("Error(show-menu): \n" + a)
        }
    },
    hide: function () {
        try {
            this.container.style.display = "none",
                this.options.button && this.options.button.state("show-menu")
        } catch (a) {
            console.log("Error(hide-menu): \n" + a)
        }
    },
    _itemFunc: function (a) {
        if (this.options.items[a].href)
            return this;
        if (this.target) {
            if (!this.target || !this.target._map)
                throw "Sorry, there could be some error with your function";
            try {
                this.map.removeLayer(this.target),
                    this.target = void 0
            } catch (a) {
                console.log("Error(Removing target): \n" + a)
            }
        } else
            this.target = this.options.items[a].onClick(arguments)
    },
    _onMouseOver: function (a) {
        L.DomUtil.addClass(a.target || a.srcElement, "over")
    },
    _onMouseOut: function (a) {
        L.DomUtil.removeClass(a.target || a.src.Element, "over")
    },
    _onMouseClick: function (a) {
        this._itemFunc(a.target.text)
    }
}),
    L.leafletMenu = function (a, b) {
        return new L.Control.LeafletMenu(a, b)
    }
    ;

//============================ leaflet menu ======================



var map = null;
var marker = null;

var connectTextElement = document.getElementById('connectText');
var rsdDataElement = document.getElementById('rsdData');
var appVersionNum = window.APP_CONFIG.app_version_num;
var appVersionType = window.APP_CONFIG.app_version_type;
var selectedDevicePlatform = window.APP_CONFIG.current_platform;
console.log("App Version: ", appVersionNum);
console.log("App Type: ", appVersionType);
console.log("Platform: ", selectedDevicePlatform);

// Record app_visit when the page loads
//document.addEventListener('DOMContentLoaded', () => recordEvent('beta_visit'));

async function recordEvent(eventName) {
    const apiUrl = 'https://api.geoport.me/';

    try {
        const response = await fetch(apiUrl + selectedDevicePlatform, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: window.location.pathname,
                [eventName]: true,
            }),
        });

        if (!response.ok) {
            console.error('Failed to record event:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error recording event:', error.message);
    }
}

// Function to toggle Dark Mode
function toggleDarkMode() {
    // Get the Dark Mode switch element
    var darkModeSwitch = document.getElementById("darkModeSwitch");

    // Check if Dark Mode switch is checked
    if (darkModeSwitch.checked) {
        // Enable Dark Mode
        document.body.classList.add("dark-mode");
    } else {
        // Disable Dark Mode
        document.body.classList.remove("dark-mode");
    }
}


if (connectTextElement && rsdDataElement) {
    rsdDataElement.style.display = connectTextElement.innerText === "Connected" ? 'block' : 'none';
}



// Global variables
var marker; // Variable to store the marker
var drawnItems = new L.FeatureGroup(); // Define the layer to add loaded files
var gpxArray = []; // Array to store feature data
var orangeIcon;
var blueDotIcon;

// Define arrays to store latitudes and longitudes for markers and lines
var markerLatLngs = [];
var lineLatLngs = [];
// Initialize gpxPlaybackInterval variable outside the function
var gpxPlaybackInterval;
// Initialize a flag variable to control the loop
//let isPlaybackStopped = false;
// Create a variable to keep track of playback status
let isPlaybackInProgress = false;
let isPlaybackStopped = true; // Flag to control playback status
let playbackIndex = 0; // Index to keep track of the current point being processed
let isReconnecting = false; // Tracking global reconnection state
// Define the gpxMarker outside the function scope
let gpxMarker = null;
// Define a flag to track if playback was paused
let wasPlaybackPaused = false;
// Flag to track whether the velocity select menu is currently visible
var velocitySelectVisible = false;
// Define a global variable to store the time to next point
var timeToNextPoint = 'N/A';
var velocitySelect = 'walk';
let isDrawingMode = false; // Flag to track auto-drawing (snapping) mode
let isManualDrawingMode = false; // Flag to track manual-drawing mode
let isFlowerPlacementMode = false; // Flag for Pikmin Big Flower mode
let manualDrawingPoints = []; // NEW: Buffer for current manual drawings (green path)
let ignoreDayCrossingWarning = false;
let lastConfirmedLatLng = null;
let pendingSyncCoords = null; 

// Playback Control Variables (Global Scope)
let activePlaybackSource = 'none'; // 'drawing' or 'saved'
let drawingPlaybackButton, savedPlaybackButton;
let currentPlaybackSessionId = 0; // NEW: Unique ID to prevent multiple loops
let teleportEnabled = false;
let teleportInterval = 5;
let teleportWaitTime = 0;

function toggleTeleport() {
    teleportEnabled = document.getElementById('teleportEnabled').checked;
    const config = document.getElementById('teleportConfig');
    if (config) {
        config.style.display = teleportEnabled ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const intervalInput = document.getElementById('teleportInterval');
    if (intervalInput) {
        intervalInput.addEventListener('change', (e) => {
            teleportInterval = parseInt(e.target.value) || 5;
            if (teleportInterval < 1) teleportInterval = 1;
        });
    }
    const waitTimeInput = document.getElementById('teleportWaitTime');
    if (waitTimeInput) {
        waitTimeInput.addEventListener('change', (e) => {
            teleportWaitTime = parseFloat(e.target.value) || 0;
            if (teleportWaitTime < 0) teleportWaitTime = 0;
        });
    }
});

function updatePlaybackButtonStates(state) {
    if (activePlaybackSource === 'drawing' && drawingPlaybackButton) {
        drawingPlaybackButton.state(state);
        if (savedPlaybackButton) savedPlaybackButton.state('play');
    } else if (activePlaybackSource === 'saved' && savedPlaybackButton) {
        savedPlaybackButton.state(state);
        if (drawingPlaybackButton) drawingPlaybackButton.state('play');
    } else {
        if (drawingPlaybackButton) drawingPlaybackButton.state('play');
        if (savedPlaybackButton) savedPlaybackButton.state('play');
    }
}

// Flower Storage
let flowerLayerGroup = new L.FeatureGroup();
let flowerIcon;
let flowerButton; // Global reference for the placement button
let currentEditingIsNew = false; // Track if the modal is for a fresh placement


// Virtual Joystick Variables
let joystick = null;
let joystickState = {
    force: 0,
    angle: 0,
    active: false
};
let lastBackendUpdate = 0;
let isSyncing = false; // Guard for backend sync
const BACKEND_UPDATE_INTERVAL = 150; // 150ms as per suggestion
const MOVEMENT_LOOP_INTERVAL = 50; // 50ms for smooth UI update
const MAX_SPEED_KMH = 18; // 15km/h limit


// Initialize the map
async function initializeMap(userLocale) {
    var userLocale = window.APP_CONFIG.user_locale;
    console.log('User locale:', userLocale);

    // Create the map instance after obtaining coordinates
    map = L.map('map', {
        keyboard: false, // Disable keyboard navigation
        zoomControl: false, // Disable default zoom
        worldCopyJump: true // Automatically jump back to the center world when panning
    });
    // Re-add zoom control to the top left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Create tile layers
    var stadiaTileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        noWrap: true,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> contributors'
    });

    var openStreetMapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
    });

    var OPNVKarte = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    var Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; CNES, Distribution Airbus DS, 穢 Airbus DS, 穢 PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
    });
    var Stadia_Outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    var Stadia_StamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    var Stadia_StamenWatercolor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
        minZoom: 1,
        maxZoom: 16,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
    });
    var Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    // Define the orange icon
    orangeIcon = L.divIcon({
        className: 'orange-dot-container',
        html: '<div class="orange-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Define the Google Maps style blue dot icon
    blueDotIcon = L.divIcon({
        className: 'blue-dot-container',
        html: '<div class="blue-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Define the Pikmin Big Flower icon
    flowerIcon = L.icon({
        iconUrl: '/picture/leaf_icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    // Add flower layer group to map
    flowerLayerGroup.addTo(map);

    const initialLat = 23.97565;
    const initialLng = 120.9738819;

    // Center map and set zoom
    map.setView([initialLat, initialLng], 15);

    // Create initial marker
    marker = createMarker([initialLat, initialLng]);
    setCoordinatesUI(initialLat, initialLng);
    updateAddressInfo(initialLat, initialLng); // Initial address load


    map.on('dblclick', handleMapDoubleClick);
    map.on('click', (e) => {
        const latlng = e.latlng.wrap(); // Normalize coordinates for mirrored worlds
        if (isFlowerPlacementMode) {
            addBigFlower(latlng.lat, latlng.lng, true, null, null, null, true);
            
            // Auto-reset mode after placement (single-use action)
            isFlowerPlacementMode = false;
            if (flowerButton) {
                flowerButton.button.innerHTML = '<i class="lni lni-flower"></i>';
                flowerButton.button.classList.remove('active');
                map.getContainer().style.cursor = '';
            }
            return;
        }

        if (!isDrawingMode && !isManualDrawingMode) {
            handleMapDoubleClick({ latlng: latlng });
        }
    });

    // Set the zoom level to 20
    map.setZoom(20);

    // Add default tile layer
    stadiaTileLayer.addTo(map);

    // Define tile layer control options
    var baseLayers = {
        "Stadia Maps": stadiaTileLayer,
        "OpenStreetMap_HOT": OpenStreetMap_HOT,
        "Stadia Alidade Smooth": Stadia_AlidadeSmooth,
        "Stadia Alidade Smooth Dark": Stadia_AlidadeSmoothDark,
        "Stadia Alidade Satellite": Stadia_AlidadeSatellite,
        "Stadia Outdoors": Stadia_Outdoors,
        "Stadia Stamen Toner": Stadia_StamenToner,
        "CartoDB Voyager": CartoDB_Voyager,
    };

    // Safely append Google Maps layers at the bottom if the library loaded correctly
    try {
        if (typeof L.gridLayer.googleMutant === 'function') {
            baseLayers["Google Roadmap"] = L.gridLayer.googleMutant({ type: 'roadmap' });
            baseLayers["Google Satellite"] = L.gridLayer.googleMutant({ type: 'satellite' });
            baseLayers["Google Hybrid"] = L.gridLayer.googleMutant({ type: 'hybrid' });
            baseLayers["Google Terrain"] = L.gridLayer.googleMutant({ type: 'terrain' });
        }
    } catch (e) {
        console.warn("Google Maps layers failed to initialize. They may be blocked by a client extension.", e);
    }

    // Add layer control to map
    L.control.layers(baseLayers).addTo(map);

    //-----------------
    // Leaflet.FileLayer
    // Load GPX/KML/GeoJSON files by drag and drop, or file open
    var style = { color: 'orange', opacity: 1.0, fillOpacity: 0.1, weight: 2, clickable: true };

    L.Control.FileLayerLoad.LABEL = '<i class="lni lni-cloud-upload"></i>';
    L.Control.fileLayerLoad({
        //layer: drawnItems,
        position: 'topleft',
        fitBounds: true,
        addToMap: false, // Don't add layers to the map automatically
        layerOptions: {
            style: style,
            pointToLayer: function (data, latlng) {
                return L.marker(latlng, { icon: orangeIcon });
            },
            onEachFeature: onEachFeature
        },
        fileSizeLimit: 4096,
        // Add the `onFileLoad` option to handle file loading
        onFileLoad: function (e) {
            // Do nothing here, the GPX file will not be sent automatically
            console.log("file load trigger")
        }
    }).addTo(map);

    // Add drawnItems layer to map
    map.addLayer(drawnItems);
    // Add event listener for when a file is added to the map's layer
    drawnItems.on('layeradd', function (e) {

    });

    //=================== Save icon ================

    // Create the draw polyline button using EasyButton
    // Create the draw polyline button using EasyButton
    var saveMapButton = L.easyButton({
        states: [{
            stateName: 'draw-polyline',
            icon: '<i class="lni lni-save"></i>', // Icon class for drawing mode
            title: 'Save File', // Tooltip for the button
            onClick: handleSaveButtonClick // Use handleSaveButtonClick function for onClick event
        }]
    });


    saveMapButton.button.style.fontSize = '24px'; // Adjust the font size as needed
    saveMapButton.button.style.paddingLeft = '4px';

    // Add the draw polyline button to the map
    saveMapButton.addTo(map);

    // Get the container of your existing Leaflet control
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');

    // Add the EasyButton's container element to the existing control container
    fileLayerControlContainer.appendChild(saveMapButton.button);

    // Add the custom class to the EasyButton's container element
    saveMapButton.button.classList.add('leaflet-control-filelayer-custom');

    // Function to handle save button click
    function handleSaveButtonClick() {
        // Prompt for filename with default folder structure
        var filename = prompt("Please enter the filename (e.g., map_data.geojson):", "map_data.geojson");
        if (filename != null) {
            var data = leafletToGeoJSON();
            downloadGeoJSON(data, filename);
        }
    }

    // Function to convert Leaflet layers to GeoJSON
    function leafletToGeoJSON() {
        var geojson = {
            type: "FeatureCollection",
            features: []
        };

        // Get the "drawnItems" layer group
        var drawnItemsLayer = map.hasLayer(drawnItems) ? drawnItems : null;

        // Check if the "drawnItems" layer group exists
        if (drawnItemsLayer) {
            drawnItemsLayer.eachLayer(function (layer) {
                // Check if the layer is a marker
                if (layer instanceof L.Marker) {
                    var properties = layer.feature ? layer.feature.properties : {}; // Get marker properties

                    geojson.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
                        },
                        properties: properties // Add marker properties
                    });
                }
                // Check if the layer is a polyline
                else if (layer instanceof L.Polyline) {
                    geojson.features.push({
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: layer.getLatLngs().map(function (coord) {
                                return [coord.lng, coord.lat];
                            })
                        },
                        properties: {
                            // You can add any additional properties here
                        }
                    });
                }
            });
        }

        return geojson;
    }

    // Function to download GeoJSON file
    function downloadGeoJSON(data, filename) {
        var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        var url = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    //==============================================


    //========== Pause / Play
    //========== Dual Playback Buttons (Green for Drawing, Blue for Saved)
    
    // Green Playback Button (for manual drawings)
    drawingPlaybackButton = L.easyButton({
        states: [{
            stateName: 'play',
            icon: '<i class="lni lni-play"></i>',
            title: 'Play Drawing (Green)',
            onClick: function (btn, map) {
                if (manualDrawingPoints && manualDrawingPoints.length >= 2) {
                    const isSwitching = (activePlaybackSource !== 'drawing');
                    
                    // If we are currently playing something else, we need to interrupt it
                    if (!isPlaybackStopped && isSwitching) {
                        isPlaybackStopped = true; // Stop current loop
                        wasPlaybackPaused = false; // Fresh start for the new source
                    }

                    // Reset progress if we are switching sources
                    if (isSwitching) {
                        playbackIndex = 0;
                        interpolationStep = 0;
                        currentSegmentPoints = [];
                        wasPlaybackPaused = false;
                    }
                    
                    // Only initialize data if NOT resuming from a pause
                    if (!wasPlaybackPaused) {
                        lineLatLngs = JSON.parse(JSON.stringify(manualDrawingPoints));
                        playbackIndex = 0;
                        interpolationStep = 0;
                        currentSegmentPoints = [];
                    }
                    
                    activePlaybackSource = 'drawing';
                } else {
                    displayToast("No manual drawing to play. Use the pen tools first.");
                    return;
                }

                if (!isPlaybackStopped && activePlaybackSource === 'drawing') return;
                
                isPlaybackStopped = false;
                currentPlaybackSessionId++; // New valid session ID
                
                if (wasPlaybackPaused) {
                    processNextPoint(currentPlaybackSessionId);
                } else {
                    playbackIndex = 0;
                    processNextPoint(currentPlaybackSessionId);
                }
                updatePlaybackButtonStates('pause');
            }
        }, {
            stateName: 'pause',
            icon: '<i class="lni lni-pause"></i>',
            title: 'Pause Drawing',
            onClick: function (btn, map) {
                isPlaybackStopped = !isPlaybackStopped;
                if (isPlaybackStopped) {
                    wasPlaybackPaused = true;
                    updatePlaybackButtonStates('play');
                } else {
                    wasPlaybackPaused = false;
                    currentPlaybackSessionId++; // New ID for resumed session
                    processNextPoint(currentPlaybackSessionId);
                    updatePlaybackButtonStates('pause');
                }
            }
        }]
    });

    // Blue Playback Button (for saved paths)
    savedPlaybackButton = L.easyButton({
        states: [{
            stateName: 'play',
            icon: '<i class="lni lni-play"></i>',
            title: 'Play Saved Path (Blue)',
            onClick: function (btn, map) {
                const path = pathData.find(p => p.id === activePathId);
                
                if (path && path.points && path.points.length >= 2) {
                    const isSwitching = (activePlaybackSource !== 'saved');

                    // If we are currently playing something else, we need to interrupt it
                    if (!isPlaybackStopped && isSwitching) {
                        isPlaybackStopped = true; // Stop current loop
                        wasPlaybackPaused = false; // Fresh start for the new source
                    }

                    // If switching sources, force a full reset
                    if (isSwitching) {
                        playbackIndex = 0;
                        interpolationStep = 0;
                        currentSegmentPoints = [];
                        wasPlaybackPaused = false;
                    }

                    // Only load data if NOT resuming from a pause
                    if (!wasPlaybackPaused) {
                        lineLatLngs = JSON.parse(JSON.stringify(path.points));
                        playbackIndex = 0;
                        interpolationStep = 0;
                        currentSegmentPoints = [];
                    }
                    
                    activePlaybackSource = 'saved';
                } else {
                    displayToast("Please select a path from the sidebar first (item should turn blue).");
                    return;
                }

                // If it's already playing the current source, ignore additional clicks
                if (!isPlaybackStopped && activePlaybackSource === 'saved') return;
                
                isPlaybackStopped = false;
                currentPlaybackSessionId++; // New valid session ID

                if (wasPlaybackPaused) {
                    processNextPoint(currentPlaybackSessionId);
                } else {
                    playbackIndex = 0;
                    processNextPoint(currentPlaybackSessionId);
                }
                updatePlaybackButtonStates('pause');
            }
        }, {
            stateName: 'pause',
            icon: '<i class="lni lni-pause"></i>',
            title: 'Pause Saved Path',
            onClick: function (btn, map) {
                isPlaybackStopped = !isPlaybackStopped;
                if (isPlaybackStopped) {
                    wasPlaybackPaused = true;
                    updatePlaybackButtonStates('play');
                } else {
                    wasPlaybackPaused = false;
                    currentPlaybackSessionId++; // New ID for resumed session
                    processNextPoint(currentPlaybackSessionId);
                    updatePlaybackButtonStates('pause');
                }
            }
        }]
    });

    // Style the buttons using specific classes for color priority
    drawingPlaybackButton.button.classList.add('btn-playback-green');
    savedPlaybackButton.button.classList.add('btn-playback-blue');

    drawingPlaybackButton.addTo(map);
    savedPlaybackButton.addTo(map);

    // Add to the control container
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');
    if (fileLayerControlContainer) {
        fileLayerControlContainer.appendChild(drawingPlaybackButton.button);
        drawingPlaybackButton.button.classList.add('leaflet-control-filelayer-custom');
        fileLayerControlContainer.appendChild(savedPlaybackButton.button);
        savedPlaybackButton.button.classList.add('leaflet-control-filelayer-custom');
    }



    // ========= Pause Play



    // Create the manual drawing button using EasyButton
    var manualDrawButton = L.easyButton({
        states: [{
            stateName: 'draw-manual',
            icon: '<i class="lni lni-pencil-alt"></i>',
            title: 'Manual Path (No Snapping)',
            onClick: function (btn, map) {
                isManualDrawingMode = !isManualDrawingMode;

                if (isManualDrawingMode) {
                    map.on('click', handleManualMapClick);
                    btn.button.innerHTML = '<i class="lni lni-checkmark"></i>'; // Change to checkmark icon
                    btn.button.classList.add('active');
                    map.getContainer().style.cursor = 'crosshair';
                } else {
                    map.off('click', handleManualMapClick);
                    btn.button.innerHTML = '<i class="lni lni-pencil-alt"></i>';
                    btn.button.classList.remove('active');
                    map.getContainer().style.cursor = '';
                }
            }
        }]
    });

    manualDrawButton.button.style.fontSize = '24px';
    manualDrawButton.button.style.paddingLeft = '4px';
    manualDrawButton.addTo(map);

    // Get the container of your existing Leaflet control
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');
    if (fileLayerControlContainer) {
        // Add the EasyButton's container element to the existing control container
        fileLayerControlContainer.appendChild(manualDrawButton.button);
        // Add the custom class to the EasyButton's container element
        manualDrawButton.button.classList.add('leaflet-control-filelayer-custom');
    }

    //===========

    // Create the flower placement button using EasyButton
    flowerButton = L.easyButton({
        states: [{
            stateName: 'place-flower',
            icon: '<i class="lni lni-flower"></i>',
            title: 'Place Big Flower',
            onClick: function (btn, map) {
                isFlowerPlacementMode = !isFlowerPlacementMode;

                if (isFlowerPlacementMode) {
                    btn.button.innerHTML = '<i class="lni lni-checkmark"></i>';
                    btn.button.classList.add('active');
                    map.getContainer().style.cursor = 'crosshair';
                } else {
                    btn.button.innerHTML = '<i class="lni lni-flower"></i>';
                    btn.button.classList.remove('active');
                    map.getContainer().style.cursor = '';
                }
            }
        }]
    });

    flowerButton.button.style.fontSize = '24px';
    flowerButton.button.style.paddingLeft = '4px';
    flowerButton.addTo(map);

    if (fileLayerControlContainer) {
        fileLayerControlContainer.appendChild(flowerButton.button);
        flowerButton.button.classList.add('leaflet-control-filelayer-custom');
    }

    //===========
    //=========================== Speed Select Control ====================
    L.Control.SpeedSelect = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function (map) {
            // Re-use standard bar style
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-speed');
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.padding = '0';
            
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            var select = L.DomUtil.create('select', '', container);
            select.style.width = '48px';
            select.style.height = '48px'; // Keep it a square just like a menu button
            select.style.background = 'transparent';
            select.style.border = 'none';
            select.style.outline = 'none';
            select.style.fontSize = '12px';
            select.style.fontWeight = '700';
            select.style.textShadow = 'none';
            select.style.cursor = 'pointer';
            select.style.appearance = 'none'; // Hide native dropdown arrow to look like a button
            select.style.textAlign = 'center';
            select.title = 'Speed';

            var options = [
                { value: 'walk', text: '6 km/h' },
                { value: 'run', text: '12 km/h' },
                { value: 'ride', text: '19 km/h' },
                { value: 'ride2', text: '20 km/h' },
                { value: 'drive', text: '50 km/h' },
                { value: 'fly', text: '450 km/h' },
                { value: 'custom', text: '...' }
            ];

            options.forEach(function(opt) {
                var optionElements = L.DomUtil.create('option', '', select);
                optionElements.value = opt.value;
                optionElements.text = opt.text;
                optionElements.style.color = '#000'; // Make sure options are visible in the dropdown list
            });

            // Set initial value
            select.value = typeof velocitySelect !== "undefined" ? velocitySelect : 'walk';

            var customInputContainer = L.DomUtil.create('div', '', container);
            customInputContainer.style.display = 'none';
            customInputContainer.style.width = '100%';
            
            var customInput = L.DomUtil.create('input', '', customInputContainer);
            customInput.type = 'number';
            customInput.placeholder = 'km/h';
            customInput.style.width = '48px';
            customInput.style.height = '30px'; // Keep height as before
            customInput.style.border = 'none';
            customInput.style.borderTop = '1px solid rgba(0,0,0,0.1)';
            customInput.style.background = 'transparent';
            customInput.style.textAlign = 'center';
            customInput.style.fontSize = '12px'; // Reduced font size for custom input text
            customInput.style.boxSizing = 'border-box';
            customInput.style.padding = '0';
            customInput.style.outline = 'none';

            L.DomEvent.on(select, 'change', function() {
                if (select.value === 'custom') {
                    customInputContainer.style.display = 'block';
                    if (!['walk','run','ride','ride2','drive','fly'].includes(velocitySelect)) {
                        customInput.value = velocitySelect;
                    } else {
                        customInput.value = '';
                    }
                } else {
                    customInputContainer.style.display = 'none';
                    velocitySelect = select.value;
                    console.log("VelocitySelect set to:", velocitySelect);
                }
            });

            // Prevent typing from propagating to map hooks
            L.DomEvent.on(customInput, 'keydown', function(e) {
                L.DomEvent.stopPropagation(e);
            });

            L.DomEvent.on(customInput, 'input', function() {
                if (customInput.value) {
                    velocitySelect = customInput.value;
                    console.log("VelocitySelect set to (custom):", velocitySelect);
                }
            });

            return container;
        }
    });

    // Add Speed Control to map
    var speedControl = new L.Control.SpeedSelect({ position: 'topleft' });
    speedControl.addTo(map);

    // Get the container of your existing Leaflet control and disable propagation
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');
    if (fileLayerControlContainer) {
        L.DomEvent.disableClickPropagation(fileLayerControlContainer);
        L.DomEvent.disableScrollPropagation(fileLayerControlContainer);
    }





    // Create the custom EasyButton
    var clearButton = L.easyButton({
        states: [{
            stateName: 'clear-markers',
            icon: 'lni lni-trash-can', // Replace with your desired icon class
            title: 'Clear markers',
            onClick: function (btn, map) {
                // Logic to clear the layers and reset values
                drawnItems.clearLayers(); // Clear layers from map
                lineLatLngs = []; // Clear array storing coordinates
                manualDrawingPoints = []; // Also clear current drawing
                activePathId = null; // Reset active path selection
                activePlaybackSource = 'none'; // Reset playback buttons
                
                isPlaybackStopped = true; // Stop playback if active
                playbackIndex = 0;
                interpolationStep = 0; // Reset interpolation
                currentSegmentPoints = []; // Reset sub-points
                gpxMarker = null; // Clear marker reference
                wasPlaybackPaused = false;
                updatePlaybackButtonStates('play');
                
                // Refresh map to remove blue lines and un-highlight sidebar
                applyPathVisibility();

                // Stop background timer just in case
                if (typeof timerWorker !== 'undefined') {
                    timerWorker.postMessage({ action: 'stop' });
                }

                console.log("Trash: reset all playback states");

                // Hide the textbox if it exists
                var textbox = document.getElementById('timeToPointText');
                if (textbox) {
                    textbox.style.display = 'none';
                }
            }
        }]
    });

    // Add custom styles for the button (optional)
    clearButton.button.style.fontSize = '24px'; // Adjust the font size as needed
    clearButton.button.style.paddingLeft = '4px';

    // Add the EasyButton to the map
    clearButton.addTo(map);

    // Optionally, you can move the button to a custom location or append it to an existing container
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');
    fileLayerControlContainer.appendChild(clearButton.button);
    clearButton.button.classList.add('leaflet-control-filelayer-custom');








    // Function to handle map click for drawing polyline (Auto Snapping)
    function handleMapClick(event) {
        if (!isDrawingMode) return; // Exit if not in drawing mode
        const latlng = event.latlng.wrap(); // Normalize coordinates
        const { lat, lng } = latlng; 
        manualDrawingPoints.push([lat, lng]); // Add coordinates to manual drawing buffer

        // If there are at least two points, calculate route between them
        if (manualDrawingPoints.length >= 2) {
            const lastPoint = manualDrawingPoints.length - 2;
            const startPoint = manualDrawingPoints[lastPoint];
            const endPoint = manualDrawingPoints[lastPoint + 1];

            // Request route between consecutive points
            calculateRoute(startPoint, endPoint);
        }
    }

    // Function to handle map click for manual drawing (No Snapping)
    function handleManualMapClick(event) {
        if (!isManualDrawingMode) return;
        const latlng = event.latlng.wrap(); // Normalize coordinates
        const { lat, lng } = latlng;
        manualDrawingPoints.push([lat, lng]);

        if (manualDrawingPoints.length >= 2) {
            const lastPointIdx = manualDrawingPoints.length - 2;
            const startPoint = manualDrawingPoints[lastPointIdx];
            const endPoint = manualDrawingPoints[lastPointIdx + 1];

            // Draw a simple polyline directly between points
            L.polyline([startPoint, endPoint], { color: 'green', weight: 5 }).addTo(drawnItems);
        } else {
            // Add a small temporary marker to show the first point
            L.circleMarker([lat, lng], { radius: 3, color: 'green' }).addTo(drawnItems);
        }
    }





    // Function to process next point in GPX data with smooth interpolation
    let interpolationStep = 0;
    let currentSegmentPoints = [];
    const INTERPOLATION_INTERVAL = 100; // 100ms for smooth updates

    // Create a Web Worker to handle the timer without being throttled when minimized
    const timerWorkerCode = `
        let timer = null;
        self.onmessage = function(e) {
            if (e.data.action === 'start') {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    self.postMessage({ type: 'tick', sessionId: e.data.sessionId });
                }, e.data.interval);
            } else if (e.data.action === 'stop') {
                if (timer) clearTimeout(timer);
            }
        };
    `;
    const timerBlob = new Blob([timerWorkerCode], { type: 'application/javascript' });
    const timerWorker = new Worker(URL.createObjectURL(timerBlob));
    
    timerWorker.onmessage = function(e) {
        if (e.data.type === 'tick') {
            processNextPoint(e.data.sessionId);
        }
    };

    function processNextPoint(sessionId) {
        if (isPlaybackStopped || sessionId !== currentPlaybackSessionId) return;

        let nextInterval = INTERPOLATION_INTERVAL;

        // If we finished the current segment or just started
        if (interpolationStep >= currentSegmentPoints.length) {
            if (playbackIndex >= lineLatLngs.length - 1) {
                // Reached the very end of the line
                isPlaybackStopped = true;

                // Sync the main (blue) marker to the final position
                const finalLat = lineLatLngs[lineLatLngs.length - 1][0];
                const finalLng = lineLatLngs[lineLatLngs.length - 1][1];
                if (marker) {
                    marker.setLatLng([finalLat, finalLng]);
                }
                setCoordinatesUI(finalLat, finalLng);

                playbackIndex = 0;
                interpolationStep = 0;
                wasPlaybackPaused = false;
                updatePlaybackButtonStates('play'); 
                return;
            }

            // Calculate interpolation points for the next segment
            const start = lineLatLngs[playbackIndex];
            const end = lineLatLngs[playbackIndex + 1];
            const distance = calculateDistance(start[0], start[1], end[0], end[1]);
            currentSegmentPoints = [];
            
            // Check for Teleport Mode
            if (teleportEnabled && (playbackIndex + 1) % teleportInterval === 0) {
                // Teleport segment: Only 1 step straight to the end
                currentSegmentPoints.push([end[0], end[1]]);
                // Use wait time for the next tick after this teleport point is processed
                nextInterval = Math.max(INTERPOLATION_INTERVAL, teleportWaitTime * 1000);
            } else {
                // Normal interpolation logic
                const speedKmh = (velocitySelect === 'walk' ? 6 : (velocitySelect === 'run' ? 12 : (velocitySelect === 'ride' ? 19 : (velocitySelect === 'ride2' ? 20 : (velocitySelect === 'drive' ? 50 : (velocitySelect === 'fly' ? 450 : parseFloat(velocitySelect) || 18))))));
                const totalTimeSec = (distance / speedKmh) * 3600;
                const numSteps = Math.max(1, Math.ceil(totalTimeSec * 1000 / INTERPOLATION_INTERVAL));

                for (let i = 1; i <= numSteps; i++) {
                    const ratio = i / numSteps;
                    currentSegmentPoints.push([
                        start[0] + (end[0] - start[0]) * ratio,
                        start[1] + (end[1] - start[1]) * ratio
                    ]);
                }
            }

            interpolationStep = 0;
            playbackIndex++; // Move to next vertex for next time
        }

        // Get the next interpolated point
        const [lat, lng] = currentSegmentPoints[interpolationStep];
        interpolationStep++;

        // Update UI and Backend
        if (!gpxMarker || !map.hasLayer(gpxMarker)) {
            gpxMarker = L.marker([lat, lng], { icon: orangeIcon }).addTo(drawnItems);
        } else {
            gpxMarker.setLatLng([lat, lng]);
        }

        // Move the main blue dot as well
        if (marker) {
            marker.setLatLng([lat, lng]);
        }
        
        syncLocation(lat, lng);
        // map.panTo([lat, lng]); // Auto-pan disabled per user request

        // Schedule next sub-step using Web Worker to prevent background throttling
        timerWorker.postMessage({ action: 'start', interval: nextInterval, sessionId: sessionId });
    }

    function calculateRoute(startPoint, endPoint) {
        // Create routing control with walking profile
        L.Routing.control({
            waypoints: [
                L.latLng(startPoint[0], startPoint[1]),
                L.latLng(endPoint[0], endPoint[1])
            ],
            routeWhileDragging: false, // Disable route calculation while dragging waypoints
            lineOptions: {
                styles: [{ color: 'blue', opacity: 1, weight: 5 }]
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1/',
                profile: 'walking'
            }),
            show: false // Do not show the route on the map
        }).on('routesfound', function (e) {
            // Get the route from the event
            var route = e.routes[0];
            // Extract the coordinates from the route
            var coordinates = route.coordinates;
            // Draw the polyline using the coordinates
            var polyline = L.polyline(coordinates, { color: 'blue' }).addTo(drawnItems);
        }).addTo(drawnItems);
    }


    // Function to clear all polylines from the map
    function clearPolylines() {
        drawnItems.clearLayers(); // Remove all layers from the drawnItems layer
        lineLatLngs = []; // Clear the array storing coordinates
    }

    // Define a custom control for displaying time to next point
    var TimeToNextPointControl = L.Control.extend({
        options: {
            position: 'bottomleft' // Default position if not specified
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'time-to-next-point-control leaflet-bar leaflet-control');
            var textbox = L.DomUtil.create('input');
            textbox.type = 'text';
            textbox.disabled = true; // Make textbox readonly
            textbox.placeholder = 'Time to next point';
            textbox.style.width = '200px'; // Adjust the width as needed
            textbox.id = 'timeToPointText'; // Set ID for the textbox

            container.appendChild(textbox);

            // Function to update the content with the time to next point
            function updateContent() {
                if (!isPlaybackStopped) { // Check if playback is in progress
                    container.style.display = 'block'; // Show the control
                    textbox.value = `Time to next point: ${timeToNextPoint.toFixed(2)} seconds`;
                } else {
                    container.style.display = 'none'; // Hide the control when playback is stopped
                }
            }

            // Update the content initially
            updateContent();

            // Listen for changes in playback status and update the content accordingly
            map.on('playbackchange', updateContent);

            return container;
        },

        onRemove: function (map) {
            // Remove event listener when control is removed from map
            map.off('playbackchange');
        }
    });

    // Create and add the custom control to the map with the specified position
    var timeToNextPointControl = new TimeToNextPointControl({ position: 'bottomleft' }); // Set position to bottom left
    timeToNextPointControl.addTo(map);


    // Function to send GPX file to the backend
    function sendGPXToBackend() {
        // Get the selected file from the FileLayer control
        var selectedFile = document.getElementById('gpxFileInput').files[0];
        var velocity = document.getElementById('velocity').value; // Assuming you have an input field with ID 'velocity'


        if (selectedFile) {
            // Create a FormData object to send the file
            var formData = new FormData();
            formData.append('gpxFile', selectedFile);
            formData.append('velocity', velocity);

            // Send the FormData to the backend using fetch or another AJAX method
            fetch('/upload_gpx', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('GPX file uploaded successfully:', data);
                })
                .catch(error => {
                    console.error('Error uploading GPX file:', error);
                });
        } else {
            console.error('No GPX file selected.');
        }
    }

    // Assuming your input field has an id of 'coordinates'
    var inputField = document.getElementById('coordinates');
}



// Function to create a marker with all necessary event listeners
function createMarker(latlng) {
    marker = L.marker(latlng, { 
        draggable: true,
        icon: blueDotIcon 
    }).addTo(map);

    marker.on('dragend', handleMarkerDragEnd);
    marker.on('contextmenu', handleMarkerRightClick); // Add event listener for marker right-click
    return marker;
}


// Function to create a new marker on double click
function handleMapDoubleClick(e) {
    // Disable double-click zooming
    map.doubleClickZoom.disable();
    const latlng = e.latlng.wrap(); // Normalize coordinates
    if (!marker)
        marker = createMarker(latlng); // Create a new marker
    else
        marker.setLatLng(latlng);

    syncLocation(latlng.lat, latlng.lng, true);

    // Add the right-click event listener to the active marker
    marker.on('contextmenu', handleActiveMarkerRightClick);
}

// Function to handle marker drag end
function handleMarkerDragEnd(event) {
    const newLat = event.target.getLatLng().lat;
    const newLng = event.target.getLatLng().lng;
    syncLocation(newLat, newLng, true);
}




// Function to delete marker
function deleteMarker() {
    map.removeLayer(marker);
    map.closePopup(); // Close the popup
    marker = null;
}


// // Define global variables
let currentFeature = null;
let currentLayer = null;



// Function to set coordinates UI
function setCoordinatesUI(lat, lng) {
    document.getElementById('coordinates').value = lat + ', ' + lng;
    updateSetLocationButtonStatus();
    updateStopLocationButtonStatus();
    if (typeof updateAddressInfo === 'function') updateAddressInfo(lat, lng);
}

let dayCrossingModalInstance = null; // Global for singleton management

async function syncLocation(lat, lng, checkCrossing = false, allowBypass = true) {
    if (isSyncing) return;
    
    // 1. PERFORMANCE BOOST: Skip long checks for local movements (< 50km)
    // EXCLUSION: If allowBypass is false (e.g., from Search), we always check.
    if (checkCrossing && !ignoreDayCrossingWarning && lastConfirmedLatLng && allowBypass) {
        try {
            const distance = lastConfirmedLatLng.distanceTo(L.latLng(lat, lng));
            if (distance < 50000) {
                checkCrossing = false; // Treat as safe, skip API call
            }
        } catch (e) {
            console.warn("Distance check failed", e);
        }
    }

    // 2. Intercept for Day Crossing Check (+1 Day only)
    if (checkCrossing && !ignoreDayCrossingWarning) {
        const isFuture = await checkIfTomorrow(lat, lng);
        if (isFuture) {
            pendingSyncCoords = { lat, lng };
            if (!dayCrossingModalInstance) {
                dayCrossingModalInstance = new bootstrap.Modal(document.getElementById('dayCrossingModal'));
            }
            dayCrossingModalInstance.show();
            return; // Pause sync until confirmed
        }
    }

    isSyncing = true;
    setCoordinatesUI(lat, lng);
    
    try {
        const response = await fetch('/set_location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat, lng }),
        });
        const data = await response.text();
        console.log('Sync Location Response:', data);
        
        // Successfully synced, update the last confirmed position
        lastConfirmedLatLng = L.latLng(lat, lng);
    } catch (error) {
        console.error('Error syncing location:', error);
    } finally {
        isSyncing = false;
    }
}

async function checkIfTomorrow(lat, lng) {
    // Rely on pre-fetched or fetch new timezone data
    await updateSimulatedTimeData(lat, lng);
    
    // Fallback: If no data at all, return false
    if (!simulatedTimeData.timeZone && simulatedTimeData.gmtOffset === null) return false; 

    try {
        const now = new Date();
        let simDateStr;

        if (simulatedTimeData.timeZone) {
            // Case A: Precise Timezone (API Success)
            const options = { timeZone: simulatedTimeData.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' };
            const simParts = new Intl.DateTimeFormat('en-ZA', options).formatToParts(now);
            const s = simParts.reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
            simDateStr = `${s.year}-${s.month}-${s.day}`;
        } else {
            // Case B: Manual Offset (API Failed, using longitude-based estimate)
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const simTime = new Date(utc + (3600000 * simulatedTimeData.gmtOffset));
            simDateStr = simTime.getFullYear() + '-' + 
                         String(simTime.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(simTime.getDate()).padStart(2, '0');
        }

        // Format system date (local to user) for comparison
        const sysParts = new Intl.DateTimeFormat('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
        const y = sysParts.reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
        const sysDateStr = `${y.year}-${y.month}-${y.day}`;

        if (simDateStr > sysDateStr) {
            const details = document.getElementById('dayCrossingDetails');
            if (details) {
                const label = simulatedTimeData.timeZone ? "" : " (估計值)";
                details.innerText = `目標日期: ${simDateStr}${label}`;
            }
            return true;
        }
    } catch (e) {
        console.error("Date comparison error", e);
    }
    return false;
}

function confirmDayCrossing() {
    if (document.getElementById('ignoreDayCrossingCheck').checked) {
        ignoreDayCrossingWarning = true;
    }
    
    if (pendingSyncCoords) {
        const { lat, lng } = pendingSyncCoords;
        if (dayCrossingModalInstance) dayCrossingModalInstance.hide();
        
        // Perform the sync, skipping the check this time
        syncLocation(lat, lng, false);
        pendingSyncCoords = null;
    }
}

function stayAtPreview() {
    if (dayCrossingModalInstance) dayCrossingModalInstance.hide();
    
    // Reset marker to safe location but keep map view where it is (the preview)
    if (lastConfirmedLatLng && marker) {
        marker.setLatLng(lastConfirmedLatLng);
        setCoordinatesUI(lastConfirmedLatLng.lat, lastConfirmedLatLng.lng);
    }
    
    pendingSyncCoords = null;
}

function cancelDayCrossing() {
    if (dayCrossingModalInstance) dayCrossingModalInstance.hide();
    
    if (lastConfirmedLatLng && marker) {
        marker.setLatLng(lastConfirmedLatLng);
        setCoordinatesUI(lastConfirmedLatLng.lat, lastConfirmedLatLng.lng);
        // ROLLBACK: Also move the map view back so the user isn't looking at "tomorrow"
        map.setView(lastConfirmedLatLng);
    }
    pendingSyncCoords = null;
}

function jumpToCurrentLocation() {
    if (marker) {
        map.setView(marker.getLatLng(), map.getZoom());
        // Simple visual feedback
        const btnIcon = document.querySelector('.jump-to-marker-btn i');
        if (btnIcon) {
            btnIcon.classList.add('fa-beat');
            setTimeout(() => btnIcon.classList.remove('fa-beat'), 500);
        }
    }
}

// Function to handle search
function handleSearch() {
    var input = document.getElementById('coordinates').value;
    searchLocation(input);
}

// Function to search location
async function searchLocation(input, userLocale) {
    // 1. Try to parse as direct coordinates (Lat, Lng)
    const coordsMatch = input.match(/([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/);
    if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
            if (!marker) {
                marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                marker.on('dragend', handleMarkerDragEnd);
                marker.on('contextmenu', handleMarkerRightClick);
            } else {
                marker.setLatLng([lat, lng]);
            }
            map.setView([lat, lng], 20); // High zoom for coordinate search
            syncLocation(lat, lng, true, false);
            return; // Exit early
        }
    }

    // 2. Fallback to OpenStreetMap Address Search
    var provider = new GeoSearch.OpenStreetMapProvider();
    try {
        const results = await provider.search({ query: input });
        if (results.length > 0) {
            const { x, y } = results[0];
            if (!marker) {
                marker = L.marker([y, x], { draggable: true }).addTo(map);
                marker.on('dragend', handleMarkerDragEnd);
                marker.on('contextmenu', handleMarkerRightClick);
            } else {
                marker.setLatLng([y, x]);
            }
            map.setView([y, x], 18); // Default zoom for address search
            syncLocation(y, x, true, false);
        } else {
            alert("No results found for the provided location");
        }
    } catch (error) {
        console.error('Error during geocoding:', error);
    }
}


// Add previously saved GeoJSON or loaded file to map, and allow editing?
function onEachFeature(feature, layer) {
    drawnItems.addLayer(layer); // Add the layer to the drawnItems group

    // Store latlngs for lines (polylines)
    if (layer instanceof L.Polyline) {
        layer.getLatLngs().forEach(function (latLng) {
            lineLatLngs.push([latLng.lat, latLng.lng]);
        });
    }
    // You can also handle other types of features if needed
    console.log("latArray:", lineLatLngs);

    // Bind a popup to the layer showing its properties
    layer.bindPopup(generatePopupContent(feature.properties));

    // Attach the click handler to display properties
    layer.on('click', handleMarkerClick);

    // Attach the right-click handler to edit properties
    layer.on('contextmenu', function (event) {
        handleMarkerRightClick(event, feature);
    });
}

// Function to generate popup content for displaying all feature properties
function generatePopupContent(properties) {
    let content = '';
    console.log("generate props: ", properties)
    for (const key in properties) {
        content = `<h4 style="text-align: center;">${properties.name}</h4>`;
        content += `<p><strong>${key}:</strong><br>${properties[key]}<br>`;
        content += `<p><strong>Coordinates:</strong><br> ${coordinates.value}<br>`;
    }
    return content;
}



// Function to handle marker right-click
function handleMarkerRightClick(event) {
    L.DomEvent.stopPropagation(event); // Prevent the map from handling the click event

    const menu = L.popup();
    menu.setLatLng(event.latlng);

    // Set currentFeature to the feature object of the clicked marker
    currentFeature = event.target.feature;

    // Check if the event object contains the necessary properties
    if (event.target && event.target.feature && event.target.feature.properties) {
        let content = generateEditPopupContent(event.target.feature.properties);
        // Style the button as a Bootstrap 5 button and center align it
        content += '<div class="text-center">';
        content += '<br><button type="button" id="saveActive" class="btn btn-primary" onclick="saveChanges()">Save</button>';
        content += '</div>';

        menu.setContent(content);
        menu.openOn(map);
    }
}





// Function to generate popup content for editing feature properties
function generateEditPopupContent(properties) {
    let content = '<h3>Edit Marker</h3>';

    // Ensure name input is always displayed
    content += '<label for="name"><strong>Name:</strong></label><br>';
    content += `<input type="text" class="form-control" id="name" value="${properties.name || ''}"><br>`;

    // Ensure description input is always displayed
    content += '<br><label for="description"><strong>Description:</strong></label><br>';
    content += `<textarea class="form-control" type="text" id="description" rows="2" value="${properties.description || ''}"></textarea><br>`;

    //content += '<button onclick="saveChanges()">Save</button>';
    //return content;
    return `<div class="custom-popup-content">${content}</div>`;
}

// Function to save changes made to marker properties
function saveChanges() {
    // Check if input elements exist
    const newNameInput = document.getElementById('name');
    const newDescriptionInput = document.getElementById('description');

    if (!newNameInput || !newDescriptionInput) {
        console.error('Input elements not found.');
        return;
    }

    // Verify that currentFeature is set
    if (!currentFeature) {
        console.error('Current feature not found.');
        return;
    }

    // Update the feature properties
    currentFeature.properties.name = newNameInput.value;
    currentFeature.properties.description = newDescriptionInput.value;

    // Update the marker popup content with the new properties
    marker.setPopupContent(generatePopupContent(currentFeature));

    // Close the popup
    map.closePopup();
}
// Function to handle marker click
function handleMarkerClick(event) {
    const feature = event.target.feature;
    const coordinates = event.latlng;

    // Call setCoordinates function with marker coordinates
    syncLocation(coordinates.lat, coordinates.lng);

    const popupContent = generatePopupContent(feature.properties);
    const popup = L.popup().setLatLng(coordinates).setContent(popupContent);
    map.openPopup(popup);
}

// Function to handle right-click on the active marker
function handleActiveMarkerRightClick(event) {
    L.DomEvent.stopPropagation(event); // Prevent the map from handling the click event

    const menu = L.popup();
    menu.setLatLng(event.latlng);

    let content = generateEditPopupContent({
        name: "",
        description: ""
    }); // Empty inputs for the new marker

    // Style the button as a Bootstrap 5 button and center align it
    content += '<div class="text-center">';
    content += '<br><button type="button" id="saveActive" class="btn btn-primary" onclick="saveActiveMarker()">Save</button>';
    content += '</div>';

    menu.setContent(content);
    menu.openOn(map);
}


// Function to save the active marker as a new feature in the drawnItems layer
function saveActiveMarker() {
    const newNameInput = document.getElementById('name');
    const newDescriptionInput = document.getElementById('description');

    if (!newNameInput || !newDescriptionInput) {
        console.error('Input elements not found.');
        return;
    }

    // Create a GeoJSON feature for the active marker
    const newFeature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [marker.getLatLng().lng, marker.getLatLng().lat]
        },
        properties: {
            name: newNameInput.value,
            description: newDescriptionInput.value
        }
    };

    // Add the new feature to the drawnItems layer
    L.geoJSON(newFeature, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: orangeIcon });
        },
        onEachFeature: onEachFeature
    }).addTo(drawnItems);

    // Close the popup
    map.closePopup();
}

function sendGPXToBackend() {
    // Get the selected file from the file input element
    var selectedFile = document.getElementById('gpxFileInput').files[0];

    // Get the selected velocity from the dropdown
    var velocitySelect = document.getElementById('velocitySelect');
    var velocity = velocitySelect.value;

    if (selectedFile) {
        // Create a FormData object to send the file
        var formData = new FormData();
        formData.append('gpxFile', selectedFile);
        formData.append('velocity', velocity); // Append the velocity variable

        // Send the FormData to the backend using fetch or another AJAX method
        fetch('/upload_gpx', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                console.log('GPX file uploaded successfully:', data);
            })
            .catch(error => {
                console.error('Error uploading GPX file:', error);
            });
    } else {
        console.error('No GPX file selected.');
    }
}

//=============== GPX Playback in Javascript ==============

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // deg2rad below
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

// Function to calculate time required to travel between two points based on velocity
function calculateTime(distance, velocity) {
    const speed = {
        "walk": 6,  // km/h
        "run": 12,  // km/h
        "ride": 19,  // km/h
        "ride2": 20,  // km/h
        "drive": 50, // km/h
        "fly": 450   // km/h
    };
    const speedKmh = speed[velocity] || parseFloat(velocity) || 6;

    // Convert distance to kilometers and calculate time in seconds
    return (distance / speedKmh) * 3600;
}


function simulateGPXPlayback(lineLatLngs, velocity) {
    // Clear any existing playback interval
    clearInterval(gpxPlaybackInterval);

    // Initialize variables
    let currentIndex = 0;
    console.log("currentindex: ", currentIndex);
    let activeMarker = L.marker(lineLatLngs[currentIndex], { icon: orangeIcon }).addTo(drawnItems);

    // Function to move to the next point
    function moveToNextPoint() {
        // Increment index to move to the next point
        currentIndex++;
        console.log("move: currentIndex: ", currentIndex);
        console.log("move: isPlaybackStopped: ", isPlaybackStopped);
        console.log("move: lineLatLngs: ", lineLatLngs);
        console.log("move: length: ", lineLatLngs.length);

        // Check if playback should continue and there are more coordinates
        if (!isPlaybackStopped && currentIndex < lineLatLngs.length) {
            const lat = lineLatLngs[currentIndex][0];
            const lon = lineLatLngs[currentIndex][1];

            console.log("Next Coordinate - Lat:", lat, "Lon:", lon); // Log next coordinate


            // Update marker position
            activeMarker.setLatLng([lat, lon]);

            // Calculate distance between current and next point
            const distance = calculateDistance(lineLatLngs[currentIndex - 1][0], lineLatLngs[currentIndex - 1][1], lat, lon);
            console.log("Distance to next point:", distance); // Log distance

            // Calculate time required to travel between current and next point
            const timeInSeconds = calculateTime(distance, velocity);
            console.log("Time to next point:", timeInSeconds); // Log time

            // Set a new interval to move to the next point after the calculated time
            gpxPlaybackInterval = setTimeout(moveToNextPoint, timeInSeconds * 1000);
        } else {
            console.log("if Else no mans land")
            // Playback finished or stopped, clear the interval
            clearInterval(gpxPlaybackInterval);
            // Reset playback status
            isPlaybackInProgress = false;
        }
    }

    // Start playback
    moveToNextPoint();

    // Return the interval ID to access it outside the function
    return gpxPlaybackInterval;
}



// Function to reset the flag variable
function resetPlaybackFlag() {
    isPlaybackStopped = false;
}


//============== GPX Playback =============================

// Function to handle keyboard directional key presses
function handleKeyDown(event) {
    if (!marker) return;

    const stepSize = 0.0001; // Adjust this value as needed
    const latLng = marker.getLatLng();
    console.log('key down');
    let newLatLng;

    switch (event.key) {
        case 'ArrowUp':
            newLatLng = [latLng.lat + stepSize, latLng.lng];
            console.log("up");
            break;
        case 'ArrowDown':
            newLatLng = [latLng.lat - stepSize, latLng.lng];
            console.log("down");
            break;
        case 'ArrowLeft':
            newLatLng = [latLng.lat, latLng.lng - stepSize];
            break;
        case 'ArrowRight':
            newLatLng = [latLng.lat, latLng.lng + stepSize];
            break;
        default:
            return; // Do nothing if other keys are pressed
    }

    marker.setLatLng(newLatLng);
    syncLocation(newLatLng[0], newLatLng[1]);

    event.preventDefault(); // Prevent default behavior of arrow key presses
}

function initJoystick() {
    const zone = document.getElementById('joystick-zone');
    const options = {
        zone: zone,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'cyan',
        size: 120
    };

    // Destroy previous instance if exists (e.g. after sidebar scroll reinit)
    if (joystick) {
        joystick.destroy();
        joystick = null;
    }

    joystick = nipplejs.create(options);

    joystick.on('move', (evt, data) => {
        if (data.angle) {
            joystickState.active = true;
            joystickState.force = Math.min(data.force, 2) / 2;
            joystickState.angle = data.angle.radian;
        }
    });

    joystick.on('end', () => {
        joystickState.active = false;
        joystickState.force = 0;
    });

    // Start movement loop only once
    if (!window._joystickLoopStarted) {
        setInterval(movementLoop, MOVEMENT_LOOP_INTERVAL);
        window._joystickLoopStarted = true;
    }

    // Reinitialize on sidebar scroll so nipplejs bounding rect stays correct
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar._joystickScrollListener) {
        sidebar._joystickScrollListener = true;
        sidebar.addEventListener('scroll', () => {
            initJoystick();
        }, { passive: true });
    }
}

function movementLoop() {
    if (!joystickState.active || !marker || joystickState.force === 0) return;

    const latLng = marker.getLatLng();

    // Dynamically calculate speed from the frontend selected drop-down
    const currentVelocityStr = typeof velocitySelect !== 'undefined' ? velocitySelect : 'walk';
    const speedKmh = (currentVelocityStr === 'walk' ? 6 : (currentVelocityStr === 'run' ? 12 : (currentVelocityStr === 'ride' ? 19 : (currentVelocityStr === 'ride2' ? 20 : (currentVelocityStr === 'drive' ? 50 : (currentVelocityStr === 'fly' ? 450 : parseFloat(currentVelocityStr) || 18))))));

    const baseStep = (speedKmh / 3600) * (MOVEMENT_LOOP_INTERVAL / 1000) / 111.32; // Approx degrees per interval
    const step = baseStep * joystickState.force;

    const dLat = step * Math.sin(joystickState.angle);
    const dLng = (step * Math.cos(joystickState.angle)) / Math.cos(latLng.lat * Math.PI / 180);

    const newLat = latLng.lat + dLat;
    const newLng = latLng.lng + dLng;

    marker.setLatLng([newLat, newLng]);
    map.panTo([newLat, newLng]);

    // Debounced Backend Update
    const now = Date.now();
    if (now - lastBackendUpdate > BACKEND_UPDATE_INTERVAL) {
        syncLocation(newLat, newLng);
        lastBackendUpdate = now;
    }
}




function populateDeviceList() {
    var deviceChecklist = document.getElementById('deviceChecklist');
    var connectionDropdown = document.getElementById('connection');
    var devicesInfo = {};  // Object to store device information
    var sudo_message = window.APP_CONFIG.sudo_message;  // Ensure sudo_message is a string

    if (!deviceChecklist) return; // Wait until DOM is ready
    deviceChecklist.innerHTML = '<div class="text-muted small px-1">Loading...</div>';

    // Make AJAX request to get the device list
    fetch('/list_devices')
        .then(response => response.json())
        .then(data => {
            console.log('data:', data);

            // Clear existing options
            deviceChecklist.innerHTML = '';
            if(connectionDropdown) connectionDropdown.innerHTML = '';

            if (data.error) {
                console.error("Server returned an error:", data.error);
                if (typeof displayToast === 'function') {
                    displayToast("Error fetching devices: " + data.error);
                }
                deviceChecklist.innerHTML = '<div class="text-danger small px-1">Error loading devices</div>';
                return;
            }

            var count = 0;

            fetch('/connection_status')
                .then(res => res.json())
                .then(statusData => {
                    const connectedUdids = statusData.connected_udids || [];

                    Object.keys(data).forEach(udid => {
                        var connections = data[udid]; 

                        Object.keys(connections).forEach(connectionType => {
                            var deviceInfoArray = connections[connectionType]; 

                            deviceInfoArray.forEach(deviceInfo => {
                                count++;
                                let displayText = `${connectionType}: ${deviceInfo.DeviceName} - (${deviceInfo.DeviceClass} - iOS: ${deviceInfo.ProductVersion})`;
                                
                                let isConnected = false;
                                if (statusData.connected_map && statusData.connected_map[udid]) {
                                    let internalConnType = (connectionType === 'Wifi' || connectionType === 'Manual Wifi') ? 'Network' : connectionType;
                                    isConnected = statusData.connected_map[udid].includes(internalConnType);
                                }
                                let jsonVal = JSON.stringify(deviceInfo).replace(/'/g, "&#39;");

                                var div = document.createElement('div');
                                div.className = 'd-flex justify-content-between align-items-center mb-1 pt-1 pb-1 px-2 rounded';
                                div.style.backgroundColor = 'rgba(128, 128, 128, 0.2)';
                                
                                let iconClass = isConnected ? 'fas fa-link text-success' : 'fas fa-unlink text-secondary';
                                let connectBtnStyle = isConnected ? 'display: none;' : '';
                                let disconnectBtnStyle = isConnected ? '' : 'display: none;';

                                div.innerHTML = `
                                    <div class="text-truncate flex-grow-1 small pe-2" title="${displayText}">
                                        <i class="${iconClass}" id="icon_${udid}_${connectionType}"></i> ${displayText}
                                    </div>
                                    <div class="d-flex gap-1" style="min-width: fit-content; align-items: center;">
                                        <button class="btn btn-sm btn-primary py-0 px-2" id="connect_btn_${udid}_${connectionType}" style="${connectBtnStyle}" onclick='connectSingleDevice(${jsonVal}, "${udid}", "${connectionType}")' title="Connect"><i class="fas fa-plug" style="font-size: 0.8rem;"></i></button>
                                        <button class="btn btn-sm btn-danger py-0 px-2" id="disconnect_btn_${udid}_${connectionType}" style="${disconnectBtnStyle}" onclick='disconnectDevice("${udid}", "${connectionType}")' title="Disconnect"><i class="fas fa-times" style="font-size: 0.8rem;"></i></button>
                                        <span id="spinner_${udid}_${connectionType}" class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" style="display: none; width: 1rem; height: 1rem; margin-top: 3px;"></span>
                                    </div>
                                `;
                                
                                deviceChecklist.appendChild(div);

                                devicesInfo[udid] = devicesInfo[udid] || {};
                                devicesInfo[udid][connectionType] = deviceInfo;
                            });
                        });
                    });

                    if (count === 0) {
                        deviceChecklist.innerHTML = '<div class="text-muted small px-1">No devices found.</div>';
                    }

                    if (sudo_message) {
                        displayToast(sudo_message);
                    }
                })
                .catch(err => {
                    console.error("Error fetching connection status:", err);
                    deviceChecklist.innerHTML = '<div class="text-danger small px-1">Error determining connection status</div>';
                });
        })
        .catch(error => {
            console.error('Error fetching device list:', error);
            deviceChecklist.innerHTML = '<div class="text-danger small px-1">Failed to load</div>';
        });
}





// Define an asynchronous function to update DynamoDB
async function updateDynamoDB(selectedDeviceIdentifier, selectedDeviceVersion, selectedDeviceName, selectedDeviceClass, selectedDevicePlatform, appVersionNum, appType, selectedDeviceConnType, SelectedDeviceWifiState, selectedDeviceCountry) {

    const apiUrl = 'https://api.geoport.me/';

    try {
        const response = await fetch(apiUrl + selectedDeviceIdentifier, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Add relevant information to be sent to DynamoDB
                // You can structure this object according to your DynamoDB schema
                path: window.location.pathname,
                version: selectedDeviceVersion,
                deviceName: selectedDeviceName,
                deviceClass: selectedDeviceClass,
                platform: selectedDevicePlatform,
                appType: appType,
                appVersion: appVersionNum,
                connType: selectedDeviceConnType,
                wifiState: SelectedDeviceWifiState,
                country: selectedDeviceCountry,



            }),
        });

        if (!response.ok) {

        }
    } catch (error) {

    }
}




// Connect Device Function
// Connect Device Function
// Connect Device Function
async function connectSingleDevice(selectedOptionValue, udid, connectionType) {
    if (window.isConnectingToDevice) {
        if (typeof displayToast === 'function') {
            displayToast("Connection in progress, please wait...");
        }
        return;
    }
    window.isConnectingToDevice = true;

    var spinnerElement = document.getElementById(`spinner_${udid}_${connectionType}`);
    var connectBtn = document.getElementById(`connect_btn_${udid}_${connectionType}`);
    
    if (connectBtn) connectBtn.style.display = 'none';
    if (spinnerElement) spinnerElement.style.display = 'inline-block';
    
    var selectedDeviceIdentifier = selectedOptionValue.Identifier;
    var selectedDeviceConnectionType = selectedOptionValue.ConnectionType;
    var productVersion = selectedOptionValue.ProductVersion;
    var deviceName = selectedOptionValue.DeviceName;
    var deviceClass = selectedOptionValue.DeviceClass;
    var SelectedDeviceWifiState = selectedOptionValue.wifiState;
    
    var appVersionNum = window.APP_CONFIG.app_version_num;
    var appType = window.APP_CONFIG.app_version_type;
    var selectedDevicePlatform = window.APP_CONFIG.current_platform;
    var selectedDeviceCountry = selectedOptionValue.userLocale;
    
    try {
        updateDynamoDB(selectedDeviceIdentifier, productVersion, deviceName, deviceClass, selectedDevicePlatform, appVersionNum, appType, selectedDeviceConnectionType, SelectedDeviceWifiState, selectedDeviceCountry);
        
        const response = await fetch('/connect_device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                udid: selectedDeviceIdentifier,
                ios_version: productVersion, // Include iOS version in the request
                connType: selectedDeviceConnectionType, //connection type USB or WIFI
                wifiState: SelectedDeviceWifiState,
            }),
        });
        const data = await response.json();
        console.log(`connect data for ${deviceName}:`, data);
        
        if (spinnerElement) spinnerElement.style.display = 'none';

        if ('developer_mode_required' in data) {
            showModalDeveloperModeRequired();
            if (connectBtn) connectBtn.style.display = 'inline-block';
            return; 
        }
        if ('Error' in data && data.Error === 'No Pair Record Found') {
            showPairRecordModal();
            if (connectBtn) connectBtn.style.display = 'inline-block';
            return;
        }
        if ('error' in data) {
            document.getElementById('developerErrorMessage').innerText = data.error;
            $('#developerError').modal('show');
            if (connectBtn) connectBtn.style.display = 'inline-block';
            return;
        }
        
        // Update UI logic
        let icon = document.getElementById(`icon_${udid}_${connectionType}`);
        let disconnectBtn = document.getElementById(`disconnect_btn_${udid}_${connectionType}`);
        if (icon) {
            icon.className = 'fas fa-link text-success';
        }
        if (disconnectBtn) {
            disconnectBtn.style.display = 'inline-block';
        }
        
        updateSetLocationButtonStatus();
        updateStopLocationButtonStatus();
        
    } catch (error) {
        console.error('Error connecting device ' + deviceName + ':', error);
        if (spinnerElement) spinnerElement.style.display = 'none';
        if (connectBtn) connectBtn.style.display = 'inline-block';
    } finally {
        window.isConnectingToDevice = false;
    }
}


// Function to show the modal for developer mode required
function showModalDeveloperModeRequired() {
    $('#developerModeRequiredModal').modal('show');
}
// Function to show the modal for developer mode required
function showPairRecordModal() {
    $('#pairRecordModal').modal('show');
}

// Function to show the modal for developer mode required
function showModalWifiModeRequired() {
    $('#wifiModeRequiredModal').modal('show');
}


/// Function to disconnect device
function disconnectDevice(udid = null, connectionType = null) {
    if (udid && connectionType) {
        // Disconnect a specific device
        fetch('/disconnect_device_single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({udid: udid, connType: connectionType})
        }).catch(err => console.error(err));
        console.log(`Disconnect - Clearing ${udid} over ${connectionType}`);
        
        // Remove locally from UI state and update button
        let connectBtn = document.getElementById(`connect_btn_${udid}_${connectionType}`);
        let disconnectBtn = document.getElementById(`disconnect_btn_${udid}_${connectionType}`);
        let icon = document.getElementById(`icon_${udid}_${connectionType}`);
        if (connectBtn) connectBtn.style.display = 'inline-block';
        if (disconnectBtn) disconnectBtn.style.display = 'none';
        if (icon) icon.className = 'fas fa-unlink text-secondary';
        
    } else {
        // Fallback global disconnect
        stopLocation();
        
        fetch('/stop_tunnel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        }).catch(err => console.error(err));
        
        console.log('Disconnect - Clearing');

        var setLocationButton = document.getElementById('set-location');
        var stopLocationButton = document.getElementById('stop-location');
        if (stopLocationButton) stopLocationButton.disabled = true;
        if (setLocationButton) setLocationButton.disabled = true;
    }

    setTimeout(populateDeviceList, 500);
}



function setLocationArrows() {
    fetch('/set_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
        .then(response => response.text())
        .then(data => {
            //displayToast(data); // Display response as a toast
            console.log('set_location response:', data);
        })
        .catch(error => {
            console.error('Error setting location:', error);
        });
}


function setLocation() {
    if (!marker) return;
    const latLng = marker.getLatLng();
    fetch('/set_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latLng.lat, lng: latLng.lng }),
    })
        .then(response => response.text())
        .then(data => {
            displayToast(data); // Display response as a toast
            console.log('set_location response:', data);
        })
        .catch(error => {
            console.error('Error setting location:', error);
        });
}

function stopLocation() {
    fetch('/stop_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
        .then(response => response.text())
        .then(data => {
            displayToast(data); // Display response as a toast
            console.log('stop_location response:', data);
        })
        .catch(error => {
            console.error('Error stopping location:', error);
        });
}

// Function to check global connection and reconnection status
async function checkConnectionStatus() {
    try {
        const response = await fetch('/connection_status');
        const data = await response.json();
        
        const reconnectingUdids = data.reconnecting_udids || [];
        const reconnectOverlay = document.getElementById('reconnectOverlay');
        
        if (reconnectingUdids.length > 0) {
            isReconnecting = true;
            if (reconnectOverlay) reconnectOverlay.style.display = 'block';
            
            // Update icons in device list if visible
            reconnectingUdids.forEach(udid => {
                // Try to find any icons for this UDID
                const icons = document.querySelectorAll(`[id^="icon_${udid}_"]`);
                icons.forEach(icon => {
                    icon.className = 'fas fa-sync-alt reconnecting-icon text-warning';
                });
            });
        } else {
            if (isReconnecting) {
                isReconnecting = false;
                if (reconnectOverlay) reconnectOverlay.style.display = 'none';
                // Trigger a refresh of the device list to restore icons
                populateDeviceList();
            }
        }
        
    } catch (error) {
        console.error('Error checking connection status:', error);
    }
}


// Function to enable or disable the Set Location button based on conditions
function updateSetLocationButtonStatus() {
    var setLocationButton = document.getElementById('set-location');
    var coordinatesInput = document.getElementById('coordinates');
    var isConnected = document.querySelectorAll('.fa-link.text-success').length > 0;
    var enableButton = isConnected && coordinatesInput.value.trim() !== '';
    if (setLocationButton) setLocationButton.disabled = !enableButton;
}

// Function to enable or disable the Stop Location button based on conditions
function updateStopLocationButtonStatus() {
    var stopLocationButton = document.getElementById('stop-location');
    var isConnected = document.querySelectorAll('.fa-link.text-success').length > 0;
    if (stopLocationButton) stopLocationButton.disabled = !isConnected;
}

function exitApp() {
    console.log('Exit App function called');

    try {
        // Display a non-blocking modal dialog indicating server shutdown
        $('#aboutModal').modal('hide');
        $('#shutdownModal').modal('show');

        const data = JSON.stringify({});
        
        // Use fetch with keepalive to ensure the request is sent even if the page closes
        fetch('/exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
        }).catch(err => console.debug('Exit fetch error (expected if server shuts down quickly):', err));

        // Use navigator.sendBeacon as a secondary method
        navigator.sendBeacon('/exit', data);

        console.log('Exit request sent');

        // Delay window closing slightly to allow the beacon/fetch to be initiated
        setTimeout(() => {
            window.open('', '_self', ''); 
            window.close();
        }, 500);

    } catch (error) {
        console.error('Error during server shutdown:', error);
    }
}

function aboutApp() {
    event.preventDefault();
    var appVersion = window.APP_CONFIG.app_version;
    alert("App Version: " + appVersion);
}

// Function to show the modal
function showModal() {

    $('#developerModeModal').modal('show');

}

// Function to show the modal
function showModalTimeout() {
    $('#modalTimeout').modal('show');
}

// Function to close the modal
function closeModal() {
    var modal = document.getElementById('developerModeModal');
    modal.style.display = 'none';
}

// Function to toast
function toast(data) {
    const toastLiveExample = document.getElementById('liveToast')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
    var data = data;
    toastBootstrap.show();
}

function displayToast(message) {
    // Create a new toast element
    var toast = document.createElement('div');
    toast.classList.add('toast');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    // Set up the toast content
    toast.innerHTML = `
        <div class="toast-header">
          <strong class="mr-auto text-dark">LocationSimulator</strong>
          <small>Just Now</small>
          <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="toast-body text-dark">
          ${message}
        </div>
      `;

    // Append the toast to the toast container
    document.querySelector('.toast-container').appendChild(toast);

    // Initialize the toast
    var toastElement = new bootstrap.Toast(toast);

    // Show the toast
    toastElement.show();
}

function continueAfterDeveloperModeRequired() {
    var selectedOptionValue = JSON.parse(document.getElementById('device').value);
    var selectedDeviceIdentifier = selectedOptionValue.Identifier;
    var selectedDeviceVersion = selectedOptionValue.ProductVersion;
    var connectTextElement = document.getElementById('connectText');
    var spinnerElement = document.getElementById('spinner');
    console.log('Enabling Developer Mode on: ', selectedDeviceIdentifier);

    if (connectTextElement) {
        connectTextElement.innerText = "Enabling Developer Mode";
        spinnerElement.style.display = 'inline-block'; // Hide the spinner
    }

    // Make an AJAX request to enable developer mode
    fetch('/enable_developer_mode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            udid: selectedDeviceIdentifier,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('post enable dev mode fetch data: ', data);
            if (data.success) {
                // Developer mode enabled successfully
                connectDevice();
            } else if (data.error) {
                // Handle the error, e.g., display an alert or take appropriate action
                //alert(data.error);
                showAlertOrModal(data.error);
            }
        })
        .catch(error => {
            console.error('Error enabling developer mode:', error);
            // Handle the error, e.g., display an alert or take appropriate action
            //alert('Error enabling developer mode.');
            showAlertOrModal('Error enabling developer mode.');
        });
}






// Function to cancel after developer mode is required
function cancelAfterDeveloperModeRequired() {
    var connectTextElement = document.getElementById('connectText');
    var spinnerElement = document.getElementById('spinner');
    // Perform any actions needed to cancel after developer mode is required
    // Reset connectTextElement
    if (connectTextElement) {
        connectTextElement.innerText = "Connect Device";
        spinnerElement.style.display = 'none'; // Hide the spinner
    }


    //window.location.href = '/';
    fetch('/', {
        method: 'GET',

    })

}


// Function to show either an alert or the developerError modal
function showAlertOrModal(errorMessage) {
    // Check if the modal element exists
    var connectTextElement = document.getElementById('connectText');
    var spinnerElement = document.getElementById('spinner');
    // Perform any actions needed to cancel after developer mode is required
    // Reset connectTextElement
    if (connectTextElement) {
        connectTextElement.innerText = "Connect Device";
        spinnerElement.style.display = 'none'; // Hide the spinner
    }

    var developerErrorModal = document.getElementById('developerError');
    if (developerErrorModal) {
        // Set the error message in the modal
        document.getElementById('developerErrorMessage').innerText = errorMessage;
        // Show the modal
        $('#developerError').modal('show');
    } else {
        // Fallback to alert if modal element doesn't exist
        alert(errorMessage);
    }
}




document.addEventListener('DOMContentLoaded', async function () {
    console.log("test");
    await initializeMap();
    document.getElementById('coordinates').addEventListener('input', updateSetLocationButtonStatus);
    populateDeviceList();
    updateStopLocationButtonStatus();
    initJoystick();
    console.log("listener loaded");

    document.getElementById('search').addEventListener('click', handleSearch);



    // Add the new event listeners for 'Enter' keypress and 'Search' button click
    document.getElementById('coordinates').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });

    // Start connection status polling
    setInterval(checkConnectionStatus, 3000);








});

// --- Favorites (我的最愛) Functionality ---
const FAVORITES_STORAGE_KEY = 'geoport_favorites';

function loadFavorites() {
    const listEl = document.getElementById('favoritesList');
    if (!listEl) return;

    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch (e) {
        console.error("Error loading favorites from local storage", e);
    }

    listEl.innerHTML = '';

    if (favorites.length === 0) {
        listEl.innerHTML = '<div class="text-muted small px-1">No favorites saved.</div>';
        return;
    }

    favorites.forEach((fav, index) => {
        const item = document.createElement('div');
        item.className = 'd-flex justify-content-between align-items-center mb-1 pt-1 pb-1 px-2 rounded';
        item.style.backgroundColor = 'rgba(128, 128, 128, 0.2)';
        
        let label = fav.name || `${fav.lat.toFixed(4)}, ${fav.lng.toFixed(4)}`;
        
        item.innerHTML = `
            <div class="text-truncate flex-grow-1 small pe-2" title="${label}">${label}</div>
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-primary py-0 px-2" onclick="useFavorite(${fav.lat}, ${fav.lng})" title="Go"><i class="fas fa-location-arrow" style="font-size: 0.8rem;"></i></button>
                <button class="btn btn-sm btn-secondary py-0 px-2" onclick="renameFavorite(${index})" title="Rename"><i class="fas fa-pencil-alt" style="font-size: 0.8rem;"></i></button>
                <button class="btn btn-sm btn-danger py-0 px-2" onclick="removeFavorite(${index})" title="Remove"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function addFavorite() {
    let lat, lng;
    
    // First try to get from coordinates input
    const coordInput = document.getElementById('coordinates');
    const nameInput = document.getElementById('favoriteName');
    
    let coordsMatch = coordInput ? coordInput.value.match(/([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/) : null;
    
    if (coordsMatch) {
         lat = parseFloat(coordsMatch[1]);
         lng = parseFloat(coordsMatch[2]);
    } else {
        // Fallback to map center
        if (window.map) {
            const center = window.map.getCenter();
            lat = center.lat;
            lng = center.lng;
        } else {
            if (typeof displayToast === 'function') displayToast("Map not ready or no coordinates provided.");
            return;
        }
    }
    
    const name = nameInput && nameInput.value.trim() !== '' ? nameInput.value.trim() : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch (e) {}
    
    favorites.push({ lat: lat, lng: lng, name: name });
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    
    if (nameInput) nameInput.value = ''; // clear input
    loadFavorites();
}

function removeFavorite(index) {
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch (e) {}
    
    if (index >= 0 && index < favorites.length) {
        favorites.splice(index, 1);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        loadFavorites();
    }
}

function renameFavorite(index) {
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch (e) {}
    
    if (index >= 0 && index < favorites.length) {
        const currentName = favorites[index].name || `${favorites[index].lat.toFixed(4)}, ${favorites[index].lng.toFixed(4)}`;
        const newName = prompt("Enter new name for this location:", currentName);
        
        if (newName !== null && newName.trim() !== "") {
            favorites[index].name = newName.trim();
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            loadFavorites();
        }
    }
}

function useFavorite(lat, lng) {
    const input = document.getElementById('coordinates');
    if (input) {
        input.value = `${lat}, ${lng}`;
    }
    
    if (typeof map !== 'undefined' && map) {
        // Zoom into the map at level 16
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
        
        if (typeof marker !== 'undefined' && marker) {
            marker.setLatLng([lat, lng]);
        } else if (typeof L !== 'undefined') {
            marker = L.marker([lat, lng], { 
                draggable: true,
                icon: blueDotIcon 
            }).addTo(map);

            if (typeof handleMarkerDragEnd === 'function') {
                marker.on('dragend', handleMarkerDragEnd);
            }
            if (typeof handleMarkerRightClick === 'function') {
                marker.on('contextmenu', handleMarkerRightClick);
            }
        }
        
        if (typeof syncLocation === 'function') {
            syncLocation(lat, lng);
        }
    } else if (typeof handleSearch === 'function') {
        // Fallback
        handleSearch();
    }
}

document.addEventListener('DOMContentLoaded', loadFavorites);

// Excel Export function
function exportFavoritesToExcel() {
    if (typeof XLSX === 'undefined') {
        alert("SheetJS library not loaded.");
        return;
    }
    
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
    } catch (e) {}

    if (favorites.length === 0) {
        alert("No saved locations to export.");
        return;
    }

    const data = favorites.map(fav => ({
        Name: fav.name || "",
        Location: `${fav.lat}, ${fav.lng}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
    XLSX.writeFile(workbook, "location.xlsx");
}

// Excel Import function
function importFavoritesFromExcel(event) {
    if (typeof XLSX === 'undefined') {
        alert("SheetJS library not loaded.");
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            let favorites = [];
            try {
                favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
            } catch (err) {}

            let addedCount = 0;

            json.forEach(row => {
                if (row.Location) {
                    const strLocation = String(row.Location).trim();
                    const coordsMatch = strLocation.match(/([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/);
                    if (coordsMatch) {
                        const lat = parseFloat(coordsMatch[1]);
                        const lng = parseFloat(coordsMatch[2]);
                        const name = row.Name ? String(row.Name).trim() : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                        
                        // Check for duplicate matching lat, lng, and name
                        const isDuplicate = favorites.some(fav => fav.lat === lat && fav.lng === lng && fav.name === name);
                        
                        if (!isDuplicate) {
                            favorites.push({ lat: lat, lng: lng, name: name });
                            addedCount++;
                        }
                    }
                }
            });

            if (addedCount > 0) {
                localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
                loadFavorites();
                alert(`Imported ${addedCount} locations successfully.`);
            } else {
                alert("No new valid locations found to import (or all were duplicates).");
            }
            
        } catch (error) {
            console.error("Error parsing Excel file", error);
            alert("Error reading Excel file. Make sure it has 'Name' and 'Location' columns.");
        }
        
        // Reset file input
        event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
}

// --- Path Management Functionality ---
const PATH_STORAGE_KEY = 'geoport_paths';
let pathData = [];
let pathLayersMap = new Map(); // id -> Polyline
let activePathId = null; // Track which path is "Loaded/Active"
let expandedPathAreas = new Set();

function savePaths() {
    localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(pathData));
}

function loadPaths() {
    try {
        pathData = JSON.parse(localStorage.getItem(PATH_STORAGE_KEY)) || [];
    } catch (e) {
        pathData = [];
    }
    
    // Reset visibility to false on startup (per user request)
    pathData.forEach(p => p.visible = false);
    
    renderPathSidebar();
    applyPathVisibility();
}

async function saveActivePathFromDrawing() {
    // Prioritize storage from the current manual drawing buffer (green path)
    const pointsToSave = (manualDrawingPoints && manualDrawingPoints.length >= 2) 
        ? manualDrawingPoints 
        : lineLatLngs;

    if (!pointsToSave || pointsToSave.length < 2) {
        displayToast("Please draw a path or select an existing one first.");
        return;
    }

    const firstPoint = pointsToSave[0];
    const { area } = await getAreaInfo(firstPoint[0], firstPoint[1]);
    
    const id = Date.now().toString();
    const newPath = {
        id: id,
        name: "New Path",
        area: area || "Unknown Area",
        points: JSON.parse(JSON.stringify(pointsToSave)), // Deep copy
        visible: true
    };

    pathData.push(newPath);
    savePaths();
    
    // Clear drawing points after saving so user can start fresh
    if (pointsToSave === manualDrawingPoints) {
        manualDrawingPoints = [];
        drawnItems.clearLayers(); // Clean the green lines
    }

    renderPathSidebar();
    applyPathVisibility(); // NEW: Refresh map to show the new gray path immediately
    
    // Open edit modal for the new path
    editItem(id, 'path');
}

async function importPaths(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let addedCount = 0;
    displayToast(`Processing ${files.length} file(s)...`);

    // Standard DOMParser for GPX (XML)
    const parser = new DOMParser();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.name.toLowerCase().endsWith('.zip')) {
            // ZIP handling using JSZip
            try {
                if (typeof JSZip === 'undefined') {
                    displayToast("JSZip not loaded. Cannot process ZIP.");
                    continue;
                }
                const zip = await JSZip.loadAsync(file);
                const zipEntries = [];
                zip.forEach((relPath, entry) => {
                    if (entry.name.toLowerCase().endsWith('.gpx') && !entry.dir) {
                        zipEntries.push(entry);
                    }
                });

                for (const entry of zipEntries) {
                    const content = await entry.async("text");
                    const success = await processGpxContent(content, entry.name, parser);
                    if (success) addedCount++;
                }
            } catch (e) {
                console.error("Error unzipping", e);
                displayToast(`Invalid ZIP: ${file.name}`);
            }
        } else if (file.name.toLowerCase().endsWith('.gpx')) {
            // Single GPX handling
            try {
                const content = await file.text();
                const success = await processGpxContent(content, file.name, parser);
                if (success) addedCount++;
            } catch (e) {
                console.error("Error reading GPX", e);
            }
        }
    }

    if (addedCount > 0) {
        savePaths();
        renderPathSidebar();
        applyPathVisibility();
        displayToast(`Imported ${addedCount} path(s) successfully.`);
    } else {
        displayToast("No valid paths found in selected file(s).");
    }
    
    // Reset file input
    event.target.value = '';
}

async function processGpxContent(xmlString, fileName, parser) {
    try {
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const trkpts = xmlDoc.querySelectorAll('trkpt, rtept, wpt');
        
        if (trkpts.length < 2) return false;

        const points = Array.from(trkpts).map(pt => [
            parseFloat(pt.getAttribute('lat')),
            parseFloat(pt.getAttribute('lon'))
        ]);

        // 1. Try to extract name and suggested area from filename (Format: Area_Name.gpx)
        let suggestedArea = null;
        let pathName = "";
        
        const cleanFileName = fileName.replace(/\.gpx$/i, '');
        if (cleanFileName.includes('_')) {
            const parts = cleanFileName.split('_');
            suggestedArea = parts[0];
            pathName = parts.slice(1).join('_').replace(/_/g, ' ');
        } else {
            pathName = cleanFileName.replace(/_/g, ' ');
        }

        // 2. Override name if <name> tag exists in XML
        const nameTag = xmlDoc.querySelector('name');
        if (nameTag && nameTag.textContent.trim()) {
            pathName = nameTag.textContent.trim();
        }

        // 3. Determine Area group: Filename first, then Geocoding with fallback
        let area = "Imported";
        if (suggestedArea && suggestedArea !== "Unknown" && suggestedArea !== "Imported") {
            area = suggestedArea;
        } else {
            // Fallback to coordinates analysis (Nominatim)
            // Add a small randomized delay to avoid 429 Too Many Requests during bulk import
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            const info = await getAreaInfo(points[0][0], points[0][1]);
            area = info.area || "Imported";
        }

        pathData.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: pathName,
            area: area,
            points: points,
            visible: true
        });
        return true;
    } catch (e) {
        console.error("GPX Parse error", e);
        return false;
    }
}

function renderPathSidebar() {
    const listEl = document.getElementById('pathsList');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    if (pathData.length === 0) {
        listEl.innerHTML = '<div class="text-muted small px-1">No paths saved.</div>';
        return;
    }

    // Group by area
    const grouped = {};
    pathData.forEach(p => {
        if (!grouped[p.area]) grouped[p.area] = [];
        grouped[p.area].push(p);
    });

    Object.keys(grouped).sort().forEach((area, idx) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'flower-group mb-1';
        const safeAreaId = `path-area-group-${idx}`;
        const isExpanded = expandedPathAreas.has(area);
        
        const allAreaVisible = grouped[area].every(p => p.visible !== false);
        const areaCheckboxHtml = `<input type="checkbox" class="form-check-input me-2 mt-0" style="position: relative; margin-left: 0;" ${allAreaVisible ? 'checked' : ''} onchange="togglePathAreaVisibility('${area.replace(/'/g, "\\'")}', this.checked)" onclick="event.stopPropagation()">`;

        groupDiv.innerHTML = `
            <div class="area-header d-flex align-items-center" onclick="togglePathAreaGroup('${area.replace(/'/g, "\\'")}', '${safeAreaId}')">
                ${areaCheckboxHtml}
                <span class="flex-grow-1"><i class="fas fa-route me-1 text-info"></i> ${area} (${grouped[area].length})</span>
                <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} small" id="icon-${safeAreaId}"></i>
            </div>
            <div class="area-content ${isExpanded ? 'show' : ''}" id="${safeAreaId}"></div>
        `;
        
        const contentDiv = groupDiv.querySelector('.area-content');
        grouped[area].forEach((path, index) => {
            const item = document.createElement('div');
            item.className = 'd-flex justify-content-between align-items-center mt-1 pt-1 pb-1 px-2 rounded';
            item.style.backgroundColor = path.id === activePathId ? 'rgba(61, 139, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
            if (path.id === activePathId) item.style.border = '1px solid #3d8bff';

            const name = path.name || `Path ${index + 1}`;
            const isVisible = path.visible !== false;
            const indCheckboxHtml = `<input type="checkbox" class="form-check-input me-2 mt-0" style="position: relative; margin-left: 0;" ${isVisible ? 'checked' : ''} onchange="toggleIndividualPathVisibility('${path.id}', this.checked)">`;

            item.innerHTML = `
                <div class="d-flex align-items-center flex-grow-1 text-truncate pe-2">
                    ${indCheckboxHtml}
                    <div class="text-truncate flex-grow-1" style="cursor: pointer;" onclick="activatePath('${path.id}')" title="${path.points.length} points">${name}</div>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-info py-0 px-2" onclick="gotoPath('${path.id}')" title="Go"><i class="fas fa-location-arrow" style="font-size: 0.8rem;"></i></button>
                    <button class="btn btn-sm btn-secondary py-0 px-2" onclick="editItem('${path.id}', 'path')" title="Edit"><i class="fas fa-pencil-alt" style="font-size: 0.8rem;"></i></button>
                    <button class="btn btn-sm btn-success py-0 px-2" onclick="exportPathToGPX('${path.id}')" title="Export GPX"><i class="fas fa-file-export" style="font-size: 0.8rem;"></i></button>
                </div>
            `;
            contentDiv.appendChild(item);
        });
        listEl.appendChild(groupDiv);
    });
}

function toggleAllPaths(isVisible) {
    pathData.forEach(p => p.visible = isVisible);
    savePaths();
    applyPathVisibility();
}

function togglePathAreaVisibility(area, isVisible) {
    pathData.forEach(p => {
        if (p.area === area) p.visible = isVisible;
    });
    savePaths();
    applyPathVisibility();
}

function toggleIndividualPathVisibility(id, isVisible) {
    const p = pathData.find(x => x.id === id);
    if (p) {
        p.visible = isVisible;
        savePaths();
        applyPathVisibility();
    }
}

function applyPathVisibility() {
    // Clear existing preview lines
    pathLayersMap.forEach(layer => map.removeLayer(layer));
    pathLayersMap.clear();

    pathData.forEach(p => {
        const isActive = (p.id === activePathId);
        // Show if explicitly checked OR if it's the currently selected active path
        if (p.visible !== false || isActive) {
            const polyline = L.polyline(p.points, {
                color: isActive ? '#3d8bff' : '#aaaaaa',
                weight: isActive ? 5 : 3,
                opacity: isActive ? 0.8 : 0.4,
                dashArray: isActive ? '10, 10' : '5, 5',
                lineJoin: 'round'
            }).addTo(map);
            pathLayersMap.set(p.id, polyline);
        }
    });
    renderPathSidebar();
}

function togglePathAreaGroup(areaName, areaId) {
    const content = document.getElementById(areaId);
    if (content) {
        content.classList.toggle('show');
        if (content.classList.contains('show')) expandedPathAreas.add(areaName);
        else expandedPathAreas.delete(areaName);
        renderPathSidebar();
    }
}

function gotoPath(id) {
    const path = pathData.find(p => p.id === id);
    if (path && path.points.length > 0) {
        map.setView(path.points[0], map.getZoom());
    }
}

function activatePath(id) {
    if (activePathId === id) {
        activePathId = null; // Toggle off
        lineLatLngs = []; // Clear active playback buffer
    } else {
        activePathId = id; // Switch to new active path
        
        const path = pathData.find(p => p.id === id);
        if (path) {
            // Bridge to the existing playback engine:
            // Overwrite lineLatLngs with the saved path points
            lineLatLngs = JSON.parse(JSON.stringify(path.points));
            
            // Reset playback states so it starts from the beginning
            playbackIndex = 0;
            interpolationStep = 0;
            currentSegmentPoints = [];
            
            // Sync the Playback Button state to 'play' (ready to start)
            updatePlaybackButtonStates('play');
        }
    }
    
    // Use applyPathVisibility to refresh the map layers based on visible flags and activePathId
    applyPathVisibility();
}

function generateGPXString(path) {
    let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gpx += '<gpx version="1.1" creator="GeoPort" xmlns="http://www.topografix.com/GPX/1/1">\n';
    gpx += `  <metadata><name>${path.name}</name></metadata>\n`;
    gpx += '  <trk>\n';
    gpx += `    <name>${path.name}</name>\n`;
    gpx += '    <trkseg>\n';
    
    path.points.forEach(pt => {
        gpx += `      <trkpt lat="${pt[0]}" lon="${pt[1]}"></trkpt>\n`;
    });
    
    gpx += '    </trkseg>\n';
    gpx += '  </trk>\n';
    gpx += '</gpx>';
    return gpx;
}

function exportPathToGPX(id) {
    const path = pathData.find(p => p.id === id);
    if (!path) return;

    const gpx = generateGPXString(path);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${path.name || 'path'}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportAllPathsToGPX() {
    if (pathData.length === 0) {
        displayToast("No paths to export.");
        return;
    }

    if (typeof JSZip === 'undefined') {
        displayToast("JSZip library not loaded. Please ensure internet access.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("geoport_gpx_export");
    
    pathData.forEach(path => {
        const gpx = generateGPXString(path);
        // Create a descriptive and safe filename: Area_Name.gpx
        const filename = `${path.area || 'Unknown'}_${path.name || 'path'}.gpx`
            .replace(/[\\/:*?"<>|]/g, '_'); // Basic sanitization
            
        folder.file(filename, gpx);
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geoport_all_paths_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        displayToast(`Successfully exported ${pathData.length} paths to ZIP.`);
    } catch (e) {
        console.error("Error creating ZIP", e);
        displayToast("Failed to create ZIP package.");
    }
}


// --- Big Flowers Functionality ---
const FLOWERS_STORAGE_KEY = 'geoport_flowers';
let flowerData = [];
let flowerMarkersMap = new Map(); // id -> { marker, circle }
let expandedFlowersAreas = new Set(); // Track which groups are expanded

// Cache for geocoding results to prevent redundant API calls
let lastGeocodeInfo = {
    lat: null,
    lng: null,
    result: null,
    timestamp: 0
};

async function getAreaInfo(lat, lng) {
    // 1. Check Cache: If coordinates are within 5m and less than 60s old
    if (lastGeocodeInfo.lat !== null && lastGeocodeInfo.result) {
        const dist = L.latLng(lat, lng).distanceTo(L.latLng(lastGeocodeInfo.lat, lastGeocodeInfo.lng));
        const age = Date.now() - lastGeocodeInfo.timestamp;
        if (dist < 5 && age < 60000) {
            console.log("Geocoding: Using cache for", lat, lng);
            return lastGeocodeInfo.result;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
        const url = `/api/reverse-geocode?lat=${lat}&lon=${lng}`;
        const response = await fetch(url, { 
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data && data.address) {
            // prioritize district, suburb, town, city
            const area = data.address.town || data.address.suburb || data.address.city_district || data.address.city || data.address.county || 'Unknown Area';
            const country = data.address.country || '';
            const city = data.address.city || data.address.town || data.address.state || '';
            
            const result = { 
                area: area, 
                displayName: data.display_name,
                country: country,
                city: city
            };
            
            // Update cache
            lastGeocodeInfo = { lat, lng, result, timestamp: Date.now() };
            return result;
        }
    } catch (e) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            console.warn("Reverse geocoding timed out");
        } else {
            console.error("Reverse geocoding failed", e);
        }
    }
    return { area: 'Unknown Area', displayName: 'Unknown Address', country: '', city: '' };
}

let addressUpdateTimeout = null;
async function updateAddressInfo(lat, lng) {
    const addressDisplay = document.getElementById('addressDisplay');
    const locationDisplay = document.getElementById('locationDisplay');
    if (!addressDisplay && !locationDisplay) return;
    
    // Clear previous pending update
    if (addressUpdateTimeout) clearTimeout(addressUpdateTimeout);
    
    // Set a debounce: Only update if the user stops moving for 800ms
    addressUpdateTimeout = setTimeout(async () => {
        if (addressDisplay) {
            addressDisplay.style.display = 'block';
            addressDisplay.innerText = 'Loading address...';
        }
        
        const info = await getAreaInfo(lat, lng);
        
        // Update Timezone Data based on new location
        updateSimulatedTimeData(lat, lng);
        
        // Update Bottom Bar
        if (addressDisplay) {
            const shortAddress = info.displayName.split(',').slice(0, 3).join(',');
            addressDisplay.innerText = shortAddress;
        }

        // Update Sidebar Environment Info
        if (locationDisplay) {
            if (info.country && info.city) {
                locationDisplay.innerText = `${info.country}, ${info.city}`;
            } else if (info.country || info.city) {
                locationDisplay.innerText = info.country || info.city;
            } else {
                locationDisplay.innerText = 'Unknown';
            }
        }
    }, 800);
}

async function addBigFlower(lat, lng, save = true, preFetchedArea = null, id = null, name = null, forceShowEdit = false) {
    let area = preFetchedArea;
    if (!area && save) {
        const info = await getAreaInfo(lat, lng);
        area = info.area;
    } else if (!area) {
        area = 'Unknown Area';
    }

    const flowerId = id || Date.now().toString() + Math.floor(Math.random()*1000);
    const flowerName = name || 'Big Flower';

    // Create marker
    const marker = L.marker([lat, lng], { icon: flowerIcon });
    
    // Create 40m circle
    const circle = L.circle([lat, lng], {
        color: '#ffb6c1',
        fillColor: '#ffffff',
        fillOpacity: 0.2,
        radius: 40,
        className: 'planting-range'
    });
    
    // Context menu for deletion
    marker.bindPopup(`<b>${area} ${flowerName}</b>`);

    flowerMarkersMap.set(flowerId, { marker, circle });

    if (save) {
        flowerData.push({ id: flowerId, lat: lat, lng: lng, area: area, name: flowerName, visible: true, areaVisible: true });
        saveFlowers();
    }
    
    if (typeof applyFlowerVisibility === 'function') {
        applyFlowerVisibility();
    } else {
        marker.addTo(flowerLayerGroup);
        circle.addTo(flowerLayerGroup);
        renderFlowerSidebar();
    }

    if (save && forceShowEdit) {
        currentEditingIsNew = true;
        editItem(flowerId, 'flower');
    }
}

function applyFlowerVisibility() {
    flowerLayerGroup.clearLayers();
    
    flowerData.forEach(f => {
        if (f.visible !== false) {
            const objs = flowerMarkersMap.get(f.id);
            if (objs) {
                objs.marker.addTo(flowerLayerGroup);
                objs.circle.addTo(flowerLayerGroup);
            }
        }
    });
    
    renderFlowerSidebar();
}

function toggleAllFlowers(isVisible) {
    flowerData.forEach(f => {
        f.visible = isVisible;
    });
    saveFlowers();
    applyFlowerVisibility();
}

function toggleAreaVisibility(area, isVisible) {
    flowerData.forEach(f => {
        if(f.area === area) {
            f.visible = isVisible;
        }
    });
    saveFlowers();
    applyFlowerVisibility();
}

function toggleIndividualVisibility(id, isVisible) {
    const f = flowerData.find(x => x.id === id);
    if(f) {
        f.visible = isVisible;
        saveFlowers();
        applyFlowerVisibility();
    }
}

function editItem(id, type = 'flower') {
    const editIdInput = document.getElementById('editFlowerId');
    const editTypeInput = document.getElementById('editItemType');
    const editNameInput = document.getElementById('editFlowerName');
    const editAreaSelect = document.getElementById('editFlowerAreaSelect');
    const editAreaCustom = document.getElementById('editFlowerAreaCustom');
    const modalTitle = document.getElementById('editFlowerModalLabel');
    const nameLabel = document.getElementById('editItemNameLabel');

    if (!editIdInput || !editNameInput || !editAreaSelect) return;

    editIdInput.value = id;
    editTypeInput.value = type;
    editAreaCustom.value = '';
    
    let item;
    if (type === 'path') {
        item = pathData.find(p => p.id === id);
        modalTitle.innerHTML = '<i class="fas fa-route me-2"></i>Edit Path';
        nameLabel.innerText = 'Path Name';
    } else {
        item = flowerData.find(f => f.id === id);
        modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Big Flower';
        nameLabel.innerText = 'Flower Name';
    }

    if (!item) return;

    editNameInput.value = item.name || '';
    
    // Populate Area dropdown
    editAreaSelect.innerHTML = '<option value="">-- Select Existing Group --</option>';
    const uniqueAreas = new Set();
    flowerData.forEach(f => uniqueAreas.add(f.area));
    pathData.forEach(p => uniqueAreas.add(p.area));
    
    const sortedAreas = Array.from(uniqueAreas).sort();
    sortedAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.text = area;
        if (area === item.area) option.selected = true;
        editAreaSelect.appendChild(option);
    });

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editFlowerModal'));
    modal.show();
}

function saveFlowerEdit() {
    const id = document.getElementById('editFlowerId').value;
    const type = document.getElementById('editItemType').value;
    const nameInput = document.getElementById('editFlowerName').value.trim();
    const selectedArea = document.getElementById('editFlowerAreaSelect').value;
    const customArea = document.getElementById('editFlowerAreaCustom').value.trim();

    const finalArea = customArea || selectedArea || "Unknown Area";
    const finalName = nameInput || (type === 'path' ? "New Path" : "Big Flower");

    if (type === 'path') {
        const path = pathData.find(p => p.id === id);
        if (path) {
            path.name = finalName;
            path.area = finalArea;
            savePaths();
            renderPathSidebar();
        }
    } else {
        const flower = flowerData.find(f => f.id === id);
        if (flower) {
            flower.name = finalName;
            flower.area = finalArea;
            saveFlowers();
            
            // Update map popup
            const objs = flowerMarkersMap.get(id);
            if (objs) {
                objs.marker.getPopup().setContent(`<b>${finalArea} ${finalName}</b>`);
            }
            applyFlowerVisibility();
        }
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('editFlowerModal'));
    if (modal) modal.hide();
    currentEditingIsNew = false;
}

function deleteFromEditModal() {
    const id = document.getElementById('editFlowerId').value;
    const type = document.getElementById('editItemType').value;

    if (type === 'path') {
        pathData = pathData.filter(p => p.id !== id);
        if (activePathId === id) {
            pathLayersMap.forEach(layer => map.removeLayer(layer));
            pathLayersMap.clear();
            activePathId = null;
        }
        savePaths();
        renderPathSidebar();
        applyPathVisibility(); // NEW: Clear the gray line from the map immediately
    } else {
        removeFlower(id, true);
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('editFlowerModal'));
    if (modal) modal.hide();
    currentEditingIsNew = false;
}

function cancelFlowerEdit() {
    if (currentEditingIsNew) {
        const id = document.getElementById('editFlowerId').value;
        const type = document.getElementById('editItemType').value;
        if (type === 'path') {
            pathData = pathData.filter(p => p.id !== id);
            savePaths();
            renderPathSidebar();
        } else {
            removeFlower(id, true);
        }
    }
    currentEditingIsNew = false;
}

function removeFlower(id, skipConfirm = false) {
    const objs = flowerMarkersMap.get(id);
    if (objs) {
        flowerLayerGroup.removeLayer(objs.marker);
        flowerLayerGroup.removeLayer(objs.circle);
        flowerMarkersMap.delete(id);
    }
    
    flowerData = flowerData.filter(f => f.id !== id);
    saveFlowers();
    if (typeof applyFlowerVisibility === 'function') applyFlowerVisibility();
    else renderFlowerSidebar();
    return true;
}

function saveFlowers() {
    localStorage.setItem(FLOWERS_STORAGE_KEY, JSON.stringify(flowerData));
}

function loadFlowers() {
    try {
        flowerData = JSON.parse(localStorage.getItem(FLOWERS_STORAGE_KEY)) || [];
    } catch (e) {
        flowerData = [];
    }

    // Clear existing
    flowerLayerGroup.clearLayers();
    flowerMarkersMap.clear();

    // Re-add to map
    flowerData.forEach(f => {
        if (f.visible === undefined) f.visible = true;
        addBigFlower(f.lat, f.lng, false, f.area, f.id, f.name);
    });

    if (typeof applyFlowerVisibility === 'function') applyFlowerVisibility();
    else renderFlowerSidebar();
}

function renderFlowerSidebar() {
    const listEl = document.getElementById('flowersList');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    if (flowerData.length === 0) {
        listEl.innerHTML = '<div class="text-muted small px-1">No Big Flowers placed.</div>';
        return;
    }

    // Group by area
    const grouped = {};
    flowerData.forEach(f => {
        if (!grouped[f.area]) grouped[f.area] = [];
        grouped[f.area].push(f);
    });

    Object.keys(grouped).sort().forEach((area, idx) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'flower-group mb-1';
        
        const safeAreaId = `flower-area-group-${idx}`;
        
        // Restore expanded state using Area Name
        const isExpanded = expandedFlowersAreas.has(area);
        
        const allAreaVisible = grouped[area].every(f => f.visible !== false);
        const areaCheckboxHtml = `<input type="checkbox" class="form-check-input me-2 mt-0" style="position: relative; margin-left: 0;" ${allAreaVisible ? 'checked' : ''} onchange="toggleAreaVisibility('${area}', this.checked)" onclick="event.stopPropagation()">`;
        
        groupDiv.innerHTML = `
            <div class="area-header d-flex align-items-center" onclick="toggleAreaGroup('${area.replace(/'/g, "\\'")}', '${safeAreaId}')">
                ${areaCheckboxHtml}
                <span class="flex-grow-1"><i class="fas fa-leaf me-1 text-success"></i> ${area} (${grouped[area].length})</span>
                <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} small" id="icon-${safeAreaId}"></i>
            </div>
            <div class="area-content ${isExpanded ? 'show' : ''}" id="${safeAreaId}">
                <!-- items -->
            </div>
        `;
        
        const contentDiv = groupDiv.querySelector('.area-content');
        grouped[area].forEach((fav, index) => {
            const item = document.createElement('div');
            item.className = 'd-flex justify-content-between align-items-center mt-1 pt-1 pb-1 px-2 rounded';
            item.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            const label = fav.name || `Flower ${index + 1}`;
            
            const isVisible = fav.visible !== false;
            const indCheckboxHtml = `<input type="checkbox" class="form-check-input me-2 mt-0" style="position: relative; margin-left: 0;" ${isVisible ? 'checked' : ''} onchange="toggleIndividualVisibility('${fav.id}', this.checked)">`;

            item.innerHTML = `
                <div class="d-flex align-items-center flex-grow-1 text-truncate pe-2">
                    ${indCheckboxHtml}
                    <div class="text-truncate" title="${fav.lat.toFixed(4)}, ${fav.lng.toFixed(4)}">${label}</div>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-primary py-0 px-2" onclick="useFavorite(${fav.lat}, ${fav.lng})" title="Go"><i class="fas fa-location-arrow" style="font-size: 0.8rem;"></i></button>
                    <button class="btn btn-sm btn-secondary py-0 px-2" onclick="editItem('${fav.id}', 'flower')" title="Edit"><i class="fas fa-pencil-alt" style="font-size: 0.8rem;"></i></button>
                </div>
            `;
            contentDiv.appendChild(item);
        });
        
        listEl.appendChild(groupDiv);
    });
}

function toggleAreaGroup(areaName, areaId) {
    const content = document.getElementById(areaId);
    const icon = document.getElementById(`icon-${areaId}`);
    if (content) {
        content.classList.toggle('show');
        const isNowShown = content.classList.contains('show');
        
        // Store expanded state using AREA NAME for robustness
        if (isNowShown) {
            expandedFlowersAreas.add(areaName);
        } else {
            expandedFlowersAreas.delete(areaName);
        }

        if (icon) {
            if (isNowShown) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        }
    }
}

// --- Local Clock Management ---
let simulatedTimeData = {
    timeZone: null,
    gmtOffset: null,
    isEstimate: false
};

async function updateSimulatedTimeData(lat, lng) {
    try {
        const response = await fetch(`/api/get-timezone?lat=${lat}&lon=${lng}`);
        if (response.ok) {
            const data = await response.json();
            simulatedTimeData = {
                timeZone: data.timeZone,
                gmtOffset: data.offset,
                isEstimate: data.isEstimate
            };
        }
    } catch (e) {
        console.warn("Could not retrieve simulated timezone", e);
    }
}

function updateLocalClock() {
    const display = document.getElementById('localTimeDisplay');
    const warning = document.getElementById('timeWarning');
    if (!display) return;
    
    let now = new Date();
    let displayTime;

    try {
        if (simulatedTimeData.timeZone) {
            // Precise Timezone (API Success)
            const options = { 
                timeZone: simulatedTimeData.timeZone,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false 
            };
            // Format to YYYY/MM/DD HH:MM:SS
            const parts = new Intl.DateTimeFormat('en-ZA', options).formatToParts(now);
            const p = parts.reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
            displayTime = `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}:${p.second}`;
        } else if (simulatedTimeData.gmtOffset !== null) {
            // Manual Offset (Fallback / Estimate)
            // Calculate time manually: UTC + Offset
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const simTime = new Date(utc + (3600000 * simulatedTimeData.gmtOffset));
            
            const dateStr = simTime.getFullYear() + '/' + 
                            String(simTime.getMonth() + 1).padStart(2, '0') + '/' + 
                            String(simTime.getDate()).padStart(2, '0');
            const timeStr = String(simTime.getHours()).padStart(2, '0') + ':' + 
                            String(simTime.getMinutes()).padStart(2, '0') + ':' + 
                            String(simTime.getSeconds()).padStart(2, '0');
            displayTime = `${dateStr} ${timeStr}`;
        } else {
            // System Time (Initial or Error)
            const dateStr = now.getFullYear() + '/' + 
                            String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                            String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
                            String(now.getMinutes()).padStart(2, '0') + ':' + 
                            String(now.getSeconds()).padStart(2, '0');
            displayTime = `${dateStr} ${timeStr}`;
        }
    } catch (e) {
        console.error("Clock formatting error", e);
        displayTime = "Error";
    }
    
    display.innerText = displayTime;
    
    // Show warning if it's an estimate
    if (warning) {
        if (simulatedTimeData.isEstimate) warning.classList.remove('d-none');
        else warning.classList.add('d-none');
    }
}

// Ensure data loads on startup
document.addEventListener('DOMContentLoaded', () => {
    loadFlowers();
    loadPaths();
    
    // Initial Timezone Sync (assuming center of map or current marker)
    const initialLat = 23.97565;
    const initialLng = 120.9738819;
    lastConfirmedLatLng = L.latLng(initialLat, initialLng);
    updateSimulatedTimeData(initialLat, initialLng);

    // Start the clock
    updateLocalClock();
    setInterval(updateLocalClock, 1000);
});


// Flower Excel Export function
function exportFlowersToExcel() {
    if (typeof XLSX === 'undefined') {
        alert("SheetJS library not loaded.");
        return;
    }
    
    if (flowerData.length === 0) {
        alert("No Big Flowers to export.");
        return;
    }

    const data = flowerData.map(f => ({
        Area: f.area || "Unknown",
        Location: `${f.lat}, ${f.lng}`,
        Name: f.name || "Big Flower"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BigFlowers");
    XLSX.writeFile(workbook, "big_flowers.xlsx");
}

// Flower Excel Import function
function importFlowersFromExcel(event) {
    if (typeof XLSX === 'undefined') {
        alert("SheetJS library not loaded.");
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = e.target.result;
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            let addedCount = 0;

            for (const row of json) {
                if (row.Location) {
                    const strLocation = String(row.Location).trim();
                    const coordsMatch = strLocation.match(/([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)/);
                    if (coordsMatch) {
                        const lat = parseFloat(coordsMatch[1]);
                        const lng = parseFloat(coordsMatch[2]);
                        const area = row.Area ? String(row.Area).trim() : null;
                        const name = row.Name ? String(row.Name).trim() : null;
                        
                        // Check for duplicate matching lat, lng
                        const isDuplicate = flowerData.some(f => f.lat === lat && f.lng === lng);
                        
                        if (!isDuplicate) {
                            await addBigFlower(lat, lng, true, area, null, name);
                            addedCount++;
                        }
                    }
                }
            }

            if (addedCount > 0) {
                alert(`Imported ${addedCount} Big Flowers successfully.`);
            } else {
                alert("No new valid flowers found to import (or all were duplicates).");
            }
            
        } catch (error) {
            console.error("Error parsing Excel file", error);
            alert("Error reading Excel file. Make sure it has 'Location' columns.");
        }
        
        // Reset file input
        event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
}
