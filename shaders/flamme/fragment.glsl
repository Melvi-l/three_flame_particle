varying float v_yPositionNormalized;
varying float v_distanceToCenterNormalized;
varying float v_scale;

uniform vec3 u_innerColor;
uniform vec3 u_outerColor;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    vec4 color = vec4(1.,1.,1.,0.);
    if (distanceToCenter<.5) {
        vec3 baseColor = mix(u_innerColor, u_outerColor, v_yPositionNormalized*2./3. + v_distanceToCenterNormalized*1./3.);

        float opacity = 1. - v_yPositionNormalized - v_distanceToCenterNormalized * v_scale  * .7;

        color = vec4(baseColor, opacity);
    }
    gl_FragColor = color;

}