const mymap = L.map('map-container').setView([51.505, -0.09], 3);

const countriesStyle = feature => {
  return {
    stroke: true,
    fill: true,
    fillColor: chooseColor(feature.properties.waterQuality),
    color: '#1F2232',
    weight: 0.2,
    fillOpacity: 0.5
  }
}

function chooseColor(value) {
  if (value > 80) return "#045a8d"
  if (value > 60) return "#2b8cbe"
  if (value > 40) return "#74a9cf"
  if (value > 20) return "#bdc9e1"
  if (value > 0) return "#f1eef6"
}

const geojsonLayer = new L.GeoJSON.AJAX("countries.geojson", {style: countriesStyle});

L.tileLayer('http://{s}.tiles.mapbox.com/v3/texastribune.map-3g2hqvcf/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

geojsonLayer.addTo(mymap)

