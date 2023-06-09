function generativePalette() {
  var colors = [];
  const n = $fx.getParam("color_num");
  const div = 4;

  var h = $fx.getParam("hue");
  var s, l;

  var saturation = $fx.getParam("saturation");
  var lightness = $fx.getParam("lightness");

  var color = new THREE.Color();
  color.setHSL(($fx.rand() + $fx.randminter()) / 2, 0.05, 0.75);
  colors.push(color);

  for (var i = 0; i < n; i++) {
    color = new THREE.Color();
    h = (h + (1 / div) * i) % 1;
    s = (($fx.rand() + $fx.randminter()) / 2) * (1 - saturation) + saturation;
    l = (($fx.rand() + $fx.randminter()) / 2) * (1 - lightness) + lightness;
    color.setHSL(h, s, l);
    colors.push(color);
  }

  return colors;
}
