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

  const n = Math.floor(Math.random() * 6) + 5;
  const prob = interpolate(n);
  const offset = width / 3;
  var offsetY = (height - (width - offset * 2)) / 2;
  offsetY = offset / 2;
  const boxSize = (width - offset * 2) / n;

  var material = new THREE.MeshBasicMaterial({});

  const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const spehereGeometry = new THREE.SphereGeometry(boxSize / 2, 32, 16);

  const gradientMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(colors[0]) },
      color2: { value: new THREE.Color(colors[1]) },
      boundingBoxMin: {
        value: new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2),
      },
      boundingBoxMax: {
        value: new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2),
      },
    },
    vertexShader: document.getElementById("gradientVert").textContent,
    fragmentShader: document.getElementById("gradientFrag").textContent,
  });

  // 基本図形を生成
  const box = new THREE.Mesh(boxGeometry, material);
  // const boxTest = new THREE.Mesh(boxGeometry, gradientMaterial);
  const sphere = new THREE.Mesh(spehereGeometry, material);

  console.log();
  // scene.add(boxTest);

  // objectをいっぱい配置
  var boxSizeTempX, boxSizeTempY, boxSizeTempZ;
  for (let i = 0; i < n; i++) {
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
        var colorNum = Math.floor(Math.random() * (colors.length - 1)) + 1;
        cloneMaterial.color = new THREE.Color(colors[colorNum]);
        cloneGeo.material = cloneMaterial;
        cloneGeo.position.x = -width / 2 + offset + boxSize / 2 + i * boxSize;
        cloneGeo.position.y = -height / 2 + offsetY + boxSize / 2 + j * boxSize;
        cloneGeo.position.z = -width / 2 + offset + boxSize / 2 + k * boxSize;
        cloneGeo.rotation.x = Math.floor(Math.random() * 5) * 45 * Math.PI;
        cloneGeo.rotation.y = Math.floor(Math.random() * 5) * 45 * Math.PI;
        cloneGeo.rotation.z = Math.floor(Math.random() * 5) * 45 * Math.PI;
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

  // レンダリング結果に対してエフェクト
  // レンダリングターゲットを作成する
  // var renderTarget = new THREE.WebGLRenderTarget(innerWidth, innerHeight);
  // シェーダーパスの作成
  // var effectPass = new THREE.ShaderPass(shaderMaterial);
  // effectPass.renderToScreen = true;
  // // エフェクトを適用するレンダリングパイプラインの作成
  // var composer = new THREE.EffectComposer(renderer, renderTarget);
  // composer.addPass(new THREE.RenderPass(scene, camera));
  // composer.addPass(effectPass);

  tick();

  function tick() {
    requestAnimationFrame(tick);
    // composer.render();
    renderer.render(scene, camera);
  }
}
