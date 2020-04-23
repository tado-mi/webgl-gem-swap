class OrthoCamera {

  constructor() {

    this.position = new Vec2(4.5, 4.5);
    this.rotation = 0;
    this.windowSize = new Vec2(13.5, 13.5);

    this.matrix = new Mat4();
    this.update();

  };

  update() {

    this.matrix.set().
      scale(0.5).
      scale(this.windowSize).
      rotate(this.rotation).
      translate(this.position).
      invert();

  };

  setAspectRatio(s) {

    this.windowSize.x = this.windowSize.y * s;
    this.update();
    
  };

}
