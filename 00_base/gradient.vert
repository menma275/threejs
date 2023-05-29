// attribute vec3 aPosition;
// attribute vec2 aTexCoord;

// uniform vec3  boundingBoxMin;
// uniform vec3  boundingBoxMax;
// varying vec2 vUv;

void main() {

  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;

  // vUv.y = (position.y - boundingBoxMin.y) / (boundingBoxMax.y - boundingBoxMin.y);
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}