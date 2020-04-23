"use strict";
class generalGeometry {

  constructor(gl) {

    this.gl = gl;
    this.set();

  }

  setParameters() {

    // defined for each geometry

  }

  genPointSet() {

    // defined for each geometry

  }

  genColSet() {

    this.colSet = [];

    // color of the endpoints
    // this.col will be set up for each geometry individually
    for (var i = 0; i < (2 * this.n + 1); i = i + 1) {

      this.colSet = this.colSet.concat(this.col);

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
    this.colSet = [];
    // generate and bind the colors
    this.genColSet();
    // set up the buffer
    this.setColorBuffer();

    // set the index buffer
    this.setIndexBuffer();

  }

  draw() {

    let gl = this.gl;

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

class heartGeometry     extends generalGeometry {

  setParameters() {

    this.n = 20;
    this.col = [1.0, 0.4, 0.5];

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

class starGeometry      extends generalGeometry {

  setParameters() {

    this.n = 5;
    this.r = 0.4;
    this.R = 0.8;

    this.col = [1.0, 1.0, 0.4];

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

class squareGeometry    extends generalGeometry {

  setParameters() {

    this.n = 2;
    this.r = 0.8;
    this.R = 0.8;

    this.col = [1.0, 1.0, 0.8];

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

class crossGeometry     extends starGeometry {

  setParameters() {

    this.n = 4;
    this.r = 0.35;
    this.R = 0.8;

    this.col = [0.7, 0.7, 1.0];

  }

};

class triangleGeometry  extends starGeometry {

  setParameters() {

    this.n = 3;
    this.r = 0.4;
    this.R = 0.8;

    this.col = [0.4, 0.9, 0.6];

  }

};

class diamondGeometry   extends starGeometry {

  setParameters() {

    this.n = 2;
    this.r = 0.5;
    this.R = 0.7;

    this.col = [0.7, 1.0, 1.0];

  }

};

class sphereGeometry    extends starGeometry {

  setParameters() {

    this.n = 40;
    this.r = 0.7;
    this.R = 0.7;

    this.col = [0.95, 0.70, 0.80];

  }

};

class flowerGeometry    extends starGeometry {

  setParameters() {

    this.n = 10;
    this.r = 0.6;
    this.R = 0.8;

    this.col = [0.7, 0.9, 0.5];

  }

};
