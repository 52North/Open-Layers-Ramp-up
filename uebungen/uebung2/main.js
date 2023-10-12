import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile.js';
import ImageLayer from 'ol/layer/Image.js';
import XYZ from 'ol/source/XYZ.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle, Fill, Stroke, Style} from 'ol/style.js';
import Select from 'ol/interaction/Select.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import Point from 'ol/geom/Point.js';
import Feature from 'ol/Feature.js';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import {
  transformExtent,
  fromLonLat
} from 'ol/proj.js';


proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

const extent = transformExtent([5.6989, 50.1506, 9.6835, 52.602], "EPSG:4326", "EPSG:25832");


fetch('https://www.wmts.nrw.de/geobasis/wmts_nw_dtk/1.0.0/WMTSCapabilities.xml')
  .then(function (response) {
    return response.text();
  })
  .then(function (capabilitiesXML) {
    const parser = new WMTSCapabilities();
    const capabilities = parser.read(capabilitiesXML);
    let options = optionsFromCapabilities(capabilities, {
      matrixSet: 'EPSG_25832_16',
      layer: "nw_dtk_sw",
    });
    
    const wmtsDTK = new TileLayer({
      source: new WMTS(options)
    })
    
    const gewaesserLayer = new ImageLayer({
      visible: true,
      source: new ImageWMS({
        url: 'https://www.wms.nrw.de/umwelt/gsk3c',
        params: {'LAYERS': '1'},
      }),
    })
    
    const pegelSource = new VectorSource({
      loader: function (extent, resolution, projection, success, failure) {
        const url = "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json"
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        const onError = function() {
          failure();
        }
        xhr.onerror = onError;
        xhr.onload = function() {
          if (xhr.status == 200) {
            const hits = JSON.parse(xhr.responseText);
            const newFeatures = [];
    
            for(const hit of hits){
                if(hit["longitude"] && hit["latitude"]){
                  const coords = fromLonLat([hit["longitude"], hit["latitude"]], "EPSG:25832")
                  const geom = new Point(coords);
                  const feature = new Feature(geom)
                  feature.setId(hit["uuid"])
                  feature.setProperties(hit)
                  newFeatures.push(feature)
                } 
            }
    
    
            pegelSource.addFeatures(newFeatures);
            success(newFeatures);
          } else {
            onError();
          }
        }
        xhr.send();
      }
    });
    
    const pegelLayer = new VectorLayer({
      extent: extent,
      source: pegelSource,
      style: new Style({
        image: new Circle({
          fill: new Fill({color: 'blue'}),
          stroke: new Stroke({
            color: 'black',
            width: 1.25,
          }),
          radius: 8
        })
      })
    });

    const map = new Map({
      target: 'map',
      layers: [wmtsDTK, gewaesserLayer, pegelLayer],
      view: new View({
        projection: "EPSG:25832",
        center: [0, 0],
        minZoom: 0,
        maxZoom: 16
      })
    });

    const selectInteraction = new Select({style: new Style({
      image: new Circle({
        fill: new Fill({color: 'yellow'}),
        stroke: new Stroke({
          color: 'black',
          width: 1.25,
        }),
        radius: 10
      })
    })});
    selectInteraction.on('select', function (e) {
      if(e.selected.length > 0){
       const selectedFeature =  e.selected[0]
       document.getElementById('featureInfo').innerHTML = JSON.stringify({Pegel: selectedFeature.get("longname"), Gewaesser: selectedFeature.get("water")["longname"], KM: selectedFeature.get("km")})
      }else{
        document.getElementById('featureInfo').innerHTML = "no feature selected"
      }
    });
    map.addInteraction(selectInteraction);
    
    map.getView().fit(extent)
  });









