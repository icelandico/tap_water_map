const mymap = L.map('map-container').setView([51.505, -0.09], 3);

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
  if (value > 80) return "#1a9641";
  if (value > 60) return "#a6d96a";
  if (value > 40) return "#ffffc0";
  if (value > 20) return "#fdae61";
  if (value > 0) return "#d7191c";
};

const highlightFeature = e => {
  const layer = e.target;

  layer.setStyle({
    weight: 0.75,
    color: '#1F2232',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

const resetHighlight = e => {
  geojsonLayer.resetStyle(e.target);
};

const onEachFeature = (feature, layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

const geojsonLayer = new L.GeoJSON.AJAX("countries.geojson",{
    style: countriesStyle,
    onEachFeature: onEachFeature
  });

function zoomToFeature(e) {
  mymap.fitBounds(e.target.getBounds());
}

L.tileLayer('http://{s}.tiles.mapbox.com/v3/texastribune.map-3g2hqvcf/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

geojsonLayer.addTo(mymap)
