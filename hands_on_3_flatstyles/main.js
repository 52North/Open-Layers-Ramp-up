import './style.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition.js';
import {toStringXY} from 'ol/coordinate';
import FullScreen from 'ol/control/FullScreen.js';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS.js';
import VectorSource from 'ol/source/Vector.js';
import VectorLayer from 'ol/layer/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {Circle, Fill, Stroke, Style, Text} from 'ol/style.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import Source from 'ol/source/Vector.js';
import {
  transformExtent,
  fromLonLat
} from 'ol/proj.js';

proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

const extentGER = transformExtent([ 666654.3673, 5991588.2883, 1671684.3350, 7358587.6639], "EPSG:3857", "EPSG:25832")

const map = new Map({
  target: 'map',
  layers: [],
  view: new View({
    projection: "EPSG:25832",
    center: [0, 0],
    zoom: 2,
  })
});

map.getView(extentGER).fit(extentGER);

const btn = document.getElementById("fitExtentBtn");
btn.addEventListener('click', function() {
  map.getView().fit(extentGER);
});

const coordinateViewer = new MousePosition({
  projection: "EPSG:4326",
  coordinateFormat: function(coord){ //only show two decimal places
    return toStringXY(coord, 2);
  }
})
map.addControl(coordinateViewer)


const fullscreen = new FullScreen();
fullscreen.on("leavefullscreen", function(event){
  alert("Vollbildmodus verlassen");
})
map.addControl(fullscreen)

const wmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'https://sg.geodatenzentrum.de/wms_sentinel2_de',
    params: {LAYERS: 'rgb_2019'},
    attributions: "Europäische Union, enthält Copernicus Sentinel-2 Daten [2023], verarbeitet durch das Bundesamt für Kartographie und Geodäsie (BKG)",
    projection: "EPSG:3857"
  })
})
map.addLayer(wmsLayer);


const stopsLayer = new VectorLayer({
  source: new Source({
    url: "https://geo.sv.rostock.de/download/opendata/haltestellen/haltestellen.json",
    format: new GeoJSON() ,
    attributions: "Haltestellen Stadt Rostock, Creative Commons CC Zero License (cc-zero)",
  })
});
stopsLayer.setMap(map);

map.getView().setCenter(fromLonLat([12.0991, 54.0924], "EPSG:25832"));
map.getView().setZoom(14);

const styleTram = {
  'text-value': ['get', 'bezeichnung'],
  'text-font': '14px sans-serif',
  'text-stroke-color': 'gray',
  'text-stroke-width': 1.25,
  'text-fill-color': 'white',
  'circle-radius': 10,  
  'circle-fill-color': 'blue',
  'circle-stroke-color': 'black',
  'circle-stroke-width': 1.25,
}
const styleBus = {
  'text-value': ['get', 'bezeichnung'],
  'text-font': '14px sans-serif',
  'text-stroke-color': 'gray',
  'text-stroke-width': 1.25,
  'text-fill-color': 'white',
  'circle-radius': 10,  
  'circle-fill-color': 'green',
  'circle-stroke-color': 'black',
  'circle-stroke-width': 1.25,
}
const styleFerry = {
  'text-value': ['get', 'bezeichnung'],
  'text-font': '14px sans-serif',
  'text-fill-color': 'white',
  'text-stroke-color': 'gray',
  'text-stroke-width': 1.25, 
  'circle-radius': 10,  
  'circle-fill-color': 'red',
  'circle-stroke-color': 'black',
  'circle-stroke-width': 1.25,
}
const styleDefault = {
  'text-value': ['get', 'bezeichnung'],
  'text-font': '14px sans-serif',
  'text-fill-color': 'white',
  'text-stroke-color': 'gray',
  'text-stroke-width': 1.25, 
  'circle-radius': 10,  
  'circle-fill-color': 'gray',
  'circle-stroke-color': 'black',
  'circle-stroke-width': 1.25,
}

const styleRules =[
  {
    filter: ['==', ['get', 'verkehrsmittel'], "Bus"],
    style: styleBus
  },
  {
    filter: ['==', ['get', 'verkehrsmittel'], "Fähre"],
    style: styleFerry
  },
  {
    filter: ['==', ['get', 'verkehrsmittel'], "Straßenbahn"],
    style: styleTram
  },
  {
    else: true,
    style: styleDefault
  }
]
stopsLayer.setStyle(styleRules);

