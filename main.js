

import ResLoader from "./lib/resLoader.js";
import GLUtils from "./lib/glUtils.js";

let resLoadList = [
    { name: "mainVSsource", type: "text", path: "./shaders/mainVS.glsl" },
    { name: "mainFSsource", type: "text", path: "./shaders/mainFS.glsl" },
    { name: "ppVSsource", type: "text", path: "./shaders/ppVS.glsl" },
    { name: "ppFSsource", type: "text", path: "./shaders/ppFS.glsl" },
    { name: "crateTexture", type: "img", path: "./res/crateTexture.png"},
    { name: "mesh", type: "json", path: "./res/crate.json"},
];


class App
{
    static run(resLoadList)
    {
        ResLoader.load(resLoadList, function(resLoadedList)
            {
                App.onResLoaded(resLoadedList)
            }
        );
    }
    
    static onResLoaded(resLoadedList)
    {
        let resMap = new Map(resLoadedList);
        
        let canvas = document.getElementById("webGLcanvas");
        let gl = GLUtils.getGLcontext(canvas);
        
        let mainProgram = 
        {
            prog: GLUtils.createShaderProgram(gl, resMap.get("mainVSsource"), resMap.get("mainFSsource"))
        };
        
        mainProgram["aVertPos"] = gl.getAttribLocation(mainProgram.prog, 'aVertPos');
        mainProgram["aVertTexCoord"] = gl.getAttribLocation(mainProgram.prog, 'aVertTexCoord');
        mainProgram["aVertNormal"] = gl.getAttribLocation(mainProgram.prog, 'aVertNormal');
        
        let ppProgram = 
        {
            prog: GLUtils.createShaderProgram(gl, resMap.get("ppVSsource"), resMap.get("ppFSsource"))
        }
        
        ppProgram['aPosition'] = gl.getAttribLocation(ppProgram.prog, 'aPosition');
        ppProgram['aTexCoord'] = gl.getAttribLocation(ppProgram.prog, 'aTexCoord');
        
        //=======================================================
        //BUFFERS
        
        let mesh = resMap.get("mesh");
        
        let cubeVertices = mesh.meshes[0].vertices;
        let cubeIndices = [].concat.apply([], mesh.meshes[0].faces);
        let cubeTexCoords = mesh.meshes[0].texturecoords[0];
        let cubeNormals = mesh.meshes[0].normals;
        
        let cubeVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
        
        let cubeIBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
        
        let cubeTexVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexCoords), gl.STATIC_DRAW);
        
        let cubeNormVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);
        
        let floatSize = Float32Array.BYTES_PER_ELEMENT;
        
        
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        //=======================================================
        
        //=======================================================
        //TEXTURE
        
        let crateTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resMap.get("crateTexture"));
        
        mainProgram["uSampler"] = gl.getUniformLocation(mainProgram.prog, "uSampler");
        
        gl.useProgram(mainProgram.prog);
        gl.uniform1i(mainProgram.uSampler, 0);
        gl.useProgram(null);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        //=======================================================
        
        //=======================================================
        //MATRICES UNIFORMS
        
        gl.useProgram(mainProgram.prog);
        
        mainProgram["uMatWorld"] = gl.getUniformLocation(mainProgram.prog, 'uMatWorld');
        mainProgram["uMatView"] = gl.getUniformLocation(mainProgram.prog, 'uMatView');
        mainProgram["uMatProj"] = gl.getUniformLocation(mainProgram.prog, 'uMatProj');
        
        let mWorld = new Float32Array(16);
        let mView = new Float32Array(16);
        let mProj = new Float32Array(16);
        
        glMatrix.mat4.identity(mWorld);
        glMatrix.mat4.lookAt(mView, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
        glMatrix.mat4.perspective(mProj, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
        
        gl.uniformMatrix4fv(mainProgram.uMatWorld, gl.FALSE, mWorld, 0, 16);
        gl.uniformMatrix4fv(mainProgram.uMatView, gl.FALSE, mView, 0, 16);
        gl.uniformMatrix4fv(mainProgram.uMatProj, gl.FALSE, mProj, 0, 16);
        
        gl.useProgram(null);
        
        //=======================================================
        
        //=======================================================
        //LIGHTING UNIFORMS
        
        gl.useProgram(mainProgram.prog);
        
        mainProgram["uAmbientLightIntensity"] = gl.getUniformLocation(mainProgram.prog, 'uAmbientLightIntensity');
        mainProgram["uSunDir"] = gl.getUniformLocation(mainProgram.prog, 'uSun.direction');
        mainProgram["uSunCol"] = gl.getUniformLocation(mainProgram.prog, 'uSun.color');
        
        gl.uniform3f(mainProgram.uAmbientLightIntensity, 0.2, 0.2, 0.2);
        gl.uniform3f(mainProgram.uSunDir, 3.0, 4.0, -2.0);
        gl.uniform3f(mainProgram.uSunCol, 0.9, 0.9, 0.9);
        
        gl.useProgram(null);
        
        //=======================================================
        
        //=======================================================================
        //LUT TEXTURE
        
        let lut = new Uint8Array(
            [
                //b0 ---------------
                //g0
                0, 0, 0,
                127, 0, 0,
                255, 0, 0,
                
                //g1
                0, 127, 0,
                127, 127, 0,
                255, 127, 0,
                
                //g2
                0, 255, 0,
                127, 255, 0,
                255, 255, 0,
                
                //b1 ---------------
                //g0
                0, 0, 127,
                127, 0, 127,
                255, 0, 127,
                
                //g1
                0, 127, 127,
                127, 127, 127,
                255, 127, 127,
                
                //g2
                0, 255, 127,
                127, 255, 127,
                255, 255, 127,
                
                //b2 ---------------
                //g0
                0, 0, 255,
                127, 0, 255,
                255, 0, 255,
                
                //g1
                0, 127, 255,
                127, 127, 255,
                255, 127, 255,
                
                //g2
                0, 255, 255,
                127, 255, 255,
                255, 255, 255,
            ]
        );
        
        let lutDimSize = 3;
        
        let lutTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, lutTexture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, lut.length / lutDimSize, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, lut);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        ppProgram["uLutDimSize"] = gl.getUniformLocation(ppProgram.prog, "uLutDimSize");
        ppProgram["uLut"] = gl.getUniformLocation(ppProgram.prog, "uLut");
        
        gl.useProgram(ppProgram.prog);
        gl.uniform1ui(ppProgram.uLutDimSize, lutDimSize);
        gl.uniform1i(ppProgram.uLut, 1);
        gl.useProgram(null);
        
        //=======================================================================
        
        //=======================================================================
        //FRAME BUFFER
        
        let frameVertexPos = new Float32Array(
            [
                -1.0, +1.0, 0.0, 0.0,
                -1.0, -1.0, 0.0, 1.0,
                +1.0, +1.0, 1.0, 0.0,
                +1.0, +1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0, 1.0,
                +1.0, -1.0, 1.0, 1.0,
            ]
        );
        
        let frameBufferVBO = gl.createBuffer();
        
        if (!frameBufferVBO) {
            console.log('ERROR: Failed to create frame VBO!');
            return;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, frameBufferVBO);
        gl.bufferData(gl.ARRAY_BUFFER, frameVertexPos, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        let framebufferTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebufferTexture, 0);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        ppProgram["uFrameTexture"] = gl.getUniformLocation(ppProgram.prog, "uFrameTexture");
        
        gl.useProgram(ppProgram.prog);
        gl.uniform1i(ppProgram.uFrameTexture, 2);
        gl.useProgram(null);
        
        //=======================================================================
        
        //=======================================================
        //RENDER
        
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        
        
        let mIdentity = new Float32Array(16);
        glMatrix.mat4.identity(mIdentity);
        
        let angle = 0;
        
        let mRotationX = new Float32Array(16);
        let mRotationY = new Float32Array(16);
        
        let doUseLUT = true;
        
        let loop = function ()
        {
            if (doUseLUT)
            {
                //=======================================================================
                //BIND FRAME BUFFER
                
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);
                
                gl.clearColor(0.3, 0.3, 0.3, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                
                //=======================================================================
            }
            
            //=======================================================================
            //RENDER MESH
            
            gl.useProgram(mainProgram.prog);
            
            angle = performance.now() / 1000 / 6 * 2 * Math.PI;
            
            glMatrix.mat4.rotate(mRotationX, mIdentity, angle / 4, [1, 0, 0]);
            glMatrix.mat4.rotate(mRotationY, mIdentity, angle, [0, 1, 0]);
            
            glMatrix.mat4.mul(mWorld, mRotationY, mRotationX);
            
            gl.uniformMatrix4fv(mainProgram.uMatWorld, gl.FALSE, mWorld, 0, 16);
            
            gl.clearColor(0.5, 0.5, 0.5, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
            gl.vertexAttribPointer(mainProgram.aVertPos, 3, gl.FLOAT, gl.FALSE, 3 * floatSize, 0);
            gl.enableVertexAttribArray(mainProgram.aVertPos);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexVBO);
            gl.vertexAttribPointer(mainProgram.aVertTexCoord, 2, gl.FLOAT, gl.FALSE, 2 * floatSize, 0 * floatSize);
            gl.enableVertexAttribArray(mainProgram.aVertTexCoord);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormVBO);
            gl.vertexAttribPointer(mainProgram.aVertNormal, 3, gl.FLOAT, gl.FALSE, 3 * floatSize, 0 * floatSize);
            gl.enableVertexAttribArray(mainProgram.aVertNormal);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, crateTexture);
            
            gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
            
            //=======================================================================
            
            if (doUseLUT)
            {
                //=======================================================================
                //RENDER FROM FRAME BUFFER TO SCREEN
                
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                
                gl.clearColor(0.5, 0.5, 0.5, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                
                gl.useProgram(ppProgram.prog);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, frameBufferVBO);
                
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, lutTexture);
                
                gl.vertexAttribPointer(ppProgram.aPosition, 2, gl.FLOAT, false, 4 * floatSize, 0);
                gl.enableVertexAttribArray(ppProgram.aPosition);
                
                gl.vertexAttribPointer(ppProgram.aTexCoord, 2, gl.FLOAT, false, 4 * floatSize, 2 * floatSize);
                gl.enableVertexAttribArray(ppProgram.aTexCoord);
                
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                
                //=======================================================================
            }
            
            requestAnimationFrame(loop);
        };
        
        let btnNoLUT = document.getElementById("btnNoLUT");
        btnNoLUT.onclick = () => doUseLUT = false;
        let btnLUT = document.getElementById("btnLUT");
        btnLUT.onclick = () => doUseLUT = true;
        
        requestAnimationFrame(loop);
        
        
        
        
        
        //=======================================================
    }
}

App.run(resLoadList);







