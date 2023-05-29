function generativePalette() {
  var colors = [];
  var n = 9;
  var div = 4;

  var h = Math.random();
  var s, l;
  for (var i = 0; i < n; i++) {
    var color = new THREE.Color();
    h = (h + (1 / div) * i) % 1;
    s = Math.random() * 0.5 + 0.25;
    l = Math.random() * 0.5 + 0.45;
    color.setHSL(h, s, l);
    colors.push(color);
  }

  return colors;
}
