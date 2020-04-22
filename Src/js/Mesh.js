"use strict";

class Mesh {

  constructor(g, m) {

    this.matl = m; // material
    this.geom = g; // geometry

  };
   
  draw() {

    this.matl.commit();
    this.geom.draw();

  };


}
