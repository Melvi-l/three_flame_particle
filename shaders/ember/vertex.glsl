uniform vec3 u_position;
uniform float u_size;
uniform float u_time;
uniform float u_radius;
uniform float u_height;
uniform float u_speedFactor;
uniform float u_spreadFactor;

attribute float a_scale;

varying float v_yPositionNormalized;
varying float v_distanceToCenterNormalized;
varying float v_scale;
varying vec2 v_uv;

void main() {
    float P_MASS = (a_scale + 1.)/1.5;

    vec4 modelPosition = modelMatrix * vec4(position,1.);

    vec4 absolutePosition = modelPosition;
    absolutePosition.y += u_time * u_speedFactor / P_MASS;

    vec4 loopedPosition = absolutePosition;
    float distanceToCenter = distance(loopedPosition.xz, u_position.xz);
    float yRelative = absolutePosition.y - u_position.y;
    float yLoopedRelative = fract(yRelative/u_height)*u_height;
    loopedPosition.y = u_position.y + yLoopedRelative + pow(distanceToCenter,2.);
    v_yPositionNormalized = yLoopedRelative / u_height;

    loopedPosition.xz *= a_scale*v_yPositionNormalized*u_spreadFactor;

    vec4 viewPosition = viewMatrix * loopedPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition; 
    gl_PointSize = u_size*a_scale;
    gl_PointSize *= (1. / -viewPosition.z);

    v_distanceToCenterNormalized = distanceToCenter/u_radius;
    v_scale = a_scale;
    v_uv = uv;

}