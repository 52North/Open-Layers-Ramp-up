import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Style} from 'ol/style.js';
import Select from 'ol/interaction/Select.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from "ol/tilegrid/WMTS";

//bbox Suedbayern
const extent = [1441989, 6015334, 1479282, 6067740];

//WMTS Tile Grid definitions
const topLeftCorner = [-20037508.3427892, 20037508.3427892];
const resolutions = [
    4891.96981025128,
    2445.98490512564,
    1222.99245256282,
    611.49622628141,
    305.748113140705,
    152.874056570353,
    76.4370282851763,
    38.2185141425881,
    19.1092570712941,
    9.55462853564703,
    4.77731426782352,
    2.38865713391176,
    1.19432856695588,
    0.59716428347794
];
const matrixIDs = [0,1,2,3,4,5,6,7,8,9,10,11,12,13]

const wmtsLayerTopo = new TileLayer({
  source:  new WMTS({
    url: `https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/{layer}/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
    layer: "de_basemapde_web_raster_grau",
    matrixSet: "DE_EPSG_3857_ADV",
    projection: "EPSG:3857", //must be available for matrixSet
    requestEncoding: "REST",
    tileGrid: new WMTSTileGrid({
        origin: topLeftCorner,
        resolutions: resolutions,
        matrixIds: matrixIDs
    }),
    style: "default",
    attributions: `Hintergrundkarte Bundesamt für Kartographie und Geodäsie 2023 https://gdz.bkg.bund.de/index.php/default/wmts-basemapde-webraster-wmts-basemapde-webraster.html`
  }),
  visible: true
});

  const wmtsLayerSchum = new TileLayer({
    source:  new WMTS({
      url: `https://sgx.geodatenzentrum.de/wmts_basemapde_schummerung/tile/1.0.0/{layer}/{style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
      matrixSet: "DE_EPSG_3857_ADV",
      layer: 'de_basemapde_web_raster_combshade',
      projection: "EPSG:3857", //must be available for matrixSet
      requestEncoding: "REST",
      tileGrid: new WMTSTileGrid({
          origin: topLeftCorner,
          resolutions: resolutions,
          matrixIds: matrixIDs
      }),
      style: "default",
      attributions: `Hintergrundkarte Bundesamt für Kartographie und Geodäsie 2023 https://gdz.bkg.bund.de/index.php/default/wmts-basemapde-schummerung-wmts-basemapde-schummerung.html`
    }),
    visible: false
  });

const layerName = "Lawinenkataster";
const lawinenSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = "3857"

    const url = "https://services.arcgis.com/ObdAEOfl1Z5LP2D0/arcgis/rest/services/" +
    layerName +
    "/FeatureServer/0" +
      '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":' +
          srid +
          '}}'
      ) +
      '&geometryType=esriGeometryEnvelope&inSR=' +
      srid +
      '&outFields=*' +
      '&outSR=' +
      srid;

    return url;
  },
  strategy: bboxStrategy
});

const lawinenLayer = new VectorLayer({
  source: lawinenSource,
  style: function (feature) {
    const hfk = feature.get('HFK')
    let lawinenStyle;
    if(hfk === 1){
      lawinenStyle = new Style({
        fill: new Fill({color: 'green'})
      })
    }else if(hfk === 2){
      lawinenStyle = new Style({
        fill: new Fill({color: 'blue'})
      })
    }else{
      lawinenStyle = new Style({
        fill: new Fill({color: 'red'})
      })
    }
    return lawinenStyle;
  },
});


const map = new Map({
  target: 'map',
  layers: [wmtsLayerTopo, wmtsLayerSchum, lawinenLayer],
  view: new View({
    projection: "EPSG:3857",
    center: [0, 0],
    zoom: 3
  })
});



const selectInteraction = new Select({style: new Style({ fill: new Fill({color: 'yellow'})})});
selectInteraction.on('select', function (e) {
  if(e.selected.length > 0){
   const selectedFeature =  e.selected[0]
   document.getElementById('featureInfo').innerHTML = JSON.stringify({Lawinennummer: selectedFeature.get("LAWINE_NR"), HFK: selectedFeature.get("HFK")})
  }else{
    document.getElementById('featureInfo').innerHTML = "no feature selected"
  }
});
map.addInteraction(selectInteraction);

map.getView().fit(extent)

const topoRadio = document.getElementById("topo");
topoRadio.checked = true;
topoRadio.addEventListener('change', function() {
  if(topoRadio.checked){
    wmtsLayerSchum.setVisible(false);
    wmtsLayerTopo.setVisible(true);
  }
});
const schumRadio = document.getElementById("schum");
schumRadio.addEventListener('change', function() {
  if(schumRadio.checked){
    wmtsLayerSchum.setVisible(true)
    wmtsLayerTopo.setVisible(false)
  }
});