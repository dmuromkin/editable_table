import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileArcGISRest from "ol/source/TileArcGISRest";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { Button, Layout } from "antd";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import { defaults as defaultControls } from "ol/control";

var layerNames = [
  "Водопровод",
  "Канализация",
  "Тепловая сеть",
  "Электрическая сети",
];
const { Sider, Content } = Layout;

var layers = [
  new TileLayer({
    source: new OSM(),
  }),
];
var i;
var urls = [
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_water_tile/MapServer/",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_sewerage_tile/MapServer",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_heat_tile/MapServer/",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_energy_tile/MapServer/",
];

let extent = [
  4098520.106899999,
  7392801.4089,
  4225527.205200002,
  7561700.2141999975,
];

let mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: "EPSG:4326",
});
for (i = 0; i < layerNames.length; ++i) {
  layers.push(
    new TileLayer({
      visible: true,
      extent: extent,
      source: new TileArcGISRest({
        url: urls[i],
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        // maxZoom: 19
      }),
    })
  );
}

function changeVis(name) {
  var index = layerNames.indexOf(name) + 1;
  let curState = layers[index].getVisible();
  layers[index].setVisible(!curState);
}

function sendRequest(evt)
{
  console.log(evt.coordinate);
  let x = evt.coordinate[0];
  let y = evt.coordinate[1];
  let extent = [x - 7, y - 7, x + 7, y + 7];
  let request =
    "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_heat_tile/MapServer/11/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A"+extent[0]+"%2C%22ymin%22%3A"+extent[1]+"%2C%22xmax%22%3A"+extent[2]+"%2C%22ymax%22%3A"+extent[3]+"%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=objectid%2Cid%2Cworkmode%2Cname%2Cid_area%2Cishighway%2Cguid%2Celement_type%2Cidownernetwork&outSR=102100";
  fetch(request)
    .then((response) => response.json())
    .then((response) =>{
      if(response.features[0]===undefined)
      {
        let list= document.getElementById("list")
        let newIt = document.createElement("li")
        newIt.innerHTML = "Undefined"
        list.appendChild(newIt) 
      }
      else
      {
      console.log(response.features[0],
        "  ",
        response.features[0].attributes.id,
        "  ",
        response.features[0].attributes.name
      )
      let list= document.getElementById("list")
      let newIt = document.createElement("li")
      newIt.innerHTML = "id: "+response.features[0].attributes.id+" name: "+response.features[0].attributes.name 
      list.appendChild(newIt)     
      }
    }
    );
}

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = { center: fromLonLat([37.61556, 55.75222]), zoom: 10 };

    this.olmap = new OlMap({
      controls: defaultControls().extend([mousePositionControl]),
      target: null,
      layers: layers,
      view: new OlView({
        center: this.state.center,
        zoom: this.state.zoom,
      }),
    });
  }

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    this.olmap.setTarget("map");

    // Listen to map changes
    this.olmap.on("moveend", () => {
      let center = this.olmap.getView().getCenter();
      let zoom = this.olmap.getView().getZoom();
      this.setState({ center, zoom });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center === nextState.center && zoom === nextState.zoom) return false;
    return true;
  }

  userAction() {
    this.setState({ center: [546000, 6868000], zoom: 5 });
  }

  render() {
    this.updateMap(); // Update map on render?
    this.olmap.on("click", function (evt) {
      sendRequest(evt)
    });
    return (
      <Layout>
        <Sider style={{ background: "#6d93b8" }}>
          <div id="list">
          {layerNames.map((name) => (
            <li onClick={() => changeVis(name)} style={{ paddingTop: "2rem" }}>
              {name}
            </li>
          ))}
          <Button>Show</Button>
          </div>
        </Sider>
        <Content>
          <div id="map" style={{ width: "100%", height: "1080px" }} />
        </Content>
      </Layout>
    );
  }
}

export default Map;
