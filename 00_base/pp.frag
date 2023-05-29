uniform sampler2D tDiffuse;
varying vec2 vUv;

void main(){
    vec4 color = texture2D(tDiffuse, vUv);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(vec3(gray), color.a);
}