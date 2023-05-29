#ifdef GL_ES
precision mediump float;
#endif

// uniform vec2 u_resolution;
// uniform float u_time;

// uniform vec3 color0;
// uniform vec3 color1;
// varying vec2 vUv;

// vec2 center = vec2(0.5);
// vec3 w_c = vec3(255, 255, 255)/255.0;
// vec3 b_c = vec3(0, 0, 0)/255.0;

// vec2 fixAspect(vec2 st){
//     st -= 0.5;
//     st.x /= u_resolution.y/u_resolution.x;
//     st += 0.5;
//     return st;
// }

// float random(vec2 n) { 
//     return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
// }

void main(){
    // vec2 st = fixAspect(gl_FragCoord.xy/u_resolution.xy);
    // vec2 mouse = fixAspect(u_mouse.xy/u_resolution.xy);

    vec3 color = vec3(0.0);
    color.r = 1.0;
    color.g = 0.0;
    color.b = 0.0;
    color = mix(b_c, w_c, color);
    gl_FragColor = vec4(color, 1.0);

    // gl_FragColor = vec4(mix(color0, color1, vUv.y), 1.0);
}