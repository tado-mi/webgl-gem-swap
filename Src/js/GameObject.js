"use strict";
class GameObject {

  constructor(mesh) {

    this.mesh = mesh;
    this.typeID;

    this.position = new Vector3D(-55, -55, 0);
    this.matrix   = new Mat4();

    // falling
    this.isFalling = false;
    this.featherFall = new Vector3D(0,0,0);

    // rotation
    this.ang = 0;
    this.axisRotation = new Vector3D(0,0,0);

    // shrink
    this.startShrink = false;
    this.scale = new Vector3D(0.45, 0.45, 1);

  };

  rotate(dt) {

    this.ang += 3*dt;

  }

  setRotation(axis) {

    this.axisRotation = axis;

  }

  fall_(x, y) {

    this.position.sub(this.featherFall);
    this.featherFall.add(x, y, 0);

  }

  fall(){

    this.fall_(0, 0.05);

  }

  roll(){

    this.fall_(0.05, 0);

  }


  shrink() {

    if (this.scale.x < 0.035){

      this.scale.set(0,0,0);

    } else {

      this.scale.sub(0.03,0.03,0);

    }

  }

  update() {

    this.matrix.set().
      scale(this.scale).
      rotate(this.ang, this.axisRotation).
      translate(this.position);

  };

  draw(camera) {

    this.update();

    this.mesh.matl.modelViewProjMatrix.set().
    	mul(this.matrix).
      mul(camera.matrix);

    this.mesh.draw();
  };

}
