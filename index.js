const mymap = L.map('map-container').setView([51.505, -0.09], 2);
const countryInfo = L.control();

countryInfo.onAdd = function (map) {
  this.div = L.DomUtil.create('div', 'info')
  this.update();
  return this.div;
};

countryInfo.update = function (props) {
  const waterValue = props && props.waterQuality || 'No data'
  this.div.innerHTML = '' +
      '<h1>Tap Water Quality</h1>' +
      '<p class="map__info-country-name">' + (props ? props.name : `Country/City`) + '</p>' +
      '<p>' + (props ? waterValue : 'Hover on country/city') + '</p>'
      ;
};

countryInfo.addTo(mymap);

const countriesStyle = feature => {
  return {
    stroke: true,
    fill: true,
    fillColor: chooseColor(feature.properties.waterQuality),
    color: '#f1f2f6',
    weight: 0.3,
    fillOpacity: 1
  }
};

const chooseColor = value => {
  if (!value) return "#ecf0f1";
  if (value > 80) return "#218c74";
  if (value > 60) return "#20bf6b";
  if (value > 40) return "#f0932b";
  if (value > 20) return "#cd6133";
  if (value > 0) return "#b33939";
  if (value == 0) return "#57606f";
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
 `

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
  layer.setStyle({
    weight: 0.75,
    color: '#1F2232',
    dashArray: '',
  });
  updateInfo(layer.feature.properties);

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
};

const markerOn = e => {
  const layer = e.target;
  updateInfo(layer.feature.properties);
};

const updateInfo = data => {
  countryInfo.update(data);
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

const markerAction = (feature, layer) => {
  layer.on({
    mouseover: markerOn,
    mouseout: resetHighlight,
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
  mymap.fitBounds(e.target.getBounds());
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

// L.tileLayer('http://{s}.tiles.mapbox.com/v3/texastribune.map-3g2hqvcf/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
//   noWrap: true
// }).addTo(mymap);

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
