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
  camera.position.set(0, 1000, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var boxSize = (width * 3) / 5;

  const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

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
    resolution: { type: "v2", value: new THREE.Vector2(boxSize, boxSize) },
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

  const fragmentShader2 = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color1;
    uniform vec3 color2;

    const vec3 cPos = vec3(-3.0,  3.0,  3.0);
    const vec3 cDir = vec3(0.577, -0.577, -0.577);
    const vec3 cUp  = vec3(0.577, 0.577, -0.577);

    const vec3 lightDir = vec3(-0.577, 0.577, 0.577);

    // smoothing min
    float smoothMin(float d1, float d2, float k){
        float h = exp(-k * d1) + exp(-k * d2);
        return -log(h) / k;
    }

    // box distance function
    float distFuncBox(vec3 p){
        return length(max(abs(p) - vec3(0.5, 0.5, 0.5), 0.0)) - 0.1;
    }

    // distance function
    float distFunc(vec3 p){
        float d1 = distFuncBox(p+.1);
        float d2 = distFuncBox(p);
        return smoothMin(d1, d2, 8.0);
    }

    vec3 genNormal(vec3 p){
        float d = 0.0001;
        return normalize(vec3(
            distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3( -d, 0.0, 0.0)),
            distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  -d, 0.0)),
            distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  -d))
        ));
    }

    float rand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    void main(void){
        // fragment position
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        // camera and ray
        vec3 cSide = cross(cDir, cUp);
        float targetDepth = 2.0;
        vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);
        
        // marching loop
        float tmp, dist;
        tmp = 0.0;
        vec3 dPos = cPos;
        for(int i = 0; i < 256; i++){
            dist = distFunc(dPos);
            tmp += dist;
            dPos = cPos + tmp * ray;
        }
        
        // hit check
        vec3 color;
        if(abs(dist) < 0.001){
            vec3 normal = genNormal(dPos);
            float diff = clamp(dot(lightDir, normal), 0.1, 1.0);
            color = vec3(1.0, 1.0, 1.0) * diff;
        }else{
            color = vec3(0.0);
        }
        gl_FragColor = vec4(color, 1.0);
    }
  `;

  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader2,
    transparent: true,
  });

  // 基本図形を生成
  const box = new THREE.Mesh(boxGeometry, material);
  scene.add(box);

  tick();

  function tick() {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  }
}
