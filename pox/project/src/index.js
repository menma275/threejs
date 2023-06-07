console.log(fxhash);
console.log(fxrand());

const sp = new URLSearchParams(window.location.search);
console.log(sp);

$fx.params([
  {
    id: "color_num",
    name: "Number of Colors",
    type: "number",
    options: {
      min: 3,
      max: 8,
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

// // this is how features can be defined
// $fx.features({
//   "A random feature": Math.floor($fx.rand() * 10),
//   "A random boolean": $fx.rand() > 0.5,
//   "A random string": ["A", "B", "C", "D"].at(Math.floor($fx.rand()*4)),
//   "Feature from params, its a number": $fx.getParam("number_id"),
// })

// // log the parameters, for debugging purposes, artists won't have to do that
// console.log("Current param values:")
// // Raw deserialize param values
// console.log($fx.getRawParams())
// // Added addtional transformation to the parameter for easier usage
// // e.g. color.hex.rgba, color.obj.rgba.r, color.arr.rgb[0]
// console.log($fx.getParams())

// // how to read a single raw parameter
// console.log("Single raw value:")
// console.log($fx.getRawParam("color_id"));
// // how to read a single transformed parameter
// console.log("Single transformed value:")
// console.log($fx.getParam("color_id"));

// // update the document based on the parameters
// document.body.style.background = $fx.getParam("color_id").hex.rgba
// document.body.innerHTML = `
// <p>
// url: ${window.location.href}
// </p>
// <p>
// hash: ${$fx.hash}
// </p>
// <p>
// params:
// </p>
// <pre>
// ${$fx.stringifyParams($fx.getRawParams())}
// </pre>
// <pre style="color: white;">
// ${$fx.stringifyParams($fx.getRawParams())}
// </pre>
// `
