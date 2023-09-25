import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition.js';
import {toStringXY} from 'ol/coordinate';
import FullScreen from 'ol/control/FullScreen.js';

const extentGER =  [ 666654.3673, 5991588.2883, 1671684.3350, 7358587.6639 ]

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});


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
