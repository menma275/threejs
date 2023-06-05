function generativePalette() {
  var colors = [];
  var n = $fx.getParam("color_num"); //Math.floor(Math.random() * 6) + 3
  var div = 4;

  var h = $fx.getParam("hue"); //Math.random();
  var s, l;
  var flexS = Math.random() * 0.25 + 0.25;
  var baseS = Math.random() * 0.25 + 0.25;
  var baseL = Math.random() * 0.05 + 0.45;

  var color = new THREE.Color();
  color.setHSL(Math.random(), 0.05, 0.75);
  colors.push(color);

  for (var i = 0; i < n; i++) {
    color = new THREE.Color();
    h = (h + (1 / div) * i) % 1;
    s = Math.random() * flexS + baseS;
    l = Math.random() * 0.5 + baseL;
    color.setHSL(h, s, l);
    colors.push(color);
  }
  console.log(colors);

  return colors;
}

function colorPalette() {
  const palettes = [
    ["#F0EAD8", "#FF7F75", "#F76E7C", "#F73668", "#021E66"],
    ["#FF4444", "#78B5E3", "#F5B111", "#D1D1C2", "#181D1F"],
    ["#C7C0A7", "#ED2860", "#F79F07", "#33302D", "#6666E2"],
    ["#F3C318", "#EF6760", "#2AAAAA", "#5243C2", "#EAE3E9"],
  ];

  var colors = [];
  var paletteNum = Math.floor(Math.random() * palettes.length);
  var palette = palettes[paletteNum];

  for (let i = palette.length - 1; i > 0; i--) {
    let r = Math.floor(Math.random() * (i + 1));
    let tmp = palette[i];
    palette[i] = palette[r];
    palette[r] = tmp;
  }

  for (let j = 0; j < palette.length; j++) {
    var color = new THREE.Color(palette[j]);
    colors.push(color);
  }
  return colors;
}
