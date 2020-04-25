/**
 * @file WebGLMath UniformReflectionFactories object
 * @copyright Laszlo Szecsi 2017
 */

var UniformReflection = {

  makeVar : function(gl, type, arraySize) {
    switch(type) {
      case gl.FLOAT        : return new Vec1();
      case gl.FLOAT_VEC2   : return new Vec2();
      case gl.FLOAT_VEC3   : return new Vector3D();
      case gl.FLOAT_VEC4   : return new Vec4();
      case gl.FLOAT_MAT4   : return new Mat4();
    }
  },

};
