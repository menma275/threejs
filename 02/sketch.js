window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", onResize);

var renderer, camera;
var colors, palette;

function onResize() {
  // サイズを取得
  var windowSize = Math.min(innerWidth, innerHeight);
  // windowSize = 1000;
  var width = windowSize / Math.sqrt(2);
  // width = windowSize;
  // width = (windowSize * 3) / 4;
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
  // width = windowSize;
  // width = (windowSize * 3) / 4;
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

  // camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

  camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    0.1,
    10000
  );
  camera.position.set(0, 500, 1000);
  // camera.position.set(0, 500, 1000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const prob = interpolate(n);
  const offset = width / 2.75;
  const offsetY = (height - offset) / 2;

  // ヘルパーを出す
  const axesHelper = new THREE.AxesHelper(1000);
  // scene.add(axesHelper);

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
    windowSize: { type: "f", value: windowSize },
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
    uniform float windowSize;

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
      // c = snoise(fuv*.2);

      // c += rand(fuv)*0.25;
      c += rand(fuv)*0.0005*windowSize;

      vec3 color = mix(color1, color2, c);
      // color = vec3(c);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  console.log(windowSize);

  const blockNumMax = 3;
  for (let blockNum = 0; blockNum < blockNumMax; blockNum++) {
    var n = Math.floor(Math.random() * 2) + 2;
    var boxSize = (width - offset * 2) / n;
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const spehereGeometry = new THREE.SphereGeometry(boxSize / 2, 32, 16);
    var material = new THREE.MeshBasicMaterial({
      color: colors[1],
    });

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    });
    var box = new THREE.Mesh(boxGeometry, material);
    var sphere = new THREE.Mesh(spehereGeometry, material);
    var coordinates = [];
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
          coordinates.push(false);
        }
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          var boxSizeX = 1;
          var boxSizeY = 1;
          var boxSizeZ = 1;
          var p = i + j * n * n + k * n;
          if (!coordinates[p]) {
            var object = box.clone();
            var cloneMaterial = material.clone();

            var setTrueMax;
            var searchStep;

            var moveDirection = Math.floor(Math.random() * 3); //0:x, 1:y, 2:z

            switch (moveDirection) {
              case 0:
                var maxNX = n - i;
                for (let isEmptyX = 0; isEmptyX < maxNX; isEmptyX++) {
                  if (coordinates[p + isEmptyX]) {
                    maxNX = isEmptyX;
                    break;
                  }
                }
                boxSizeX = Math.floor(Math.random() * maxNX) + 1;
                setTrueMax = boxSizeX;
                searchStep = 1;
                break;
              case 1:
                var maxNY = n - j;
                for (let isEmptyY = 0; isEmptyY < maxNY; isEmptyY++)
                  if (coordinates[p + isEmptyY * n * n]) {
                    maxNY = isEmptyY;
                    break;
                  }
                boxSizeY = Math.floor(Math.random() * maxNY) + 1;
                setTrueMax = boxSizeY;
                searchStep = n * n;
                break;
              case 2:
                var maxNZ = n - k;
                for (let isEmptyZ = 0; isEmptyZ < maxNZ; isEmptyZ++)
                  if (coordinates[p + isEmptyZ * n]) {
                    maxNZ = isEmptyZ;
                    break;
                  }
                boxSizeZ = Math.floor(Math.random() * maxNZ) + 1;
                setTrueMax = boxSizeZ;
                searchStep = n;
                break;
            }

            for (let setTrue = 0; setTrue < setTrueMax; setTrue++) {
              coordinates[p + setTrue * searchStep] = true;
            }

            if (
              ((boxSizeX == boxSizeY) == boxSizeZ) == 1 &&
              Math.random() < 0.5
            ) {
              object = sphere.clone();
              object.rotation.y = 180 * (Math.PI / 180);
            }

            var offsetSize = 0.3;
            object.scale.set(
              boxSizeX - offsetSize,
              boxSizeY - offsetSize,
              boxSizeZ - offsetSize
            );

            var colorNum = Math.floor(Math.random() * (colors.length - 1)) + 1;
            var colorNum0 = Math.floor(Math.random() * (colors.length - 1)) + 1;
            var colorNum1 = Math.floor(Math.random() * (colors.length - 1)) + 1;
            while (colorNum0 == colorNum1) {
              colorNum1 = Math.floor(Math.random() * (colors.length - 1)) + 1;
            }

            cloneMaterial.uniforms.color1.value = new THREE.Color(
              colors[colorNum0]
            );
            cloneMaterial.uniforms.color2.value = new THREE.Color(
              colors[colorNum1]
            );
            // cloneMaterial.color = new THREE.Color(colors[colorNum]);
            object.material = cloneMaterial;

            var adjustX = (boxSizeX / 2) * boxSize;
            var adjustY = (boxSizeY / 2) * boxSize;
            var adjustZ = (boxSizeZ / 2) * boxSize;
            console.log("blockNum : " + blockNum);
            object.position.x = -width / 2 + offset + i * boxSize + adjustX;
            object.position.y =
              (-height / blockNumMax) * Math.sqrt(3) +
              (height / (blockNumMax + 0.25)) * (blockNum + 1) -
              height / 2 +
              offsetY +
              j * boxSize +
              adjustY;
            object.position.z = -width / 2 + offset + k * boxSize + adjustZ;
            scene.add(object);
          }
        }
      }
    }
  }
  // ビューを変化
  // const rotateXZ = Math.random();
  // if (rotateXZ > 1 - 1 / 3) scene.rotation.z = 90 * (Math.PI / 180);
  // else if (rotateXZ < 1 / 3) scene.rotation.x = 15 * (Math.PI / 180);
  // if (Math.random() < 0.5) scene.rotation.y = 45 * (Math.PI / 180);
  // else scene.rotation.y = -45 * (Math.PI / 180);

  scene.rotation.x = 15 * (Math.PI / 180);
  scene.rotation.y = 45 * (Math.PI / 180);

  tick();

  function tick() {
    // scene.rotation.x += 0.005;
    // scene.rotation.y += 0.005;
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  }
}
