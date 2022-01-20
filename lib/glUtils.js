

export default class GLUtils
{
    //==============================================================================
    //INIT GL
    
    static getGLcontext = function (canvas)
    {
        let gl;
        try 
        {
            gl = canvas.getContext("webgl2");
        } catch (e)
        {
            console.log("ERROR: " + e);
        }
        
        if (gl)
            return gl;
        
        if (!gl) {
            console.log("ERROR: Your browser does not support WebGL2!");
        }
    };
    //==============================================================================
    
    //==============================================================================
    //SHADER PROGRAM
    static createShaderProgram = function (
        gl, vertexShaderSource, fragmentShaderSource
    )
    {
        var vertexShader = GLUtils.getShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = GLUtils.getShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        var program = gl.createProgram();
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        
        gl.validateProgram(program);
        
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
        {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        
        return program;
    }
    
    static getShader = function (gl, type, source)
    {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            console.log("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    //==============================================================================
    
    
};
