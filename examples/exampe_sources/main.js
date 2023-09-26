import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {Point, LineString, Polygon} from 'ol/geom.js';
import Feature from 'ol/Feature.js';
import MVT from 'ol/format/MVT.js';
import {ImageWMS} from 'ol/source.js';
import OGCVectorTile from 'ol/source/OGCVectorTile.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';



const map = new Map({
  target: 'map',
  layers: [
   
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
    projection: "EPSG:3857"
  })
});


//Coordinate
new Point([6.9, 52.0])

//Array<Coordinate>
new LineString([[10, 10],[90, 90]]) 

//Array<Array<Coordinate>>
new Polygon([
  [ //first is outer ring
    [2, 2],
    [98, 2],
    [2, 98],
    [2, 2], //must be closed
  ]
])


const feature1 = new Feature(new Point([6.9, 52.0]));
const feature2 = new Feature({
  geometry: new Point([7.6517138, 51.9349765]),
  name: '52° North',
  type: 'company'
});
//change geometry
feature1.setGeometry(new LineString([[10, 10],[90, 90]]));
feature1.set('name', "a linestring"); //set attributes


const wmsSource =  new ImageWMS({ //OGC WMS
  url: 'https://ahocevar.com/geoserver/wms',
  params: {'LAYERS': 'topp:states'}
});

const vectorTilesSource = new OGCVectorTile({ //Vector Tiles from OGC API - Tiles
  url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries/tiles/WebMercatorQuad',
  format: new MVT(), //Mapbox Vector Tiles
})


import VectorSource from 'ol/source/Vector.js';

const vectorSource = new VectorSource({
  features: [feature1, feature2]
})
//add after initialization
//vectorSource.addFeature(feature3)

//get features by extent
const bbox = [6.0, 50.0, 8.0, 52.0]
const inBbox = vectorSource.getFeaturesInExtent(bbox)
console.log(inBbox.length + " features in extent")

//fetch GeoJson Feature Coll. from OGC API - Features
const geojsonSource = new VectorSource({
  //automatically fetches data from url
  url: 'https://ogc-api.nrw.de/inspire-lc-fb/v1/'
      + 'collections/landcoverunit/items?f=json&limit=5000',
  format: new GeoJSON() //assign GeoJson parser
})

import ImageLayer from 'ol/layer/Image.js';
const wmsLayer = new ImageLayer({
  source: wmsSource,
  opacity: 0.7 //transparent
});
map.addLayer(wmsLayer);

//works only with EPSG:3857
import VectorTileLayer from 'ol/layer/VectorTile';
const ogcTileLayer = new VectorTileLayer({
  source: vectorTilesSource,
  visible: false,
  zIndex: -1, //move to background
  minZoom: 5, //constraint visbility
  projection: "EPSG:3857"
});
map.addLayer(ogcTileLayer);
ogcTileLayer.setVisible(true);


const vectorLayer = new VectorLayer({
  source: vectorSource,
});
vectorLayer.setMap(map); //default z-Index infinity


const geojsonLayer = new VectorLayer({
  source: geojsonSource
})
geojsonLayer.setMap(map);

