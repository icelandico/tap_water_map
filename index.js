const mymap = L.map('map-container').setView([51.505, -0.09], 2);
const featureInfo = L.control();
const legendElement = L.control({ position: 'bottomleft' });
const URL_BASE = "https://www.canyoudrinktapwaterin.com/tap-water-safety-in";
let currentCountry = "";
let currentRating = "";
let locked = false;

const thresholds = [
  {label: "< 20%", value: 19},
  {label: "20%-39%", value: 39},
  {label: "40%-59%", value: 59},
  {label: "60%-79%", value: 79},
  {label: "80%-100%", value: 100},
];

const chooseColor = value => {
  if (!value) return "#ecf0f1";
  if (value > 80) return "#406141";
  if (value > 60) return "#08303b";
  if (value > 40) return "#ff9f00";
  if (value > 20) return "#ff5202";
  if (value > 0) return "#a70009";
};

featureInfo.onAdd = function () {
  this.div = L.DomUtil.create('div', 'info')
  this.update();
  return this.div;
};

legendElement.onAdd = function(map) {
  const legendDiv = L.DomUtil.create('div', 'map-legend');
  for (let i = 0; i < thresholds.length; i++) {
    legendDiv.innerHTML += `
      <div class="legend-item__container">
        <div class="legend-grade-item grade-color" style="background: ${chooseColor(thresholds[i]["value"])}"></div>
        <span class="legend-grade-item">${thresholds[i]["label"]}</span>
      </div>`
  }
  return legendDiv
};

featureInfo.update = function (props) {
  const waterValue = props && props.waterQuality || 'No data'
  this.div.innerHTML = '' +
      '<h1 class="map__info-country-name">' + (props && props.name || `Country/City`) + '</h1>' +
      '<p class="map__info-country-rate">' + (props ? `Water Rating: ${props.waterQuality}` : 'Hover on country/city') + '</p>' +
      `<a class="map__info--details-link" href="${URL_BASE}-${currentCountry.toLowerCase()}" >See details for ${currentCountry}</a>`
      ;
};

featureInfo.addTo(mymap);

const countriesStyle = () => {
  return {
    stroke: true,
    fill: true,
    fillColor: '#325670',
    color: '#7991a3',
    weight: 0.3,
    fillOpacity: 1
  }
};

const markerHtmlStyles = value => `
  background-color: ${chooseColor(value)};
  min-width: 1.5rem;
  min-height: 1.5rem;
  display: block;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF
 `;

const customIcon = feature => {
  const val = feature.properties.waterQuality;
  const divIcon = L.divIcon({
    className: "city-marker-container",
    iconSize: [24, 24],
    iconAnchor: [18, 30],
    labelAnchor: [0, 0],
    popupAnchor: [-4, -24],
    html: `
      <div class="city-marker" style="${markerHtmlStyles(val)}">
          <span class="city-info-value">${val}</span>
      </div>
    `
  });
  return divIcon
};

const highlightFeature = e => {
  const layer = e.target;
    updateInfo(layer.feature.properties),
    setFeatureColor(layer);
};

const setFeatureColor = (layer) => {
  layer.setStyle({
    weight: 0.75,
    color: '#1F2232',
    dashArray: '',
    fillColor: chooseColor(layer.feature.properties.waterQuality)
  });
}

const markerOn = e => {
  const layer = e.target;
  updateInfo(layer.feature.properties);
};

const updateInfo = data => {
  // currentCountry = data.name;
  // currentRating = data.waterQuality;
  featureInfo.update(data);
};

const resetHighlight = e => {
  geojsonLayerCountries.resetStyle(e.target);
  featureInfo.update();
};

const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
};

const markerAction = (feature, layer) => {
  layer.on({
    mouseover: markerOn,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
};

const usFilter = feature => {
  if (feature.properties.abbrev !== "U.S.A.") return true
};

const geojsonLayerCountries = new L.GeoJSON.AJAX("geojson/countries.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature,
});

const geojsonLayerCountriesNoUs = new L.GeoJSON.AJAX("geojson/countries.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature,
  filter: usFilter
});

const geojsonLayerStates = new L.GeoJSON.AJAX("geojson/us_states.geojson", {
  style: countriesStyle,
  onEachFeature: onEachFeature,
});

const geojsonLayerCities = new L.GeoJSON.AJAX("geojson/us_cities.geojson", {
  pointToLayer: function(geoJsonPoint, latlng) {
    return L.marker(latlng, { icon: customIcon(geoJsonPoint) });
  },
  onEachFeature: markerAction
});

const zoomToFeature = e => {
  const featureType = e.target.feature.geometry.type;
  if (featureType !== "Point") highlightFeature(e);
  if (featureType === "Point") {
    const latLngs = e.target.getLatLng();
    mymap.setView(latLngs, 7);
  } else {
    currentCountry = e.target.feature.properties.name
    mymap.fitBounds(e.target.getBounds());
    locked = true;
    updateInfo(e.target.feature.properties);
    setFeatureColor(e.target)
  }
};

const addStatesLayer = () => {
  geojsonLayerCountries.remove();
  geojsonLayerCountriesNoUs.addTo(mymap);
  geojsonLayerStates.addTo(mymap);
};

const removeUsStates = () => {
  geojsonLayerCountriesNoUs.remove();
  geojsonLayerCountries.addTo(mymap);
  geojsonLayerStates.remove();
  geojsonLayerCities.remove();
};

mymap.on('zoomend',function(e){
  const currentZoom = mymap.getZoom();
  if (currentZoom >= 5) {
    geojsonLayerCities.addTo(mymap)
  }
  else if (currentZoom >= 4) {
    addStatesLayer();
    geojsonLayerCities.remove();
  } else {
    removeUsStates();
  }
});

geojsonLayerCountries.addTo(mymap);
legendElement.addTo(mymap)
