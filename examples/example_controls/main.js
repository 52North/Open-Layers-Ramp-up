import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import FullScreen from 'ol/control/FullScreen.js';
import {defaults} from 'ol/control/defaults';

const map = new Map({
  target: 'map',
  controls: defaults({ //edit default controls
    zoom: true,
    rotate: false,
    attribution: false
  }),
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

const fullscreen = new FullScreen({tipLabel: "Vollbildmodus"}); //adjust tooltip
map.addControl(fullscreen);
