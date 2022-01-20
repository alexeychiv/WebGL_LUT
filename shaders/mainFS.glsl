#version 300 es

precision mediump float;

in vec2 vFragTexCoord;
in vec3 vFragNormal;

struct DirectionalLight
{
	vec3 direction;
	vec3 color;
};

uniform vec3 uAmbientLightIntensity;
uniform DirectionalLight uSun;

uniform sampler2D uSampler;

out vec4 fragColor;

void main()
{
	vec3 surfaceNormal = normalize(vFragNormal);
	vec3 normSunDir = normalize(uSun.direction);
	
	vec4 texel = texture(uSampler, vFragTexCoord);
	
	vec3 lightIntensity = uAmbientLightIntensity +
		uSun.color * max(dot(vFragNormal, normSunDir), 0.0);
	
	fragColor = vec4(texel.rgb * lightIntensity, texel.a);
}