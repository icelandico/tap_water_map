const mymap = L.map('map-container').setView([51.505, -0.09], 3);
const myCustomStyle = {
  stroke: true,
  fill: true,
  fillColor: '#ccc333',
  color: '#1F2232',
  weight: 0.2,
  fillOpacity: 0.5
};

const geojsonLayer = new L.GeoJSON.AJAX("custom.geo.json", {style: myCustomStyle});

L.tileLayer('http://{s}.tiles.mapbox.com/v3/texastribune.map-3g2hqvcf/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

geojsonLayer.addTo(mymap)

