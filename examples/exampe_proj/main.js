import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS.js';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/Image';
import ImageLayer from 'ol/layer/Image';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import {transform, transformExtent, fromLonLat} from 'ol/proj.js';
import { Point } from 'ol/geom';
import Overlay from 'ol/Overlay.js';

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source: new OSM()})],
});


//register projection (Amersfoort Datum)
proj4.defs("EPSG:28992",
   "+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889"
 + "+k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel"
 + "+towgs84=565.4171,50.3319,465.5524,1.9342,-1.6677,9.1019,4.0725" 
 + "+units=m +no_defs +type=crs");
register(proj4);

const view =  new View({
    //custom view projection
    projection: "EPSG:28992",
    zoom: 15
  })
//Amsterdam
const center = fromLonLat([7.6517138, 51.9349765], "EPSG:28992")
view.setCenter(center)

map.setView(view);


const wmsLayer = new TileLayer({
  source: new TileWMS({
    projection: "EPSG:3857", //request data in
    url: 'https://sgx.geodatenzentrum.de/wms_gn250_inspire',
    params: {LAYERS: 'GN.GeographicalNames'},
  })
})
map.addLayer(wmsLayer);

//transform coords
const coord1 = fromLonLat([7.0, 52.0], "EPSG:3857"); 
const coord2 = transform([7.0, 52.0], "EPSG:4326", "EPSG:3857");
//transform bbox
const bbox = transformExtent([5.0, 50.0, 7.0, 52.0], "EPSG:4326", "EPSG:3857");
//transform geometry
const point = new Point([7.0, 52.0]).transform("EPSG:4326", "EPSG:3857");


console.log(coord1)
console.log(coord2)
console.log(bbox)
console.log(point.getCoordinates())




const pos = fromLonLat([7.6521, 51.9350], "EPSG:28992");
const popup = new Overlay({
  //bind to DOM-Element
  element: document.getElementById('overlay'),
  positioning: 'center-center',
  id: "52N_Marker",
});
popup.setPosition(pos)
map.addOverlay(popup);

