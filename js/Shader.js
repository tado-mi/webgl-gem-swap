"use strict";

class Shader {

    constructor(gl, type, sourceFinename) {

      this.glShader = gl.createShader(type);

      if (Shader.source.hasOwnProperty(sourceFinename)) {

        gl.shaderSource(this.glShader, Shader.source[sourceFinename]);

      } else {

        console.err('Shader ' + sourceFinename + ' not found. Check spelling, and whether the essl file is embedded into the html file.');

      }

      gl.compileShader(this.glShader);

      if (!gl.getShaderParameter(this.glShader, gl.COMPILE_STATUS)) {

        console.log(
          'Error in shader ' + sourceFinename + ':\n' +
          gl.getShaderInfoLog(this.glShader).replace(/ERROR: 0/g, Shader.sourcePathURL + sourceFinename)
        );

        console.err('Shader ' + sourceFinename + ' had compilation errors.');
      }

    }

}

Shader.sourcePathURL = document.currentScript.src.split('Shader.js')[0] + 'shaders/';
Shader.source = {};
