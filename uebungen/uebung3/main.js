import './style.css';
import {Map, View} from 'ol';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Style} from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import { apply as applyMapboxStyle } from "ol-mapbox-style";
import { useGeographic as olUseGeographic } from "ol/proj";
import {DragBox, Select} from 'ol/interaction.js';
import {
  transformExtent
} from 'ol/proj.js';
import {platformModifierKeyOnly} from 'ol/events/condition.js';

olUseGeographic();

const center = [7.6517138, 51.9349765];


const feldbloeckeSource = new VectorSource({
  format: new GeoJSON(),
  url: function (extent, resolution, projection) {
    let url = "https://ogc-api.nrw.de/inspire-lc-fb/v1/collections/landcoverunit/items?f=json&limit=10000";
    url = url + "&bbox="  + extent.join(",")
    return url;
  },
  strategy: bboxStrategy
});

let visible = false;
const feldbloeckeLayer = new VectorLayer({
  visible: visible,
  source: feldbloeckeSource,
  style: new Style({
    fill: new Fill({color: 'rgba(0,255,0,0.7)'})
  })
});


const btn = document.getElementById("feldbloeckeBtn");
btn.addEventListener('click', function() {
  visible = !visible
  feldbloeckeLayer.setVisible(visible)
});


const map = new Map({
  view: new View({
    center: center,
    zoom: 15,
    projection: "EPSG:3857"
  }),
  target: "map"
});


const selectedStyle = new Style({
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.7)',
  })
});



const select = new Select({
  style: selectedStyle
});
map.addInteraction(select);
const selectedFeatures = select.getFeatures();


const dragBox = new DragBox({condition: platformModifierKeyOnly});
map.addInteraction(dragBox);

// clear selection when drawing a new box and when clicking on the map
dragBox.on('boxstart', function () {
  selectedFeatures.clear();
});

dragBox.on('boxend', function () {
  let boxExtent = dragBox.getGeometry().getExtent();
  boxExtent = transformExtent(boxExtent, "EPSG:3857", "EPSG:4326");
  const boxFeatures = feldbloeckeSource
    .getFeaturesInExtent(boxExtent)

  selectedFeatures.extend(boxFeatures)
});


const infoBox = document.getElementById('featureInfo');

selectedFeatures.on(['add', 'remove'], function () {
  const names = selectedFeatures.getArray().map((feature) => {
    return feature.get('landCoverObservation.class.title');
  });
  if (names.length > 0) {
    infoBox.innerHTML = names.join(', ');
  } else {
    infoBox.innerHTML = 'None';
  }
});

applyMapboxStyle(
  map,
  "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json"
).then(
  function (map) {
    map.addLayer(feldbloeckeLayer)
  }
 );


