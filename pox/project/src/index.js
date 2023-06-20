const sp = new URLSearchParams(window.location.search);
// console.log(fxhash);
// console.log(fxrand());

$fx.params([
  {
    id: "color_num",
    name: "Colors & Shapes",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "hue",
    name: "Random Color",
    type: "number",
    options: {
      min: 0,
      max: 1,
      step: 0.00001,
    },
  },
  {
    id: "saturation",
    name: "Base Saturation",
    type: "number",
    options: {
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  {
    id: "lightness",
    name: "Base Lightness",
    type: "number",
    options: {
      min: 0.5,
      max: 0.75,
      step: 0.01,
    },
  },
]);
