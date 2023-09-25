import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Text, Circle, Fill, Stroke, Style} from 'ol/style.js';
import { createDefaultStyle } from 'ol/style/Style';

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



//fetch GeoJson Feature Coll. from OGC API - Features
const geojsonSource = new VectorSource({
  //automatically fetches data from url
  url: 'https://ogc-api.nrw.de/inspire-lc-fb/v1/'
      + 'collections/landcoverunit/items?f=json&limit=5000',
  format: new GeoJSON() //assign GeoJson parser
})


const vectorLayer = new VectorLayer({
  source: geojsonSource,
  style: function (feature){
    const style =   new Style();
    //fill by attribute
    if(feature.get('landCoverObservation.class.title') === 'Ackerland'){
       style.setFill(new Fill({color: 'brown'}))
    }else if(feature.get('landCoverObservation.class.title') === 'Dauergrünland'){
      style.setFill(new Fill({color: 'green'}))
    }
    const label = feature.get('flik');
    style.setText(new Text({text: label, font: "25px Arial"}));
    return style;
  }
})
vectorLayer.setMap(map);


 

 const sketchStyle = 
   new Style({
     fill: new Fill({
        color: 'rgba(255, 0 , 0,0.5)',
      }),
     stroke: new Stroke({
        color: 'rgba(0, 0 , 0, 1)',
        width: 1.25,
        lineCap: "round",
        lineDash: [20, 40], //line, gap
      }),
   })
 ;

const sketchSource = new VectorSource();
const sketchLayer = new VectorLayer({
  source: sketchSource,
  style: sketchStyle
})
sketchLayer.setMap(map)
//measure distance with Draw-Interaction
import Draw from 'ol/interaction/Draw.js';

let isActive = false;
const measureDist = new Draw({
  type:  "LineString",
  source: sketchSource, //VectorSource
  maxPoints: 10,
  freehand: false
});

measureDist.on("drawend", function(drawEvent){
  const sketchFeature = drawEvent.feature;
  const line  = sketchFeature.getGeometry();
  const dist_km = line.getLength() / 1000;
  const style = sketchStyle;
  //add distance as label
  style.setText(new Text({text: dist_km +"km"}))
});

measureDist.on("drawstart", function(drawEvent){
  sketchSource.clear(); //delete previous sketch feature
});

const measureBtn = document.getElementById("measureDistBtn")
measureBtn.addEventListener("click", function(){
  if(!isActive){
    map.addInteraction(measureDist);
  }else{
    map.removeInteraction(measureDist)
  }
  isActive = !isActive
})