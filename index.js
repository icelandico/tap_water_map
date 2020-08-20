const mymap = L.map('map-container').setView([51.505, -0.09], 2);
const featureInfo = L.control();
const legendElement = L.control({ position: 'bottomleft' });
let currentFeature = "";
let previousFeature = "";

featureInfo.onAdd = function () {
  this.div = L.DomUtil.create('div', 'info');
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

featureInfo.update = function (props, isPoint) {
  const waterValue = props && props.waterQuality || 'No data';
  const generatedLink = `${URL_BASE}-${currentFeature.toLowerCase()}`;
  this.div.innerHTML = '' +
    '<h1 class="map__info-country-name">' + (props && props.name || `Country/City`) + '</h1>' +
    '<p class="map__info-country-rate">' + (props ? `Water Rating: ${waterValue}` : 'Hover on country/city') + '</p>' +
    `<a class="map__info--details-link" href="${isPoint ? generateCityUrl(currentFeature.toLowerCase()) : generatedLink}" >
      ${currentFeature ? "See details for " + currentFeature : "Click feature to see details"}
    </a>`;
};

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
          <span class="city-info-value">${val || "?"}</span>
      </div>
    `
  });
  return divIcon
};

const highlightFeature = e => {
  const layer = e.target;
  featureInfo.update(layer.feature.properties);
  setFeatureColor(layer);
};

const setFeatureColor = layer => {
  const waterQualityValue = parseInt(layer.feature.properties.waterQuality);
  layer.setStyle({
    weight: 0.75,
    color: '#1F2232',
    dashArray: '',
    fillColor: chooseColor(waterQualityValue)
  });
};

const markerOn = e => {
  const layer = e.target;
  featureInfo.update(layer.feature.properties);
};

const resetHighlight = e => {
  const currentCountry = e.target.feature.properties.name;
  if (currentCountry !== currentFeature) geojsonLayerCountries.resetStyle(e.target);
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

const geojsonLayerWorldCities = new L.GeoJSON.AJAX("geojson/world_cities.geojson", {
  pointToLayer: function(geoJsonPoint, latlng) {
    return L.marker(latlng, { icon: customIcon(geoJsonPoint) });
  },
  onEachFeature: markerAction
});

const zoomToFeature = e => {
  const featureType = e.target.feature.geometry.type;
  if (featureType !== "Point") highlightFeature(e);
  currentFeature = e.target.feature.properties.name;
  resetPreviousStyle(e.target);
  if (featureType === "Point") {
    const latLngs = e.target.getLatLng();
    mymap.setView(latLngs, 7);
  } else {
    featureInfo.update(e.target.feature.properties);
    mymap.fitBounds(e.target.getBounds());
    setFeatureColor(e.target)
  }
};

const resetPreviousStyle = layer => {
  if (previousFeature) geojsonLayerCountries.resetStyle(previousFeature);
  previousFeature = layer;
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

mymap.on('zoomend',function(e) {
  const currentZoom = mymap.getZoom();
  if (currentZoom >= 5) {
    geojsonLayerCities.addTo(mymap)
    // geojsonLayerWorldCities.addTo(mymap)
  }
  else if (currentZoom >= 4) {
    addStatesLayer();
    geojsonLayerCities.remove();
    geojsonLayerWorldCities.remove();
  } else {
    removeUsStates();
  }
});

geojsonLayerCountries.addTo(mymap);
legendElement.addTo(mymap);
featureInfo.addTo(mymap);
