"use strict";

class Scene {

  constructor(gl) {

    // create shaders
    const vs = new Shader(gl, gl.VERTEX_SHADER,   "idle_vs.essl");
    const color = new Shader(gl, gl.FRAGMENT_SHADER, "color_fs.essl");
    const change = new Shader(gl, gl.FRAGMENT_SHADER, "change_fs.essl");

    // create programs
    const colorProgram   = new Program(gl, vs, color);
    const pulsateProgram = new Program(gl, vs, change);

    // create materials
    this.material = {
      'color':    new Material(gl, colorProgram),
      'pulsate':  new Material(gl, pulsateProgram)
    }

    this.material['pulsate'].time.set(this.startTime);
    this.material['pulsate'].changeColor.set(252/255, 153/255, 151/255);

    // generate meshes
    // create geomteries
    const geom = [
      new heartGeometry(gl),
      new starGeometry(gl),
      new squareGeometry(gl),
      new crossGeometry(gl),
      new triangleGeometry(gl),
      new diamondGeometry(gl),
      new sphereGeometry(gl),
      new flowerGeometry(gl)
    ];

    this.mesh = [
      new Mesh(geom[0], this.material['color']),
      new Mesh(geom[1], this.material['color']), // star
      new Mesh(geom[2], this.material['color']),
      new Mesh(geom[3], this.material['color']),
      new Mesh(geom[4], this.material['pulsate']),
      new Mesh(geom[5], this.material['color']), // diamond
      new Mesh(geom[6], this.material['color']),
      new Mesh(geom[7], this.material['pulsate']),
    ]

    this.star_ID = 1;
    this.diamond_ID = 5;
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

  drawScene(dt) {

    for (var i = 2; i < 12; i = i + 1) {

      for(var j = 2; j < 12; j = j + 1) {

        const focus = this.gameObjects[i][j];
        if (focus.scale.x == 0) {
          focus.typeID = -1;
        }

        // determine if the object is falling or not
        focus.isFalling = false;
        for (var k = j-1; k > 1; k = k - 1) {

          if (this.gameObjects[i][k].typeID == -1) {
            // there is an 'empty' slot below
            focus.isFalling = true;
            break;
          }

        }

        if (focus.startShink == true) {
            focus.shrink();
            focus.rotate(50*dt);
        }

        focus.draw(this.camera);
     }

    }

  }

  update(gl, keysPressed, mouse) {

    // clear the screen
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // get time
    const now = new Date().getTime();

    const elapsed = (now - this.beginning) / 500.0;
    this.material['pulsate'].time.set(elapsed);

    const dt = 0.01;

    // animate rotations
    this.rotate(dt);

    this.mouseSwap(dt, mouse, keysPressed);
    this.victories();
    this.shiftDown();

    //draw
    this.drawScene(dt);

  }

  getObject(i, j) {

    const id = Math.floor(Math.random() * this.numObjs);
    const temp = this.mesh[id];

    let gameObject = new GameObject(temp);
    gameObject.typeID = id;
    if (id == this.diamond_ID) {
      gameObject.setRotation(new Vector3D(0, 1, 0));
    }

    if (i < 2 || i > 11 || j < 2 || j > 11)	{
      gameObject.scale.set(0, 0, 0);
      gameObject.typeID = -1;
    }

    return gameObject;

  }

  shiftDown() {

    for (var i = 2; i < 12; i = i + 1) {

      for (var j = 2; j < 12; j = j + 1) {

        const focus = this.gameObjects[i][j];

        if (focus.typeID != -1) {
          continue;
        }

        var index = j + 1;
        while (index < 12 && this.gameObjects[i][index].typeID == -1){
          index = index + 1
        }

        if (index < 12) {

          const curr = this.gameObjects[i][index];

          curr.fall();
          curr.isFalling = true;
          if (curr.position.y <= focus.position.y) {

            this.gameObjects[i][j] = new GameObject(curr.mesh);
            this.gameObjects[i][j].typeID = curr.typeID;
            if (this.gameObjects[i][j].typeID == this.diamond_ID) {
              this.gameObjects[i][j].setRotation(new Vector3D(0, 1, 0));
            }
            curr.typeID = -1;

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

  rotate(dt) {

    for (var i = 0; i < 14; i = i + 1) {

      for (var j = 0; j < 14; j = j + 1) {

        const focus = this.gameObjects[i][j];

        if (focus.typeID == this.diamond_ID || focus.typeID == this.star_ID) {
          focus.rotate(dt);
        }

        focus.position = new Vector3D(i-2, j-2, 0);

      }

    }

  }

  mouseSwap(dt, mouse, keysPressed) {

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
      var row = this.gameObjects[up.x].map(item => item.typeID);
      var vertical = (row[up.y - 1] == row[up.y - 2] || row[up.y - 1] == row[up.y + 1]) && row[up.y - 1] == downObj.typeID;
      vertical = vertical || ( (row[up.y + 1] == row[up.y + 1] || row[up.y + 1] == row[up.y - 1]) && row[up.y + 1] == downObj.typeID );

      // into a column
      var col = this.gameObjects.map(item => item[up.y]);
      col = col.map(item => item.typeID);
      var horizontal = (col[up.x - 1] == col[up.x - 2] || col[up.x - 1] == col[up.x + 1]) && col[up.x - 1] == downObj.typeID;
      horizontal = horizontal || ( (col[up.x + 1] == col[up.x + 1] || col[up.x + 1] == col[up.x - 1]) && col[up.x + 1] == downObj.typeID );

      // 2. consider insert upObj in the position of downObj
      // into the row
      row = this.gameObjects[down.x].map(item => item.typeID);
      vertical = vertical || ( (row[down.y - 1] == row[down.y - 2] || row[down.y - 1] == row[down.y + 1]) && row[down.y - 1] == upObj.typeID );
      vertical = vertical || ( (row[down.y + 1] == row[down.y + 1] || row[down.y + 1] == row[down.y - 1]) && row[down.y + 1] == upObj.typeID );

      // into a column
      var col =  this.gameObjects.map(item => item[down.y]);
      col = col.map(item => item.typeID);
      horizontal = horizontal || ( (col[down.x - 1] == col[down.x - 2] || col[down.x - 1] == col[down.x + 1]) && col[down.x - 1] == upObj.typeID );
      horizontal = horizontal || ( (col[down.x + 1] == col[down.x + 1] || col[down.x + 1] == col[down.x - 1]) && col[down.x + 1] == upObj.typeID );

      if (vertical || horizontal) { // swap

        this.gameObjects[up.x][up.y] = new GameObject(downObj.mesh);
        this.gameObjects[up.x][up.y].typeID = downObj.typeID;

        this.gameObjects[down.x][down.y] = new GameObject(upObj.mesh);
        this.gameObjects[down.x][down.y].typeID = upObj.typeID;

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
          if (focus.typeID == -1 || focus.isFalling) {
            continue;
          }

          var diff = 0;

          var col =  this.gameObjects.map(item => item[j]);
          const horizontal = !col[i - 1].isFalling && !col[i + 1].isFalling &&
          focus.typeID == col[i - 1].typeID && focus.typeID == col[i + 1].typeID;

          if (horizontal) {

            col = col.map(item => item.typeID);

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

              this.gameObjects[i + m][j].startShink = true;

              if (this.gameObjects[i + m][j].scale.x == 0) {

                for (var h = l; h <= r; h = h + 1) {
                  this.gameObjects[i + h][j].scale.set(0,0,0);
                  this.gameObjects[i + h][j].startShink = false;
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
          focus.typeID == row[j - 1].typeID && focus.typeID == row[j + 1].typeID;

          if (vertical) {

            row = row.map(item => item.typeID);

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

              this.gameObjects[i][j + n].startShink = true;

              if (this.gameObjects[i][j + n].scale.x == 0){

                for (var v = l; v <= r; v = v + 1) {
                  this.gameObjects[i][j + v].scale.set(0,0,0);
                  this.gameObjects[i][j + v].startShink = false;
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
