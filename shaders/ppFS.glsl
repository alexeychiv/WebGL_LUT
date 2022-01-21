#version 300 es

precision mediump float;

uniform uint uLutDimSize;
uniform float uLutStr;
uniform sampler2D uLut;
uniform sampler2D uFrameTexture;

in vec2 vFragTexCoord;

out vec4 fragColor;

void main()
{
    vec4 texel = texture(uFrameTexture, vFragTexCoord);
    
    float dim = float(uLutDimSize);
    
    float blueIndex = max((ceil(dim * texel.b) - 1.0), 0.0);
    float greenIndex = max((ceil(dim * texel.g) - 1.0), 0.0);
    float redIndex = max((ceil(dim * texel.r) - 1.0), 0.0) / dim;
    
    float lutIndexX = (blueIndex + redIndex) / dim + 0.0039;
    float lutIndexY = greenIndex / dim + 0.0039;
    
    vec4 lutColor = texture(uLut, vec2(lutIndexX, lutIndexY));
    
    //vec4 lutColor = texture(uLut, vFragTexCoord);
    fragColor = vec4(mix(texel.rgb, lutColor.rgb, uLutStr), texel.a);
    
    //fragColor = lutColor;
    //fragColor = texel;
}