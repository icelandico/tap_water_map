const mymap = L.map('map-container').setView([51.505, -0.09], 2);
const countryInfo = L.control();

countryInfo.onAdd = function (map) {
  this.div = L.DomUtil.create('div', 'info')
  this.update();
  return this.div;
};

countryInfo.update = function (props) {
  const waterValue = props && props.waterQuality || "No Data"
  this.div.innerHTML = '<h1>Tap Water Quality</h1>' +  (props ?
      '<p class="map__info-country-name">' + props.name + '</p>' +
      '<p>' + waterValue + '</p>'
      : 'Hover over a country');
};

countryInfo.addTo(mymap);

const countriesStyle = feature => {
  return {
    stroke: true,
    fill: true,
    fillColor: chooseColor(feature.properties.waterQuality),
    color: '#1F2232',
    weight: 0.2,
    fillOpacity: 0.7
  }
};

const chooseColor = value => {
  if (!value) return "#ecf0f1";
  if (value > 80) return "#269a4e";
  if (value > 60) return "#2ecc71";
  if (value > 40) return "#f1c40f";
  if (value > 20) return "#e67e22";
  if (value > 0) return "#e74c3c";
  if (value == 0) return "#34495e";
};

const highlightFeature = e => {
  const layer = e.target;

  layer.setStyle({
    weight: 0.75,
    color: '#1F2232',
    dashArray: '',
    fillOpacity: 0.7
  });
  countryInfo.update(layer.feature.properties);

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
};

const resetHighlight = e => {
  geojsonLayerCountries.resetStyle(e.target);
  countryInfo.update();
};

const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
};

const usFilter = feature => {
  if (feature.properties.abbrev !== "U.S.A.") return true
};

const geojsonLayerCountries = new L.GeoJSON.AJAX("countries.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature,
});

const geojsonLayerCountriesNoUs = new L.GeoJSON.AJAX("countries.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature,
  filter: usFilter
});

const geojsonLayerStates = new L.GeoJSON.AJAX("us_states.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature
});

const zoomToFeature = e => {
  // const clickedFeature = e.target;
  // if (clickedFeature.feature.properties.abbrev === "U.S.A.")
  // clickedFeature.setStyle({
  //   fillOpacity: 0
  // });
  mymap.fitBounds(e.target.getBounds());
};

const addStatesLayer = () => {
  geojsonLayerCountries.remove();
  geojsonLayerCountriesNoUs.addTo(mymap);
  geojsonLayerStates.addTo(mymap)
};

const removeUsStates = () => {
  geojsonLayerCountriesNoUs.remove();
  geojsonLayerCountries.addTo(mymap);
  geojsonLayerStates.remove();
};

L.tileLayer('http://{s}.tiles.mapbox.com/v3/texastribune.map-3g2hqvcf/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  noWrap: true
}).addTo(mymap);

mymap.on('zoomend',function(e){
  const currentZoom = mymap.getZoom();
  if (currentZoom >= 4) {
    addStatesLayer();
  } else {
    removeUsStates();
  }
});

geojsonLayerCountries.addTo(mymap);

