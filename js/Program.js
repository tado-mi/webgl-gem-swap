class Program {

  constructor(gl, v, f) { // v: vertex shader, f: fragment shader

    this.gl = gl;
    this.glProgram = gl.createProgram();

    gl.attachShader(this.glProgram, v.glShader);
    gl.attachShader(this.glProgram, f.glShader);

    gl.bindAttribLocation(this.glProgram, 0, 'vertexPosition');
    gl.bindAttribLocation(this.glProgram, 1, 'vertexColor');

    gl.linkProgram(this.glProgram);

    if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
      console.err('Could not link shaders [vertex shader:' + v.sourceFilename + ']',
        ':[fragment shader: ' + f.sourceFilename + ']\n' + gl.getProgramInfoLog(this.glProgram));
    }

    this.uniforms = {};

    // n: number of active uniforms
    const n = gl.getProgramParameter(this.glProgram, gl.ACTIVE_UNIFORMS);
    for(let i = 0; i < n; i = i + 1) {

      const glUniform = gl.getActiveUniform(this.glProgram, i);
      let uniform = {
        type: glUniform.type,
        size: glUniform.size || 1,
        location: gl.getUniformLocation(this.glProgram, glUniform.name)
      };
      this.uniforms[glUniform.name.split('[')[0]] = uniform;
    };
  };

  commit(){

  	this.gl.useProgram(this.glProgram);

  };

}
