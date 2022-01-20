#version 300 es

precision mediump float;

in vec2 aPosition;
in vec2 aTexCoord;

out vec2 vFragTexCoord;

void main()
{
    vFragTexCoord = aTexCoord;
    
    gl_Position = vec4(aPosition, 0.0, 1.0);
}