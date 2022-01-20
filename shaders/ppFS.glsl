#version 300 es

precision mediump float;

uniform uint uLutDimSize;
uniform sampler2D uLut;
uniform sampler2D uFrameTexture;

in vec2 vFragTexCoord;

out vec4 fragColor;

void main()
{
    vec4 texel = texture(uFrameTexture, vFragTexCoord);
    
    float dim = float(uLutDimSize);
    
    float blueIndex = max((ceil(dim * texel.b) - 1.0), 0.0);
    float greenIndex = max((ceil(dim * texel.g) - 1.0), 0.0) / dim;
    float redIndex = max((ceil(dim * texel.r) - 1.0), 0.0) / dim / dim;
    
    float lutIndex = (blueIndex + greenIndex + redIndex) / dim + 0.0039;
    
    fragColor = texture(uLut, vec2(lutIndex, 0.0));
    //fragColor = texture(uLut, vFragTexCoord);
    //fragColor = texel;
}