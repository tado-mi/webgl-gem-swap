"use strict";

class Scene {

  constructor(gl) {

    // create shaders
    const vs = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
    const frag = new Shader(gl, gl.FRAGMENT_SHADER, "color_fs.essl");

    // create the program
    const colorProgram   = new Program(gl, vs, frag);

    // create the material
    const material = new Material(gl, colorProgram);

    // generate meshes
    // create geomteries
    const geom = [
      new heartGeometry(gl, [226/255, 169/255, 190/255]),
      new starGeometry(gl, [241/255, 233/255, 203/255]),
      new squareGeometry(gl, [194/255, 213/255, 167/255]),
      new crossGeometry(gl, [176/255, 171/255, 202/255]),
      new triangleGeometry(gl, [225/255, 198/255, 172/255]),
      new diamondGeometry(gl, [163/255, 214/255, 212/255]),
      new sphereGeometry(gl, [212/255, 214/255, 163/255]),
      new flowerGeometry(gl, [255/255, 169/255, 190/255])
    ];

    this.mesh = [
      new Mesh(geom[0], material), // heart
      new Mesh(geom[1], material), // star
      new Mesh(geom[2], material),
      new Mesh(geom[3], material),
      new Mesh(geom[4], material),
      new Mesh(geom[5], material), // diamond
      new Mesh(geom[6], material),
      new Mesh(geom[7], material),
    ]

    this.spin_ID = 1;
    this.rotate_ID = 5;
    this.pulsate_ID = 0;
    this.numObjs = 8;

    // generate game objects
    this.gameObjects = [];
    for (var i = 0; i < 14; i = i + 1) {

      this.gameObjects[i] = [];

      for (var j = 0; j < 14; j = j + 1) {

        const object = this.getObject(i, j);
        this.gameObjects[i].push(object);
      }

    }

    this.rotateAngle = 0.005;
    this.camera = new OrthoCamera();

    this.startSwap = false;
    this.gameOver = false;

    this.score = 0;
    this.plusScore = 0;

  };

  drawScene() {

    for (var i = 2; i < 12; i = i + 1) {

      for(var j = 2; j < 12; j = j + 1) {

        const focus = this.gameObjects[i][j];
        if (focus.scale.x == 0) {
          focus.ID = -1;
        }

        // determine if the object is falling or not
        focus.isFalling = false;
        for (var k = j-1; k > 1; k = k - 1) {

          if (this.gameObjects[i][k].ID == -1) {
            // there is an 'empty' slot below
            focus.isFalling = true;
            break;
          }

        }

        if (focus.shrinking == true) {
            focus.shrink();
            focus.rotate(0.05);
        }

        focus.draw(this.camera);
     }

    }

  }

  update(gl, keysPressed, mouse) {

    // clear the screen
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.animate();

    this.handle(mouse, keysPressed);
    this.victories();
    this.shiftDown();

    //draw
    this.drawScene();

  }

  getObject(i, j) {

    const id = Math.floor(Math.random() * this.numObjs);
    const temp = this.mesh[id];

    let gameObject = new GameObject(temp, id);

    if (i < 2 || i > 11 || j < 2 || j > 11)	{
      gameObject.scale.set(0, 0, 0);
      gameObject.ID = -1;
    }

    return gameObject;

  }

  shiftDown() {

    for (var i = 2; i < 12; i = i + 1) {

      for (var j = 2; j < 12; j = j + 1) {

        const focus = this.gameObjects[i][j];

        if (focus.ID != -1) {
          continue;
        }

        var index = j + 1;
        while (index < 12 && this.gameObjects[i][index].ID == -1){
          index = index + 1
        }

        if (index < 12) {

          const curr = this.gameObjects[i][index];

          curr.fall();
          curr.isFalling = true;
          if (curr.position.y <= focus.position.y) {

            this.gameObjects[i][j] = new GameObject(curr.mesh, curr.ID);
            curr.ID = -1;

            curr.scale.set(0,0,0);
            curr.featherFall.set(0,0,0);

          }

        } else {

          let object = this.getObject(i, 11);
          this.gameObjects[i][11] = object;
          this.gameObjects[i][11].isFalling = true;

        }

      }

    }
  }

  animate() {

    const dt = 0.01;

    for (var i = 0; i < 14; i = i + 1) {

      for (var j = 0; j < 14; j = j + 1) {

        const focus = this.gameObjects[i][j];

        if (focus.ID == this.spin_ID) {
          focus.rotate(dt);
        }

        if (focus.ID == this.rotate_ID) {
          focus.setRotation(new Vector3D(0, 1, 0));
          focus.rotate(dt);
        }

        if (focus.ID == this.pulsate_ID) {
          focus.pulse();
        }

        focus.position = new Vector3D(i - 2, j - 2, 0);

      }

    }

  }

  handle(mouse, keysPressed) {

    const down = {'x': Math.floor(mouse.Down.x + 2.5), 'y': Math.floor(mouse.Down.y + 2.5)};
    if (down.x < 1 || down.x > 12 || down.y < 1 || down.y > 12) { // out of game field
      return;
    }

    const up = {'x': Math.floor(mouse.Up.x + 2.5), 'y': Math.floor(mouse.Up.y + 2.5)};
    if (up.x < 1 || up.x > 12 || up.y < 1 || up.y > 12) {
      return;
    }

    const downObj = this.gameObjects[down.x][down.y];

    if (mouse.pressedDown){

      if(keysPressed.B) { // bomb

        downObj.scale.set(0,0,0);

      }

    }

    // follow the mouse
    if (mouse.pressedMove){

      const move = {'x': mouse.Move.x, 'y': mouse.Move.y};
      downObj.position = new Vector3D(move.x, move.y, 0);

    }

    if (mouse.pressedUp) {

      if (Math.abs(down.x - up.x) > 1 || Math.abs(down.y - up.y) > 1) {
        return;
      }

      const upObj = this.gameObjects[up.x][up.y];

      // 1. consider inserting downObj in the position of upObj
      // into the row
      var row = this.gameObjects[up.x].map(item => item.ID);
      var vertical = (row[up.y - 1] == row[up.y - 2] || row[up.y - 1] == row[up.y + 1]) && row[up.y - 1] == downObj.ID;
      vertical = vertical || ( (row[up.y + 1] == row[up.y + 1] || row[up.y + 1] == row[up.y - 1]) && row[up.y + 1] == downObj.ID );

      // into a column
      var col = this.gameObjects.map(item => item[up.y]);
      col = col.map(item => item.ID);
      var horizontal = (col[up.x - 1] == col[up.x - 2] || col[up.x - 1] == col[up.x + 1]) && col[up.x - 1] == downObj.ID;
      horizontal = horizontal || ( (col[up.x + 1] == col[up.x + 1] || col[up.x + 1] == col[up.x - 1]) && col[up.x + 1] == downObj.ID );

      // 2. consider insert upObj in the position of downObj
      // into the row
      row = this.gameObjects[down.x].map(item => item.ID);
      vertical = vertical || ( (row[down.y - 1] == row[down.y - 2] || row[down.y - 1] == row[down.y + 1]) && row[down.y - 1] == upObj.ID );
      vertical = vertical || ( (row[down.y + 1] == row[down.y + 1] || row[down.y + 1] == row[down.y - 1]) && row[down.y + 1] == upObj.ID );

      // into a column
      var col =  this.gameObjects.map(item => item[down.y]);
      col = col.map(item => item.ID);
      horizontal = horizontal || ( (col[down.x - 1] == col[down.x - 2] || col[down.x - 1] == col[down.x + 1]) && col[down.x - 1] == upObj.ID );
      horizontal = horizontal || ( (col[down.x + 1] == col[down.x + 1] || col[down.x + 1] == col[down.x - 1]) && col[down.x + 1] == upObj.ID );

      if (vertical || horizontal) { // swap

        this.gameObjects[up.x][up.y] = new GameObject(downObj.mesh, downObj.ID);

        this.gameObjects[down.x][down.y] = new GameObject(upObj.mesh, upObj.ID);

        this.startSwap = true;

      }

      mouse.pressedDown = false;
      mouse.pressedUp = false;

    }


  }

  victories() {

      var timerPlus = 20;
      this.plusScore = 0;

      for (var i = 2; i < 13; i = i + 1) {

        for(var j = 2; j < 13; j = j + 1) {

          const focus = this.gameObjects[i][j];
          if (focus.ID == -1 || focus.isFalling) {
            continue;
          }

          var diff = 0;

          var col =  this.gameObjects.map(item => item[j]);
          const horizontal = !col[i - 1].isFalling && !col[i + 1].isFalling &&
          focus.ID == col[i - 1].ID && focus.ID == col[i + 1].ID;

          if (horizontal) {

            col = col.map(item => item.ID);

            var l = -1;
            while (col[i + l] == col[i + l - 1]) {

              l = l - 1;
              if (i + l == 1) {
                break;
              }

            }

            var r = 1;
            while (col[i + r] == col[i + r + 1]) {

              r = r + 1;
              if (i + r == 13) {
                break;
              }

            }

            var success = false;
            for (var m = l; m <= r && !success; m = m + 1) {

              this.gameObjects[i + m][j].shrinking = true;

              if (this.gameObjects[i + m][j].scale.x == 0) {

                for (var h = l; h <= r; h = h + 1) {
                  this.gameObjects[i + h][j].scale.set(0,0,0);
                  this.gameObjects[i + h][j].shrinking = false;
                }
                success = true;

              }

            }

            if (!this.gameOver && this.startSwap) {

              diff += r - l;
              this.plusScore += diff * 10;
              // this.plusScoreOpacity -= 0.05;

            }

          }

          var row = this.gameObjects[i];
          const vertical = !row[j - 1].isFalling && !row[j + 1].isFalling &&
          focus.ID == row[j - 1].ID && focus.ID == row[j + 1].ID;

          if (vertical) {

            row = row.map(item => item.ID);

            var l = -1;
            while (row[j + l] == row[j + l - 1]) {

              l = l - 1;
              if (j + l == 1) {
                break;
              }

            }

            var r = 1;
            while (row[j + r] == row[j + r + 1]) {

              r = r + 1;
              if (j + r == 13) {
                break;
              }

            }

            for (var n = l; n <= r && !success; n = n + 1) {

              this.gameObjects[i][j + n].shrinking = true;

              if (this.gameObjects[i][j + n].scale.x == 0){

                for (var v = l; v <= r; v = v + 1) {
                  this.gameObjects[i][j + v].scale.set(0,0,0);
                  this.gameObjects[i][j + v].shrinking = false;
                }
                success = true;

              }

            }

            if (!this.gameOver && this.startSwap) {

              diff += r - l;
              this.plusScore += diff * 10;
              // this.plusScoreOpacity -= 0.05;

            }

          }

          if (success) {

            this.score += this.plusScore;

          }

        }

      }

    }

}
