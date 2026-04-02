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


if (appVersionType === "standard") {
    var fuelTypeSection = document.getElementById('fuelTypeSection');
    var fuelRegionSection = document.getElementById('fuelRegionSection');
    var enableFuelPricesCheckbox = document.getElementById('enableFuelPrices');
    var enableFuelPricesLabel = document.querySelector('label[for="enableFuelPrices"]');

    // Hide the label for the checkbox
    enableFuelPricesLabel.style.display = 'none';

    // Hide the Fuel Type and Fuel Region sections
    fuelTypeSection.style.display = 'none';
    fuelRegionSection.style.display = 'none';

    // Hide the "Enable best fuel prices" checkbox
    enableFuelPricesCheckbox.style.display = 'none';
}



if (connectTextElement && rsdDataElement) {
    rsdDataElement.style.display = connectTextElement.innerText === "Connected" ? 'block' : 'none';
}



// Global variables
var marker; // Variable to store the marker
var drawnItems = new L.FeatureGroup(); // Define the layer to add loaded files
var gpxArray = []; // Array to store feature data
var orangeIcon;
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
        zoomControl: false // Disable default zoom
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

    const initialLat = 23.10416999628627;
    const initialLng = 120.35137049956495;

    // Center map and set zoom
    map.setView([initialLat, initialLng], 15);

    // Create initial marker
    marker = createMarker([initialLat, initialLng]);
    setCoordinatesUI(initialLat, initialLng);

    map.on('dblclick', handleMapDoubleClick);
    map.on('click', (e) => {
        if (!isDrawingMode && !isManualDrawingMode) {
            handleMapDoubleClick(e);
        }
    });

    // Set the zoom level to 4
    map.setZoom(20);

    // // Use Stadia Maps as the tile layer
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    //     maxZoom: 19,
    //     noWrap: true, // Prevent tiles from wrapping around the world
    //     attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> contributors'
    // }).addTo(map);


    // Google Maps layers
    var googleRoadmap = L.gridLayer.googleMutant({
        type: 'roadmap'
    });
    var googleSatellite = L.gridLayer.googleMutant({
        type: 'satellite'
    });
    var googleHybrid = L.gridLayer.googleMutant({
        type: 'hybrid'
    });
    var googleTerrain = L.gridLayer.googleMutant({
        type: 'terrain'
    });

    // Add default tile layer
    googleRoadmap.addTo(map);

    // Define tile layer control options
    var baseLayers = {
        "Google Roadmap": googleRoadmap,
        "Google Satellite": googleSatellite,
        "Google Hybrid": googleHybrid,
        "Google Terrain": googleTerrain,
        "Stadia Maps": stadiaTileLayer,
        "OpenStreetMap_HOT": OpenStreetMap_HOT,
        "Stadia Alidade Smooth": Stadia_AlidadeSmooth,
        "Stadia Outdoors": Stadia_Outdoors,
        "CartoDB Voyager": CartoDB_Voyager,
    };

    // Add layer control to map
    L.control.layers(baseLayers).addTo(map);



    //-----------------
    // Leaflet.FileLayer
    // Load GPX/KML/GeoJSON files by drag and drop, or file open
    var style = { color: 'orange', opacity: 1.0, fillOpacity: 0.1, weight: 2, clickable: true };

    // Define the orange icon
    orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

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
    // Create the combined playback button using EasyButton
    var playbackButton = L.easyButton({
        states: [{
            stateName: 'play',
            icon: '<i class="lni lni-play"></i>', // Icon class for play state
            title: 'GPX Playback', // Tooltip for the button
            onClick: function (btn, map) {
                // Start GPX playback
                console.log("play click");
                console.log("isPlaybackStopped: ", isPlaybackStopped);
                if (!isPlaybackStopped) {
                    console.log("play if");
                    return; // Prevent multiple playbacks
                }

                isPlaybackStopped = false; // Set playback status to active
                console.log("before playback");

                // If playback was paused, resume from the current position
                if (wasPlaybackPaused) {
                    processNextPoint();
                } else {
                    playbackIndex = 0; // Reset playback index
                    processNextPoint(); // Start processing points from the beginning
                }

                // Change button state to pause
                btn.state('pause');
            }
        }, {
            stateName: 'pause',
            icon: '<i class="lni lni-pause"></i>', // Icon class for pause state
            title: 'Pause GPX Playback', // Tooltip for the button
            onClick: function (btn, map) {
                // Pause GPX playback
                isPlaybackStopped = !isPlaybackStopped; // Toggle playback status
                if (isPlaybackStopped) {
                    console.log('Playback paused');
                    wasPlaybackPaused = true; // Set flag indicating playback was paused
                } else {
                    console.log('Playback resumed');
                    wasPlaybackPaused = false; // Reset flag indicating playback was not paused
                    processNextPoint(); // Resume processing if playback is resumed
                }

                // Change button state back to play
                btn.state('play');
            }
        }]
    });

    playbackButton.button.style.fontSize = '24px'; // Adjust the font size as needed
    playbackButton.button.style.paddingLeft = '4px';

    // Add the combined playback button to the map
    playbackButton.addTo(map);

    // Get the container of your existing Leaflet control
    var fileLayerControlContainer = document.querySelector('.leaflet-control-filelayer');

    // Add the EasyButton's container element to the existing control container
    fileLayerControlContainer.appendChild(playbackButton.button);

    // Add the custom class to the EasyButton's container element
    playbackButton.button.classList.add('leaflet-control-filelayer-custom');



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
                    if (!['walk','run','ride','drive','fly'].includes(velocitySelect)) {
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
                isPlaybackStopped = true; // Stop playback if active
                playbackIndex = 0;
                interpolationStep = 0; // Reset interpolation
                currentSegmentPoints = []; // Reset sub-points
                gpxMarker = null; // Clear marker reference
                wasPlaybackPaused = false;
                if (typeof playbackButton !== 'undefined') {
                    playbackButton.state('play'); // Reset the playback button state
                }
                
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
        const { lat, lng } = event.latlng; // Get latitude and longitude
        lineLatLngs.push([lat, lng]); // Add coordinates to polyline array

        // If there are at least two points, calculate route between them
        if (lineLatLngs.length >= 2) {
            const lastPoint = lineLatLngs.length - 2;
            const startPoint = lineLatLngs[lastPoint];
            const endPoint = lineLatLngs[lastPoint + 1];

            // Request route between consecutive points
            calculateRoute(startPoint, endPoint);
        }
    }

    // Function to handle map click for manual drawing (No Snapping)
    function handleManualMapClick(event) {
        if (!isManualDrawingMode) return;
        const { lat, lng } = event.latlng;
        lineLatLngs.push([lat, lng]);

        if (lineLatLngs.length >= 2) {
            const lastPointIdx = lineLatLngs.length - 2;
            const startPoint = lineLatLngs[lastPointIdx];
            const endPoint = lineLatLngs[lastPointIdx + 1];

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
                timer = setTimeout(() => self.postMessage('tick'), e.data.interval);
            } else if (e.data.action === 'stop') {
                clearTimeout(timer);
            }
        };
    `;
    const timerBlob = new Blob([timerWorkerCode], { type: 'application/javascript' });
    const timerWorker = new Worker(URL.createObjectURL(timerBlob));
    
    timerWorker.onmessage = function(e) {
        if (e.data === 'tick') {
            processNextPoint();
        }
    };

    function processNextPoint() {
        if (isPlaybackStopped) return;

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
                playbackButton.state('play'); // Change button state without triggering onClick
                return;
            }

            // Calculate interpolation points for the next segment
            const start = lineLatLngs[playbackIndex];
            const end = lineLatLngs[playbackIndex + 1];
            const distance = calculateDistance(start[0], start[1], end[0], end[1]);
            const speedKmh = (velocitySelect === 'walk' ? 6 : (velocitySelect === 'run' ? 12 : (velocitySelect === 'ride' ? 19 : (velocitySelect === 'drive' ? 50 : (velocitySelect === 'fly' ? 450 : parseFloat(velocitySelect) || 18)))));
            const totalTimeSec = (distance / speedKmh) * 3600;
            const numSteps = Math.max(1, Math.ceil(totalTimeSec * 1000 / INTERPOLATION_INTERVAL));

            currentSegmentPoints = [];
            for (let i = 1; i <= numSteps; i++) {
                const ratio = i / numSteps;
                currentSegmentPoints.push([
                    start[0] + (end[0] - start[0]) * ratio,
                    start[1] + (end[1] - start[1]) * ratio
                ]);
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

        syncLocation(lat, lng);
        map.panTo([lat, lng]); // Auto-pan to follow

        // Schedule next sub-step using Web Worker to prevent background throttling
        timerWorker.postMessage({ action: 'start', interval: INTERPOLATION_INTERVAL });
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
    marker = L.marker(latlng, { draggable: true }).addTo(map);
    marker.on('dragend', handleMarkerDragEnd);
    marker.on('contextmenu', handleMarkerRightClick); // Add event listener for marker right-click
    return marker;
}


// Function to create a new marker on double click
function handleMapDoubleClick(e) {
    // Disable double-click zooming
    map.doubleClickZoom.disable();
    if (!marker)
        marker = createMarker(e.latlng); // Create a new marker
    else
        marker.setLatLng(e.latlng);

    syncLocation(e.latlng.lat, e.latlng.lng);

    // Add the right-click event listener to the active marker
    marker.on('contextmenu', handleActiveMarkerRightClick);
}

// Function to handle marker drag end
function handleMarkerDragEnd(event) {
    const newLat = event.target.getLatLng().lat;
    const newLng = event.target.getLatLng().lng;
    syncLocation(newLat, newLng);
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
}

async function syncLocation(lat, lng) {
    if (isSyncing) return;
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
    } catch (error) {
        console.error('Error syncing location:', error);
    } finally {
        isSyncing = false;
    }
}

// Function to handle search
function handleSearch() {
    var input = document.getElementById('coordinates').value;
    searchLocation(input);
}

// Function to search location
async function searchLocation(input, userLocale) {
    // Initialize the OSM provider for searching
    var provider = new GeoSearch.OpenStreetMapProvider();
    try {
        const results = await provider.search({ query: input });
        if (results.length > 0) {
            const { x, y } = results[0];
            if (!marker) {
                marker = L.marker([y, x], { draggable: true }).addTo(map);
                marker.on('dragend', handleMarkerDragEnd); // Add event listener for marker drag
                marker.on('contextmenu', handleMarkerRightClick); // Add event listener for marker right-click

            } else {
                marker.setLatLng([y, x]);
            }
            map.setView([y, x], 13);
            syncLocation(y, x);
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
    const options = {
        zone: document.getElementById('joystick-zone'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'cyan',
        size: 100
    };
    joystick = nipplejs.create(options);

    joystick.on('move', (evt, data) => {
        if (data.direction) {
            joystickState.active = true;
            joystickState.force = Math.min(data.force, 2) / 2; // Normalize force
            joystickState.angle = data.angle.radian;
        }
    });

    joystick.on('end', () => {
        joystickState.active = false;
        joystickState.force = 0;
    });

    // Start movement loop
    setInterval(movementLoop, MOVEMENT_LOOP_INTERVAL);
}

function movementLoop() {
    if (!joystickState.active || !marker || joystickState.force === 0) return;

    const latLng = marker.getLatLng();

    // 15km/h = 15000m / 3600s = 4.16 m/s
    // In MOVEMENT_LOOP_INTERVAL (50ms), distance = 4.16 * 0.05 = 0.208 meters
    // Approx 1 degree lat = 111,000 meters
    // 0.208 meters approx 0.00000187 degrees

    const baseStep = (MAX_SPEED_KMH / 3600) * (MOVEMENT_LOOP_INTERVAL / 1000) / 111.32; // Approx degrees per interval
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
    var deviceDropdown = document.getElementById('device');
    var connectionDropdown = document.getElementById('connection');
    var devicesInfo = {};  // Object to store device information
    var sudo_message = window.APP_CONFIG.sudo_message;  // Ensure sudo_message is a string

    // Make AJAX request to get the device list
    fetch('/list_devices')
        .then(response => response.json())
        .then(data => {
            console.log('data:', data);

            // Clear existing options
            deviceDropdown.innerHTML = '';
            connectionDropdown.innerHTML = '';

            // Check if server returned an error (e.g. 500 converted to JSON error)
            if (data.error) {
                console.error("Server returned an error:", data.error);
                if (typeof displayToast === 'function') {
                    displayToast("Error fetching devices: " + data.error);
                }
                return;
            }

            // Iterate through devices (UDIDs)
            Object.keys(data).forEach(udid => {
                var connections = data[udid]; // Get connections for the current UDID

                // Iterate over connection types for each device
                Object.keys(connections).forEach(connectionType => {
                    var deviceInfoArray = connections[connectionType]; // Get device info array for the current connection type

                    // Iterate over device info array
                    deviceInfoArray.forEach(deviceInfo => {
                        var option = document.createElement('option');

                        // Define the base display text
                        let displayText = `${connectionType}: ${deviceInfo.DeviceName} - (${deviceInfo.DeviceClass} - iOS: ${deviceInfo.ProductVersion})`;

                        option.text = displayText;
                        option.value = JSON.stringify(deviceInfo);  // Convert deviceInfo object to JSON string

                        // Store device information in the object
                        devicesInfo[udid] = devicesInfo[udid] || {};
                        devicesInfo[udid][connectionType] = deviceInfo;

                        deviceDropdown.add(option);
                    });
                });
            });

            // Attach the devicesInfo object to the deviceDropdown for easy access later
            deviceDropdown.devicesInfo = devicesInfo;

            // Add event listener to update value attribute of options
            deviceDropdown.addEventListener('change', function () {
                var selectedOption = deviceDropdown.options[deviceDropdown.selectedIndex];
                var deviceInfo = JSON.parse(selectedOption.value); // Parse the JSON string to object
                selectedOption.value = JSON.stringify(deviceInfo); // Update the value to match the object
            });

            // Check if sudo_message has a value and invoke displayToast if it does
            if (sudo_message) {
                displayToast(sudo_message);
            }
        })
        .catch(error => console.error('Error fetching device list:', error));
}





// Checkbox visibility toggle
function toggleFuelTypeVisibility() {
    var fuelTypeSection = document.getElementById('fuelTypeSection');
    var fuelRegionSection = document.getElementById('fuelRegionSection');
    var enableFuelPricesCheckbox = document.getElementById('enableFuelPrices');
    if (fuelTypeSection && fuelRegionSection && enableFuelPricesCheckbox) {
        fuelTypeSection.style.display = enableFuelPricesCheckbox.checked ? 'block' : 'none';
        fuelRegionSection.style.display = enableFuelPricesCheckbox.checked ? 'block' : 'none';
    }
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
function connectDevice() {
    // Display "Connecting, please wait..."
    var connectButton = document.getElementById('connect');
    var connectTextElement = document.getElementById('connectText');
    var spinnerElement = document.getElementById('spinner');
    var deviceDropdown = document.getElementById('device');
    var selectedOptionValue = JSON.parse(document.getElementById('device').value);
    console.log('device info:', deviceDropdown);
    console.log('selectedOptionValue: ', selectedOptionValue);

    // Extract relevant information from selectedOptionValue
    var selectedDeviceIdentifier = selectedOptionValue.Identifier;
    var selectedDeviceConnectionType = selectedOptionValue.ConnectionType;
    var productVersion = selectedOptionValue.ProductVersion;
    var deviceName = selectedOptionValue.DeviceName;
    var deviceClass = selectedOptionValue.DeviceClass;
    var SelectedDeviceWifiState = selectedOptionValue.wifiState;
    var selectedDeviceName = deviceName;
    var selectedDeviceClass = deviceClass;
    var selectedDeviceVersion = productVersion;
    var selectedDeviceConnType = selectedDeviceConnectionType;
    var selectedDeviceCountry = selectedOptionValue.userLocale;
    //var selectedDeviceWifiAddress = wifiAddress;
    var selectedDevicePlatform = window.APP_CONFIG.current_platform;
    var appVersionNum = window.APP_CONFIG.app_version_num;
    var appType = window.APP_CONFIG.app_version_type;

    console.log('identifier: ', selectedDeviceIdentifier);
    console.log('connType: ', selectedDeviceConnectionType);
    console.log('Product Version:', productVersion);
    console.log('Device Name:', deviceName);
    console.log('Device Class:', deviceClass);
    console.log('WiFi State:', SelectedDeviceWifiState);







    // Call the function to update DynamoDB
    updateDynamoDB(selectedDeviceIdentifier, selectedDeviceVersion, selectedDeviceName, selectedDeviceClass, selectedDevicePlatform, appVersionNum, appType, selectedDeviceConnType, SelectedDeviceWifiState, selectedDeviceCountry);

    if (connectTextElement) {
        connectTextElement.innerText = "Connecting, please wait...";
    }
    // Hide the connectText and show the spinner only if not already connected
    if (connectTextElement && spinnerElement && connectTextElement.innerText !== "Connected") {
        connectTextElement.style.display = 'inline-block'; // Display the text
        spinnerElement.style.display = 'inline-block'; // Display the spinner
    }

    // Make AJAX request to notify the server about the command
    fetch('/connect_device', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            udid: selectedDeviceIdentifier,
            ios_version: selectedDeviceVersion, // Include iOS version in the request
            connType: selectedDeviceConnType, //connection type USB or WIFI
            //wifiAddress: selectedDeviceWifiAddress,
            wifiState: SelectedDeviceWifiState,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('connect data: ', data);



            // Check if developer mode is required
            if ('developer_mode_required' in data) {
                // Display modal informing the user and providing options
                showModalDeveloperModeRequired();
                return;
            }
            // Check if there is an error with the message 'No Pair Record Found'
            if ('Error' in data && data.Error === 'No Pair Record Found') {
                // Display modal informing the user about the pair record
                showPairRecordModal();
                return;
            }

            // Check for the 'error' key in the response
            if ('error' in data) {
                // Display the error message as a popup or text on the page
                //alert(data.error); // You can use a better UI method here
                showModalTimeout();

                // Reset connectTextElement
                if (connectTextElement) {
                    connectTextElement.innerText = "Connect Device";
                    spinnerElement.style.display = 'none'; // Display the spinner
                }

                // Enable Connect button
                if (connectButton) {
                    connectButton.disabled = false;
                }

                // Stop processing the rest of the JavaScript
                return;
            }

            // code for successful response
            var displayTextElement = document.getElementById('displayText');
            if (displayTextElement) {
                displayTextElement.innerText = data;
            }

            if (connectTextElement) {
                connectTextElement.innerText = "Connected";
            }

            if (connectButton) {
                connectButton.disabled = true;  // Disable the button
            }

            if (spinnerElement && connectTextElement.innerText === "Connected") {
                spinnerElement.style.display = 'none'; // Hide the spinner
            }

            if (deviceDropdown) {
                deviceDropdown.disabled = true;  // Disable the button
            }

            var containerElement = document.body;
            var rsdDataElement = document.getElementById('rsdData');

            if (containerElement && rsdDataElement) {
                try {
                    console.log('container data:', data);
                    //var jsonData = JSON.parse(data);


                    if ('rsd_data' in data) {
                        rsdDataElement.value = data.rsd_data;

                        if (connectTextElement && connectTextElement.innerText === "Connected") {
                            //rsdDataElement.style.display = 'block';  // Make rsdData visible
                            updateSetLocationButtonStatus();
                            updateStopLocationButtonStatus();  // Add this line to update the Stop Location button status

                            // Show the disconnect button when rsdData is visible
                            var disconnectButton = document.getElementById('disconnect');
                            if (disconnectButton) {
                                disconnectButton.style.display = 'inline-block';
                                disconnectButton.innerText = 'Disconnect';
                            }
                        }
                    } else {
                        rsdDataElement.value = 'No rsd_data found in the data';
                    }
                } catch (error) {
                    console.error('Error parsing data:', error);
                    rsdDataElement.value = 'Error parsing data';
                }

                rsdDataElement.readOnly = true;
            }
        })
        .catch(error => {
            console.error('Error connecting device:', error);
            var displayTextElement = document.getElementById('displayText');
            if (displayTextElement) {
                displayTextElement.innerText = 'Error connecting device.';
            }

            if (connectTextElement) {
                connectTextElement.innerText = "Error connecting";
            }

            if (connectButton) {
                connectButton.disabled = false;  // Enable the button
            }
        });
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
function disconnectDevice() {
    var connectTextElement = document.getElementById('connectText');
    var connectButton = document.getElementById('connect');
    var disconnectButton = document.getElementById('disconnect');
    var deviceDropdown = document.getElementById('device');
    stopLocation();
    // Use navigator.sendBeacon to make the POST request without waiting for a response
    const data = JSON.stringify({});
    //navigator.sendBeacon('/stop_tunnel', data);
    console.log('Disconnect - Clearing');

    var setLocationButton = document.getElementById('set-location');
    var stopLocationButton = document.getElementById('stop-location');
    stopLocationButton.disabled = true;
    setLocationButton.disabled = true;

    // Enable the device dropdown
    if (deviceDropdown) {
        deviceDropdown.disabled = false;
    }

    // Update Disconnect button text and show Connect button
    if (disconnectButton) {
        disconnectButton.innerText = "Disconnecting, Please wait...";
        disconnectButton.style.display = 'none';
    }

    // Hide rsdData text box
    var rsdDataElement = document.getElementById('rsdData');
    if (rsdDataElement) {
        rsdDataElement.style.display = 'none';
    }

    // Reset connectTextElement
    if (connectTextElement) {
        connectTextElement.innerText = "Connect Device";
    }

    // Enable Connect button
    if (connectButton) {
        connectButton.disabled = false;
    }
}



async function handleFuelTypeChange() {
    var fuelTypeDropdown = document.getElementById('fuelType');
    var fuelText = document.getElementById('fuelText');
    var fuelRegionDropdown = document.getElementById('fuelRegion');
    const selectedFuelRegion = fuelRegionDropdown.value;
    const selectedFuelType = fuelTypeDropdown.value;
    console.log('Selected Fuel Region = ', selectedFuelRegion);
    fuelText.value = '';
    fuelTypeDropdown.innerHTML = '';

    try {
        const response = await fetch(`/api/fuel_types?region=${selectedFuelRegion}`);
        const fuelTypes = await response.json();
        fuelTypes.sort();
        fuelTypes.forEach(type => {
            var option = document.createElement('option');
            option.value = type;
            option.text = type;
            fuelTypeDropdown.add(option);
        });
        fuelTypeDropdown.value = selectedFuelType;
        updateFuelText(selectedFuelType, selectedFuelRegion);
    } catch (error) {
        console.error('Error fetching fuel types:', error);
    }
}

async function updateFuelText(selectedFuelType, selectedFuelRegion) {
    if (!selectedFuelType || selectedFuelType === "undefined") {
        console.warn("No fuel type selected, skipping data fetch.");
        return;
    }
    var fuelTypeDropdown = document.getElementById('fuelType');
    var fuelText = document.getElementById('fuelText');
    var fuelDataCollapse = document.getElementById('fuelDataCollapse');
    try {
        const response = await fetch(`/api/data/${selectedFuelType}?region=${selectedFuelRegion}`);
        const fuelTypeData = await response.json();
        fuelText.value = `
            Type: ${fuelTypeData.type}
            Price: ${fuelTypeData.price}
            Suburb: ${fuelTypeData.suburb}
            State: ${fuelTypeData.state}
            Lat: ${fuelTypeData.lat}
            Lng: ${fuelTypeData.lng}
        `;
        setCoordinates(fuelTypeData.lat, fuelTypeData.lng);
        handleSearch();
        fuelDataCollapse.classList.toggle('show', !!fuelTypeData);
    } catch (error) {
        console.error('Error fetching fuel type data:', error);
    }
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

// Function to enable or disable the Set Location button based on conditions
function updateSetLocationButtonStatus() {
    var setLocationButton = document.getElementById('set-location');
    var rsdDataElement = document.getElementById('rsdData');
    var coordinatesInput = document.getElementById('coordinates');
    var enableButton = rsdDataElement.value.trim() !== '' && coordinatesInput.value.trim() !== '';
    setLocationButton.disabled = !enableButton;
}

// Function to enable or disable the Stop Location button based on conditions
function updateStopLocationButtonStatus() {
    var stopLocationButton = document.getElementById('stop-location');
    var rsdDataElement = document.getElementById('rsdData');
    var enableButton = rsdDataElement.value.trim() !== '';
    stopLocationButton.disabled = !enableButton;
}

function exitApp() {
    console.log('Exit App function called');

    try {
        // Display a non-blocking modal dialog indicating server shutdown
        $('#aboutModal').modal('hide');
        $('#shutdownModal').modal('show');

        // Use navigator.sendBeacon to make the POST request without waiting for a response
        const data = JSON.stringify({});
        navigator.sendBeacon('/exit', data);
        window.open('', '_self', ''); window.close();

        console.log('POST request sent using sendBeacon');
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
          <strong class="mr-auto">GeoPort</strong>
          <small>Just Now</small>
          <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="toast-body">
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
    handleFuelTypeChange();
    document.getElementById('rsdData').addEventListener('change', updateSetLocationButtonStatus);
    document.getElementById('coordinates').addEventListener('input', updateSetLocationButtonStatus);
    populateDeviceList();
    updateStopLocationButtonStatus();  // Add this line to update the Stop Location button status
    // Add event listener for keydown event
    document.addEventListener('keydown', handleKeyDown);
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








});
