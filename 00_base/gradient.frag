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