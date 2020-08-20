const URL_BASE = "https://www.canyoudrinktapwaterin.com/tap-water-safety-in";
const generateCityUrl = city => `https://www.canyoudrinktapwaterin.com/is-${city}-tap-water-safe-to-drink`;

const thresholds = [
  {label: "< 20%", value: 19},
  {label: "20%-39%", value: 39},
  {label: "40%-59%", value: 59},
  {label: "60%-79%", value: 79},
  {label: "80%-100%", value: 100},
];

const chooseColor = value => {
  if (value > 80) return "#406141";
  if (value > 60) return "#08303b";
  if (value > 40) return "#ff9f00";
  if (value > 20) return "#ff5202";
  if (value >= 0) return "#a70009";
  return "#ecf0f1";
};

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