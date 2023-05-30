window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", onResize);

var renderer, camera;
var colors, palette;

function onResize() {
  // サイズを取得
  var windowSize = Math.min(innerWidth, innerHeight);
  var width = windowSize / Math.sqrt(2);
  width = windowSize;
  var height = windowSize;

  // レンダラーのサイズを調整する
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // カメラのアスペクト比を正す
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function interpolate(n) {
  var startN = 5;
  var startProb = 0.4;
  var endN = 10;
  var endProb = 0.2;

  if (n <= startN) {
    return startProb;
  } else if (n >= endN) {
    return endProb;
  } else {
    var t = (n - startN) / (endN - startN);
    var prob = startProb * (1 - t) + endProb * t;
    return prob;
  }
}

function init() {
  // 画面サイズ
  var windowSize = Math.min(innerWidth, innerHeight);
  var width = windowSize / Math.sqrt(2);
  width = windowSize;
  var height = windowSize;

  // colors = colorPalette();
  colors = generativePalette();

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors[0]);

  camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0.1,
    10000
  );
  camera.position.set(0, 500, 1000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var n = Math.floor(Math.random() * 4) + 5;
  const prob = interpolate(n);
  const offset = width / 3;
  var offsetY = (height - (width - offset * 2)) / 2;
  offsetY = offset / 2;
  const boxSize = (width - offset * 2) / n;

  const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const spehereGeometry = new THREE.SphereGeometry(boxSize / 2, 32, 16);

  var brightColor = colors[1];
  var darkColor = colors[2];

  var bHSL = {};
  var dHSL = {};
  brightColor.getHSL(bHSL);
  darkColor.getHSL(dHSL);

  if (bHSL.l < dHSL.l) {
    brightColor = new THREE.Color(colors[2]);
    darkColor = new THREE.Color(colors[1]);
  }

  // shaderのマテリアル
  const uniforms = {
    time: { type: "f", value: 1.0 },
    color1: { type: "vec3", value: darkColor },
    color2: { type: "vec3", value: brightColor },
  };

  const vertexShader = `
    precision mediump float;
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `;

  const fragmentShader = `
    precision mediump float;
    varying vec2 vUv;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float time;

    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    // Simplex 2D noise
    vec3 permute(vec3 x) { 
      return mod(((x*34.0)+1.0)*x, 289.0); 
    }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
              -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {

      vec2 fuv = -1.0 + 2.0 * vUv;

      float c = sin(fuv.s*fuv.t);
      // c = snoise(fuv*.5);

      c *= rand(fuv)*2.0;

      vec3 color = mix(color1, color2, c);
      // color = vec3(c);

      gl_FragColor = vec4(color, 0.8);
    }
  `;

  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });

  // 基本図形を生成
  const box = new THREE.Mesh(boxGeometry, material);
  const sphere = new THREE.Mesh(spehereGeometry, material);

  // box.scale.set(10, 10, 5);
  // scene.add(box);
  // scene.add(sphere);

  // objectをいっぱい配置
  var boxSizeTempX = 1;
  var boxSizeTempY = 1;
  var boxSizeTempZ = 1;
  for (let i = 0; i < n; i++) {
    // for (let j = 0; j < n; j++) {
    for (let j = 0; j < Math.floor((height - offsetY * 2) / boxSize); j++) {
      for (let k = 0; k < n; k++) {
        var cloneGeo = box.clone();
        var cloneMaterial = material.clone();

        boxSizeTempX = Math.floor(Math.random() * 5) / 10 + 0.25;
        boxSizeTempY = Math.floor(Math.random() * 15) / 10 + 0.5;
        boxSizeTempZ = Math.floor(Math.random() * 10) / 10 + 0.5;

        if (Math.random() < 0.25) {
          cloneGeo = sphere.clone();
          cloneGeo.scale.set(boxSizeTempX, boxSizeTempX, boxSizeTempX);
        } else cloneGeo.scale.set(boxSizeTempX, boxSizeTempY, boxSizeTempZ);

        var colorNum0 = Math.floor(Math.random() * (colors.length - 1)) + 1;
        var colorNum1 = Math.floor(Math.random() * (colors.length - 1)) + 1;

        cloneMaterial.uniforms.color1.value = new THREE.Color(
          colors[colorNum0]
        );
        cloneMaterial.uniforms.color2.value = new THREE.Color(
          colors[colorNum1]
        );
        // cloneMaterial.color = new THREE.Color(colors[colorNum]);
        cloneGeo.material = cloneMaterial;

        cloneGeo.position.x = -width / 2 + offset + boxSize / 2 + i * boxSize;
        cloneGeo.position.y = -height / 2 + offsetY + boxSize / 2 + j * boxSize;
        cloneGeo.position.z = -width / 2 + offset + boxSize / 2 + k * boxSize;

        if (Math.random() < prob) scene.add(cloneGeo);
      }
    }
  }

  // ビューを変化
  const rotateXZ = Math.random();
  if (rotateXZ > 1 - 1 / 3) scene.rotation.z = 90 * (Math.PI / 180);
  else if (rotateXZ < 1 / 3) scene.rotation.x = 15 * (Math.PI / 180);
  if (Math.random() < 0.5) scene.rotation.y = 45 * (Math.PI / 180);
  else scene.rotation.y = -45 * (Math.PI / 180);

  // scene.rotation.x = 15 * (Math.PI / 180);
  // scene.rotation.y = 45 * (Math.PI / 180);

  tick();

  function tick() {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  }
}
