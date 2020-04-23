"use strict";

class Material {

  constructor(gl, program) {

    this.gl = gl;
    this.program = program;

    const mat = this;

    Object.keys(program.uniforms).forEach(function(name) {

      const uniform = program.uniforms[name];
      const val = UniformReflection.makeVar(gl, uniform.type, uniform.size);
      Object.defineProperty(mat, name, { value: val } );

    });

  }

  commit() {

    this.program.commit();

    const mat = this;

    Object.keys(this.program.uniforms).forEach( function(name) {

      let uniform = mat.program.uniforms[name];
      mat[name].commit(mat.gl, uniform.location);

    });

  }

}
