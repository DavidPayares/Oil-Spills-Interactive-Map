// creates two basemap layers
var bright = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});


// functions to style the riskmap risk layer
function getColor(a) {
    return a == 5 ? '#a50f15' :
        a == 4 ? '#de2d26' :
        a == 3 ? '#fb6a4A' :
        a == 2 ? '#fcae91' :
        '#fee5d9';
}

function getStyle(feature) {
    return {
        fillColor: getColor(feature.properties.gridcode),
        color: getColor(feature.properties.gridcode),
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.7
    };
}


// the riskmap risks layer, styled using functions above
var riskmap = L.geoJson(seismic_risk, {
    style: getStyle
});



// the url to send to the USGS API
var quakedataUrl = '/data/ToxicSpills.geojson'


// the spills layer, uses leaflet.ajax to make API call
var spills = L.geoJson.ajax(quakedataUrl, {

    onEachFeature: popupText,
    // makes points into circle markers and styles them, scaling using JavaScript Math; magnitude value for each quake from parsed JSON
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: sizePoints(feature.properties.max_ptl_release_gallons),
            fillColor: colorType(feature.properties.threat),
            color: '#000',
            weight: 1,
            opacity: 0.2,
            fillOpacity: 0.3,
            tags: [feature.properties.threat]
        });
    }
});


// creates the map and sets initial view, including layers to be displayed, plus limits for zoom and maximum extent
var map = L.map('map', {
    center: new L.LatLng(40, -100),
    zoom: 4,
    maxZoom: 8,
    minZoom: 3,
    layers: [bright, riskmap, spills]
});



// Defines the two basemaps
var baseMaps = {
    'Map Vegetation': satellite,
    'Map': bright
};

// Defines the overlay maps. For now this variable is empty, because we haven't created any overlay layers
var overlayMaps = {
    'Toxic Liquid Spills Risk': riskmap,
    'Toxic Liquid Spills': spills
};

// Adds a Leaflet layer control, using basemaps and overlay maps defined above
var layersControl = new L.Control.Layers(baseMaps, overlayMaps, {
    collapsed: true
});
map.addControl(layersControl);

L.easyButton('<img src="/data/fullscreen.png">', function(btn, map){
    var USA = [40,-100];
    map.setView(USA,4);
}).addTo(map);

L.control.tagFilterButton({
    data: ['Oil', 'Chemical', 'Other','none'],
    icon: '<img src="/data/filter.png">',
    filterOnEveryClick: true
}).addTo(map);



function popupText(feature, layer) {

    layer.bindPopup('<strong>Date: </strong>' + feature.properties.open_date + '<br />' +
        '<strong>Name: </strong>' + feature.properties.name + '<br />' +
        '<strong>Type: </strong>' + feature.properties.threat + '<br />' +
        '<strong>Gallons Released: </strong>' + feature.properties.max_ptl_release_gallons)
}


function sizePoints(magnitude) {
    if (magnitude >= 0 && magnitude <= 1) {
        return 1
    } else if (magnitude > 1 && magnitude <= 100) {
        return 2
    } else if (magnitude > 100 && magnitude <= 1000) {
        return 4
    } else if (magnitude > 1000 && magnitude <= 10000) {
        return 8
    } else if (magnitude > 10000 && magnitude <= 100000) {
        return 10
    } else if (magnitude > 100000 && magnitude <= 1000000) {
        return 12
    } else if (magnitude > 1000000 && magnitude <= 10000000) {
        return 14
    } else if (magnitude > 10000000 && magnitude <= 100000000) {
        return 25
    } else if (magnitude > 100000000) {
        return 30
    }
}

function colorType(type) {
    if (type === 'Oil') {
        return '#000'
    } else if (type === 'Chemical') {
        return '#ea0909'
    } else if (type == 'Other') {
        return '#fcfcfc'
    } else {
        return '#fcfcfc'
    }
}