#version 300 es

precision mediump float;

in vec3 aVertPos;
in vec2 aVertTexCoord;
in vec3 aVertNormal;

out vec2 vFragTexCoord;
out vec3 vFragNormal;

uniform mat4 uMatWorld;
uniform mat4 uMatView;
uniform mat4 uMatProj;

void main()
{
    vFragTexCoord = aVertTexCoord;
    vFragNormal = (uMatWorld * vec4(aVertNormal, 0.0)).xyz;
    
    gl_Position = uMatProj * uMatView * uMatWorld * vec4(aVertPos, 1.0);
}