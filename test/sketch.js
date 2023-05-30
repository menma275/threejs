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

  var boxSize = width / 5;
  var material = new THREE.MeshBasicMaterial({
    color: colors[1],
  });

  // shaderのマテリアル
  const uniforms = {
    time: { type: "f", value: 1.0 },
    color1: { type: "vec3", value: new THREE.Color(colors[1]) },
    color2: { type: "vec3", value: new THREE.Color(colors[2]) },
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
    void main() {

      vec2 fuv = -1.0 + 2.0 * vUv;

      float c = sin(fuv.s*fuv.t);
      vec3 color = mix(color1, color2, c);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  var boxGeometry = new THREE.BoxGeometry(
    boxSize * 1.0,
    boxSize * 1.0,
    boxSize * 1.0
  );

  const box = new THREE.Mesh(boxGeometry, material);
  scene.add(box);

  scene.rotation.x = 15 * (Math.PI / 180);
  scene.rotation.y = 45 * (Math.PI / 180);

  animate();

  function animate() {
    requestAnimationFrame(animate);
    box.material.uniforms.time.value += 0.1;
    renderer.render(scene, camera);
  }
}
