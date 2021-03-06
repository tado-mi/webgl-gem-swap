"use strict";

const colors = {
  'heart': [226/255, 169/255, 190/255],
  'star':  [241/255, 233/255, 203/255],
  'square': [194/255, 213/255, 167/255],
  'cross':  [176/255, 171/255, 202/255],
  'diamond':  [163/255, 214/255, 212/255],
  'triangle': [203/255, 233/255, 241/255],
  'flower':   [0.9, 0.9, 0.9],
  'sphere':   [1.0, 1.0, 1.0]
};

class Geometry {

  constructor(gl, col) {

    this.gl = gl;
    this.col = col;
    this.set();

  }

  setParameters() {

    // defined for each geometry

  }

  genPointSet() {

    // defined for each geometry

  }

  genColSet() {

    if (this.colSet == undefined) {

      this.colSet = [];

      // color of the endpoints
      // this.col will be set up for each geometry individually
      for (var i = 0; i < (2 * this.n + 1); i = i + 1) {

        this.colSet = this.colSet.concat(this.col);

      }

    }

  }

  setPointBuffer() {

    let gl = this.gl;

    this.pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pointSet), gl.STATIC_DRAW);

  }

  setColorBuffer() {

    let gl = this.gl;

    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colSet), gl.STATIC_DRAW);

  }

  setIndexBuffer() {

    let gl = this.gl;

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.indexSet = [];
    // note:    number of endpoints is 2 * n
    //          at the index [2 * n] in pointSet we have stored the center
    for (var i = 0; i < 2 * this.n + 1; i = i + 1) {

      this.indexSet.push(2 * this.n, i, (i + 1) % (2 * this.n));

    }

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexSet), gl.STATIC_DRAW);

  }

  set() {

    this.setParameters();

    // set of vertices for the geometry
    this.pointSet = [];
    // generate and bind the endpoints
    this.genPointSet();
    // set up the buffer
    this.setPointBuffer();

    // set of colors for vertices for the geometry
    // generate and bind the colors
    this.genColSet();
    // set up the buffer
    this.setColorBuffer();

    // set the index buffer
    this.setIndexBuffer();

  }

  draw() {

    const gl = this.gl;

    // setting positions to pipeline input
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // setting colors to pipeline input
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    // setting index buffer to pipeline input
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // draw
    gl.drawElements(gl.TRIANGLES, 2 * 3 * this.n, gl.UNSIGNED_SHORT, 0);


  }

};

class HeartGeometry     extends Geometry {

  setParameters() {

    this.n = 20;
    if (this.col == undefined) {
      this.col = colors.heart;
    }

  }

  genPointSet() {

    this.pointSet = [];

    var full = 2 * Math.PI;
    var inc  = Math.PI / this.n;

    for (var angle = 0; angle < full; angle = angle + inc) {

      // scaling factor
      var f = 0.05;

      var sin = Math.sin(angle);

      var cos =[];
      for (var i = 0; i < 5; i = i + 1) cos.push(Math.cos(i * angle));

      var x = f * ( 16 * sin * sin * sin);
      var y = f * ( 13 * cos[1] - 5 * cos[2] - 2 * cos[3] - cos[4]);

      this.pointSet.push(x, y, 0);

    }

    // push the hardcoded central point
    this.pointSet.push(0, 0, 0);

  }

};

class StarGeometry      extends Geometry {

  setParameters() {

    this.n = 5;
    this.r = 0.4;
    this.R = 0.8;

    if (this.col == undefined) {
      this.col = colors.star;
    }

  }

  // generate and bind the endpoints
  genPointSet() {

    this.pointSet = [];

    var full = 2 * Math.PI;
    var inc	 = Math.PI / this.n;

    let r = this.r;
    let R = this.R;

    for (var angle = Math.PI / 2; angle < (full + Math.PI / 2); angle = angle + inc) {

      this.pointSet.push(R * Math.cos(angle), R * Math.sin(angle), 0);
      this.pointSet.push(r * Math.cos(angle + inc), r * Math.sin(angle + inc), 0);
      angle = angle + inc;

    }

    // push the hardcoded central point
    this.pointSet.push(0, 0, 0);

  }

};

class SquareGeometry    extends Geometry {

  setParameters() {

    this.n = 2;
    this.r = 0.8;
    this.R = 0.8;

    if (this.col == undefined) {
      this.col = colors.square;
    }

  }

  // generate and bind the endpoints
  genPointSet() {

    this.pointSet = [];

    var full = 2 * Math.PI;
    var inc  = Math.PI / this.n;

    let r = this.r;
    let R = this.R;

    for (var angle = Math.PI/4; angle < (Math.PI/4 + full ); angle = angle + inc) {

      this.pointSet.push(R * Math.cos(angle), R * Math.sin(angle), 0);
      this.pointSet.push(r * Math.cos(angle + inc), r * Math.sin(angle + inc), 0);
      angle = angle + inc;

    }

    // push the hardcoded central point
    this.pointSet.push(0, 0, 0);

  }

};

class CrossGeometry     extends StarGeometry {

  setParameters() {

    this.n = 4;
    this.r = 0.35;
    this.R = 0.8;

    if (this.col == undefined) {
      this.col = [176/255, 171/255, 202/255];
    }

  }

};

class TriangleGeometry  extends StarGeometry {

  setParameters() {

    this.n = 3;
    this.r = 0.4;
    this.R = 0.8;

    if (this.col == undefined) {
      this.col = colors.triangle;
    }

  }

};

class DiamondGeometry   extends StarGeometry {

  setParameters() {

    this.n = 2;
    this.r = 0.5;
    this.R = 0.7;

    if (this.col == undefined) {
      this.col = colors.diamond;
    }

  }

};

class SphereGeometry    extends StarGeometry {

  setParameters() {

    this.n = 40;
    this.r = 0.7;
    this.R = 0.7;

    if (this.col == undefined) {
      this.col = colors.sphere;
    }

  }

};

class FlowerGeometry    extends StarGeometry {

  setParameters() {

    this.n = 7;
    this.r = 0.5;
    this.R = 0.8;

    if (this.col == undefined) {
      this.col = colors.flower;
    }

  }

};
