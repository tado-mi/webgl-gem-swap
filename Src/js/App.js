class App {

	constructor(canvas, overlay) {

		this.canvas = canvas;
		this.overlay = overlay;

		this.mouse = {

			'Down': new Vec4(),
			'Up':		new Vec4(),
			'Move':	new Vec4(),

			'PressedDown': false,
			'PressedMove': false,
			'PressedUp':	 false

		};

		this.keysPressed = {};

		this.gl = canvas.getContext("experimental-webgl");
		if (this.gl === null) {
			console.log('--- this browser does not support webgl');
		}

		// create a simple scene
		this.scene = new Scene(this.gl);
		this.resize();

		this.gl.pendingResources = {};

	};

	// match WebGL rendering resolution and viewport to the canvas size
	resize() {

		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;

		this.gl.viewport(0, 0, w, h);
		this.scene.camera.setAspectRatio(w / h);

		this.canvas.width  = w;
		this.canvas.height = h;

	};

	// register event handlers
	register() {

		const w = this.canvas.width;
		const h = this.canvas.height;

		// view projection matrix inverse
		const matrix = this.scene.camera.matrix.clone().invert();

		const app = this;

		document.onkeydown = function(event) {

			app.keysPressed[keyboardMap[event.keyCode]] = true;

		};

		document.onkeyup = function(event) {

			app.keysPressed[keyboardMap[event.keyCode]] = false;

		};

		this.canvas.onmousedown = function(event) {

			app.mouse['pressedDown'] = true;
			app.mouse['pressedMove'] = true;

			var x = event.clientX, y = event.clientY;

			x =  2 * (x / w) - 1;
			y = -2 * (y / h) + 1;

			app.mouse['Down'] = new Vec4(x, y).mul(matrix);

		};

		this.canvas.onmousemove = function(event) {

			var x = event.clientX, y = event.clientY;

			x =  2 * (x / w) - 1;
			y = -2 * (y / h) + 1;

			app.mouse['Move'] = new Vec4(x, y).mul(matrix);

			event.stopPropagation();

		};

		this.canvas.onmouseout = function(event) {

		};

		this.canvas.onmouseup = function(event) {

			app.mouse['pressedUp'] = true;
			app.mouse['pressedMove'] = false;

			var x = event.clientX, y = event.clientY;

			x =  2 * (x / w) - 1;
			y = -2 * (y / h) + 1;

			app.mouse['Up'] = new Vec4(x, y).mul(matrix);

		};

		window.addEventListener('resize', function() {

			app.resize();

		});

		window.requestAnimationFrame(function() {

			app.update();

		});

	};

	// animation frame update
	update() {

		const pendingResources = Object.keys(this.gl.pendingResources);
		if (pendingResources.length === 0) {

			// animate and draw scene
			this.scene.update(this.gl, this.keysPressed, this.mouse);

		} else {

			this.overlay.innerHTML = 'Loading: ' + pendingResources;

		}

		// refresh
		const app = this;
		window.requestAnimationFrame(function() {
			app.update();
		});
	};


}

// entry point from HTML
window.addEventListener('load', function() {

	const c = document.getElementById("canvas");
	const o = document.getElementById("overlay");

	const app = new App(c, o);
	app.register();

});
