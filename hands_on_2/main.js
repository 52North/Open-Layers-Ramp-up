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
import {
  transformExtent,
  fromLonLat
} from 'ol/proj.js';


const extentGER =  [ 666654.3673, 5991588.2883, 1671684.3350, 7358587.6639 ]

const map = new Map({
  target: 'map',
  layers: [],
  view: new View({
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
  coordinateFormat: function(coord){ //only show to decimal places
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
    attributions: "Europäische Union, enthält Copernicus Sentinel-2 Daten [2023], verarbeitet durch das Bundesamt für Kartographie und Geodäsie (BKG)"
  })
})
map.addLayer(wmsLayer);


const stopsLayer = new VectorLayer({
  source: new VectorSource({
    url: "https://geo.sv.rostock.de/download/opendata/haltestellen/haltestellen.json",
    format: new GeoJSON() ,
    attributions: "Haltestelen Stadt Rostock, Creative Commons CC Zero License (cc-zero)",
  }),
});
stopsLayer.setMap(map);

map.getView().setCenter(fromLonLat([12.0991, 54.0924], "EPSG:3857"));
map.getView().setZoom(14);



