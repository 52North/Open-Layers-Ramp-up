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
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Select from 'ol/interaction/Select.js';
import Overlay from 'ol/Overlay.js';
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
    attributions: "Europäische Union, enthält Copernicus Sentinel-2 Daten [2023], verarbeitet durch das Bundesamt für Kartographie und Geodäsie (BKG)",
    projection: "EPSG:3857"
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


const busIcon = new Circle({
  stroke: new Stroke({
    color: 'black',
    width: 1.25,
  }),
  radius: 8,
  fill: new Fill({color: 'green'})
})
const tramIcon = new Circle({
  stroke: new Stroke({
    color: 'black',
    width: 1.25,
  }),
  radius: 8,
  fill: new Fill({color: 'red'})
})
const ferryIcon = new Circle({
  stroke: new Stroke({
    color: 'black',
    width: 1.25,
  }),
  radius: 8,
  fill: new Fill({color: 'blue'})
})
const defaultIcon = new Circle({
  stroke: new Stroke({
    color: 'black',
    width: 1.25,
  }),
  radius: 8,
  fill: new Fill({color: 'gray'})
})
const backgroundFill = new Fill({color: "rgba(255,255,255,0.9)"})

const stopsStyle = function(feature, resolution){
  let icon;
  const verkehrsmittel = feature.get("verkehrsmittel");
  if(verkehrsmittel === "Bus"){
    icon = busIcon
  }else if(verkehrsmittel === "Straßenbahn"){
    icon = tramIcon
  }else if(verkehrsmittel === "Fähre"){
    icon = ferryIcon
  }else{
    icon = defaultIcon
  }

  const style = new Style({
    image: icon
  })
  if(resolution <= 8.0){
    style.setText(new Text({text: feature.get("bezeichnung"), backgroundFill: backgroundFill}))
  }
 
  return style;
}
stopsLayer.setStyle(stopsStyle);

//add conterra feature
const viewProj = map.getView().getProjection();
const pos = fromLonLat([7.6501, 51.9352], viewProj);
const ctLayer = new VectorLayer({
  source: new VectorSource({
    features: [
      new Feature({
        geometry: new Point(pos), 
        website: "https://www.con-terra.com/",
        name: "con terra GmbH"
      })
    ]
  }),
  style: new Style({image: defaultIcon})
});
ctLayer.setMap(map);

const selectInteraction = new Select({
  layers: [ctLayer]
})
map.addInteraction(selectInteraction)

const popup = new Overlay({
  element: document.getElementById('overlay'),
  position: undefined,
  positioning: "top-center"
})
map.addOverlay(popup)

selectInteraction.on("select", function(event){

    if(event.selected.length > 0){
      const feature = event.selected[0];
      const infoDiv = document.getElementById("featureInfo")
      infoDiv.innerHTML=JSON.stringify({Name: feature.get("name"), Website: feature.get("website")})
      const overlay = document.getElementById("overlay")
      overlay.innerHTML='<p><a target="_blank" href="'+ feature.get("website") +'">'+ feature.get("name") +'</a></p>'
      popup.setPosition(feature.getGeometry().getCoordinates())
    }else{
      const infoDiv = document.getElementById("featureInfo")
      infoDiv.innerHTML= "";
      popup.setPosition(undefined)
    }
  }
)