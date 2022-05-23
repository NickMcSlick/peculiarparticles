/***** TITLE *****/
// Peculiar Particles
/*****************/

/***** WARNING *****/
// THIS PROGRAM CONTAINS FLASHING COLORS
/*******************/

alert("WARNING: THIS PROGRAM CONTAINS FLASHING COLORS FOR PARTICLES");

/***** AUTHOR *****/
// Bryce Paubel
/******************/

/***** DESCRIPTION *****/
// A fun look into simple 2D particle systems
// These are all processed serially
/***********************/

/***** COPYRIGHT *****/
// Copyright 2022 Bryce Paubel
/*********************/

/***** LICENSING *****/
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
/*********************/

// Vertex shader
const V_SHADER_SOURCE = `#version 300 es
	in vec2 a_p;		// Position
	in float a_p_s;		// Point size
	
	void main() {
		gl_PointSize = a_p_s;
		gl_Position = vec4(a_p, 0.0, 1.0);
	}
`

// Fragment shader
const F_SHADER_SOURCE = `#version 300 es
	precision highp float;
	out vec4 out_c; // Output color
	
	uniform vec4 u_c;		// Input color
	uniform bool u_circle;	// Draw a circle
	
	void main() {
		if (u_circle) {
			if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard; 
		}
		out_c = u_c;
	}
`

// Configuration object
let config = {
	MOUSE: null,
	MOUSE_MOVEMENT: [],
	SELECTION: 0,
	PARTICLES: 50,
	COLOR: 180,
	CIRCLE: false,
}

// Main program
function main() {
	// Animation ID
	let animID = 1;
	
	// Particle array
	let particles = [];
	
	// Initialize canvas
	let canvas = document.getElementById("canvas");
	canvas.margin = 0;
	canvas.width = 1.0 * window.innerWidth;
	canvas.height = 1.01 * window.innerHeight;
	
	// Get rendering context and initialize shaders
	let webGL = canvas.getContext("webgl2");
	initShaders(webGL, V_SHADER_SOURCE, F_SHADER_SOURCE);

	// Resize the canvas if the window changes
	window.onresize = function() {
		canvas.width = 1.0 * window.innerWidth;
		canvas.height = 1.01 * window.innerHeight;
		webGL.viewport(0, 0, canvas.width, canvas.height);
	}
	
	// Get radio buttons
	let radioButtons = document.getElementsByName("selection");
	let radioShapeButtons = document.getElementsByName("shape");

	// Get rave button
	let rave = document.getElementById("rave");
	rave.checked = false;
	
	// Get sliders
	let particleSlider = document.getElementById("particleNum");
	let colorSlider = document.getElementById("color");
	
	// Get the particle number display prompt
	let particleDisplayPrompt = document.getElementById("particleNumDisplay");

	// Set events
	setCanvasEvents(canvas);
	setRadioButtonEvents(radioButtons, radioShapeButtons);
	setSliderEvents(particleSlider, colorSlider, particles, canvas, rave);

	// Set default color
	colorSlider.style.backgroundColor = "rgb(0, 255, 255)";

	// Generate initial particles
	for (let i = 0; i < config.PARTICLES; i++) {
		// Seed the size, position, velocity, color, and scale
		// Scale is used to determine the scaling factors of velocity, color, etc. in some functions
		particles.push(new Particle(
			Math.log(i + 100000),
			[0.0, 0.0], 
			[0.0, 0.0], 
			[0.0, 1.0, 1.0, 1.0], 
			(i + 1) / (3 * config.PARTICLES)));
		console.log(particles[i]);
	}

	// Update function for animation frames
	let update = function() {
		// If rave checked, set the new slider value and fire its events
		if (rave.checked && config.MOUSE) {
			colorSlider.value = (Number(colorSlider.value) + 1) % 360;
			colorSlider.dispatchEvent(new Event("input"));
		}

		// Cancel previous frame
		cancelAnimationFrame(animID);

		// Clear the canvas
		webGL.clearColor(0.0, 0.0, 0.0, 1.0);
		webGL.clear(webGL.COLOR_BUFFER_BIT);

		// Draw the particles
		drawParticles(canvas, webGL, particles);

		// Update the number of particles
		particleDisplayPrompt.innerHTML = "Number of Particles: " + config.PARTICLES;

		// Request a new frame
		animID = requestAnimationFrame(update);
	}
	
	update();
}

// Draw a particle array
function drawParticles(canvas, webGL, particleArray) {
	for (let i = 0; i < particleArray.length; i++) {
		updateParticle(canvas, config.SELECTION, particleArray[i]);
		drawParticle(webGL, particleArray[i]);
	}
}

// Update a particle
function updateParticle(canvas, selection, particle) {
	switch (selection) {
		case 0: 
			followCursor(canvas, particle);
			break;
		case 1:
			followCursorCircle(canvas, particle);
			break;
		case 2:
			followCursorSloppyOrbit(canvas, particle);
			break;
		case 3:
			followCursorSharpOrbit(canvas, particle);
			break;
		case 4:
			followCursorGalaxy(canvas, particle);
			break;
		case 5:
			followCursorSpray(canvas, particle);
			break;
		case 6:
			followCursorFire(canvas, particle);
			break;
		case 7:
			followCursorBounce(canvas, particle);
			break;
	}
}

// Set the canvas events to update the mouse position
function setCanvasEvents(canvas) {
	window.onmousemove = function(e) {
		config.MOUSE = [e.clientX, e.clientY];
		config.MOUSE_MOVEMENT = [e.movementX, e.movementY];
	}
	
	canvas.onmouseout = function() {
		config.MOUSE = null;
	}
}

// Set the radio button events
function setRadioButtonEvents(radioButtons, radioShapeButtons) {
	for (let i = 0; i < radioButtons.length; i++) {
		if (radioButtons[i].checked) {
			config.SELECTION = parseInt(radioButtons[i].value);
		}
		radioButtons[i].onclick = function() {
			config.SELECTION = parseInt(radioButtons[i].value);
		}
	}
	
	for (let i = 0; i < radioShapeButtons.length; i++) {
		if (radioShapeButtons[i].checked) {
			config.CIRCLE = parseInt(radioShapeButtons[i].value) === 1;
		}
		radioShapeButtons[i].onclick = function() {
			config.CIRCLE = parseInt(radioShapeButtons[i].value) === 1;
		}
	}
}

// Set the slider events
function setSliderEvents(numSlider, colorSlider, particleArray, canvas) {
	numSlider.oninput = function() {
		config.PARTICLES = Math.ceil(numSlider.value);
		particleArray.length = 0;
		for (let i = 0; i < numSlider.value; i++) {
			particleArray.push(new Particle(
				Math.log(i + 100000),
				[(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1],
				[0.0, 0.0], 
				[(i + 1) / (config.PARTICLES + 1) * 0.8 + 0.2, 0.0, 0.0, 1.0], 
				(i + 1) / (3 * config.PARTICLES)));
		}
		
		config.COLOR = colorSlider.value;

		let color = hsvToRgb(config.COLOR / 360, 1.0, 1.0);
		
		for (let i = 0; i < config.PARTICLES; i++) {
			particleArray[i].color = [
				1 / particleArray[i].scale * color[0], 
				1 / particleArray[i].scale * color[1],
				1 / particleArray[i].scale * color[2],
				1.0
			];
		}
			
		colorSlider.style.backgroundColor = "rgb("
											+ (particleArray[particleArray.length - 1].color[0] * 255.0) + ","
											+ (particleArray[particleArray.length - 1].color[1] * 255.0) + ","
											+ (particleArray[particleArray.length - 1].color[2] * 255.0) + ")";
	}
	
	colorSlider.oninput = function() {
		config.COLOR = colorSlider.value;
		let color = hsvToRgb(config.COLOR / 360, 1.0, 1.0);
		
		for (let i = 0; i < config.PARTICLES; i++) {
			particleArray[i].color = [
				1 / particleArray[i].scale * color[0], 
				1 / particleArray[i].scale * color[1],
				1 / particleArray[i].scale * color[2],
				1.0
			];
		}
			
		colorSlider.style.backgroundColor = "rgb("
											+ (particleArray[particleArray.length - 1].color[0] * 255.0) + ","
											+ (particleArray[particleArray.length - 1].color[1] * 255.0) + ","
											+ (particleArray[particleArray.length - 1].color[2] * 255.0) + ")";
	}
}

// Draw a singular particle
function drawParticle(gl, particle) {
	// Vertex shader pointers
	let a_p = gl.getAttribLocation(gl.program, "a_p");
	let a_p_s = gl.getAttribLocation(gl.program, "a_p_s");
	
	// Fragment shader pointers
	let u_c = gl.getUniformLocation(gl.program, "u_c");
	let u_circle = gl.getUniformLocation(gl.program, "u_circle");

	// Set values
	gl.vertexAttrib2f(a_p, particle.position[0], particle.position[1]);
	gl.vertexAttrib1f(a_p_s, particle.size);
	gl.uniform4f(u_c, particle.color[0], particle.color[1], particle.color[2], particle.color[3]);
	gl.uniform1f(u_circle, config.CIRCLE);
	gl.drawArrays(gl.POINTS, 0, 1);
}

// Update particle to follow the cursor
function followCursor(canvas, particle) {
	if (config.MOUSE) {
		// The particle's velocity is set to always point towards the cursor
		// which is then scaled by the particle scaling factor
		particle.velocity = [(2 * config.MOUSE[0] / canvas.width) - 1 - particle.position[0], (2 * config.MOUSE[1] / (-canvas.height)) + 1 - particle.position[1]];
		particle.velocity = [particle.velocity[0] * particle.scale, particle.velocity[1] * particle.scale];

		// Add the velocity to the position
		particle.position = [particle.position[0] + particle.velocity[0], particle.position[1] + particle.velocity[1]];
	}
}

// Update particle to follow the cursor in a circular fashion
function followCursorCircle(canvas, particle) {
	if (config.MOUSE) {

		// Get the velo towards the center (the cursor) and the velo perpendicular to that
		let centerVelo = [(2 * config.MOUSE[0] / canvas.width) - 1 - particle.position[0], (2 * config.MOUSE[1] / (-canvas.height)) + 1 - particle.position[1]];
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		// Make the velocity point towards both the cursor while also
		// going perpendicular to its current position - this causes the
		// particles to move towards the cursor in circular/spiral fashion
		particle.velocity = [
			centerVelo[0] * particle.scale + perpendicularVelo[0] * particle.scale,
			centerVelo[1] * particle.scale + perpendicularVelo[1] * particle.scale
		];

		// Update the position
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to orbit
function followCursorSloppyOrbit(canvas, particle) {
	if (config.MOUSE) {
		// Get mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		// Find center and perpendicular velocity (center is cursor)
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		// Find the magnitude towards the center
		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);

		// If this magnitude is small, stop going towards the center
		if (centerMag < 0.2) {
			centerVelo = [0.0, 0.0];
		}

		// MOUSE_MOVEMENT is added so that the particle will follow the mouse deltas
		// instead of directly just the cursor position. That way some shape is retained when the cursor moves
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * particle.scale * 0.2 + centerVelo[0] * 0.02,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * particle.scale * 0.2 + centerVelo[1] * 0.02
		];

		// Add velocity to position
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to orbit sharply
function followCursorSharpOrbit(canvas, particle) {
	if (config.MOUSE) {
		// Get mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];	
			
		// Get center velo and the velo perpendicular to that (center is cursor)
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		// Find the magnitude of the center velo
		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);	

		// If the particle enters this range, do not move towards the center
		if (centerMag < 0.2 && centerMag > 0.15) {
			centerVelo = [0.0, 0.0];
		// If the particle is too close, move outwards
		} else if (centerMag <= 0.15) {
			centerVelo = [-0.5 * centerVelo[0], -0.5 * centerVelo[1]];
		// If the particle is nearing the center, slow down	
		} else if (centerMag > 0.2 && centerMag < 0.25) {
			centerVelo = [0.1 * centerVelo[0], 0.1 * centerVelo[1]];
		// If the particle is very far away, move towards the center quickly	
		} else {
			centerVelo = [centerVelo[0] * 1.5, centerVelo[1] * 1.5];
		}

		// MOUSE_MOVEMENT is added so that the particle will follow the mouse deltas
		// instead of directly just the cursor position. That way some shape is retained when the cursor moves
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * (particle.scale + 0.1) * 0.2 + centerVelo[0] * 0.02,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * (particle.scale + 0.1) * 0.2 + centerVelo[1] * 0.02
		];
		
		// Add velocity to the position
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to circle around the center like a galaxy
function followCursorGalaxy(canvas, particle) {
	if (config.MOUSE) {
		// Get the mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];	
			
		// Get center velo and the velo perpendicular to that (center is cursor)
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		// Find the magnitude of the center velocity
		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);

		// If the center magnitude is zero, make it 0.001 so we don't divide by zero later
		if (centerMag === 0) {
			centerMag = 0.001;
		}
	
		// Make the perpendicular velo inversely proportional to the distance from the center
		perpendicularVelo = [(1 / centerMag) * perpendicularVelo[0], (1 / centerMag) * perpendicularVelo[1]];
		
		// MOUSE_MOVEMENT is added so that the particle will follow the mouse deltas
		// instead of directly just the cursor position. That way some shape is retained when the cursor moves
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * particle.scale * 0.1 + centerVelo[0] / particle.scale * 0.001,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * particle.scale * 0.1 + centerVelo[1] / particle.scale * 0.001
		];
		
		// Add the velocity to the position
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Let the particles spray
function followCursorSpray(canvas, particle) {
	if (config.MOUSE) {
		// Get the mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		// If the particle moves offscreen, go back to the mouse
		if (distance(0, 0, particle.position[0], particle.position[1]) >  Math.sqrt(2)) {
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}

		// If the particle is close to the mouse (i.e., it has been initialized or sent back to the mouse position)
		// Then seed it with a new initial velocity that will send it up and outwards
		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			// Seed the initial velocity to go in any upward direction
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1); // [-0.001, 0.001)
			particle.velocity[1] = 0.01 * Math.random();			// [0, 0.1)

			// Add the velocity to the position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];

		// Otherwise, go downwards
		} else {
			// Add a negative value, i.e., gravity, to the velocity
			particle.velocity[1] += -0.0002;
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

	}
}

// Follow cursor with a fire-like sharp spray
function followCursorFire(canvas, particle) {
	if (config.MOUSE) {
		// Get the mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		// If the particle is nearing the peak of its parabola trajectory, send it back to the mouse
		if (particle.velocity[1] < 0.001) {
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}

		// If the particle is near the mouse, i.e. it has been initialized or sent back to the mouse, then
		// seed it with a new initial upward velocity
		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			// New random upward velocity
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1); // [-0.001, 0.001)
			particle.velocity[1] = 0.01 * Math.random();			// [-0.01, 0.01)

			// Add velocity to the position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];

		// Otherwise, go downwards	
		} else {
			// Add a negative value, i.e., gravity, to the velocity
			particle.velocity[1] += -0.0002;

			// Add velocity to position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

	}
}

// Let the particles spray and bounce
function followCursorBounce(canvas, particle) {
	if (config.MOUSE) {
		// Get the mouse position in GL coordinates
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		// If the particle is on the floor and it has a low velocity, meaning it isn't bouncing much,
		// send it back to the mouse and re-seed it with a velocity
		if (particle.position[1] <= -0.95 && Math.abs(particle.velocity[1]) < 0.01) {
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}
		
		// If the particle is near the mouse, i.e. it has been initialized or sent back to the mouse, then
		// seed it with a new initial upward velocity 
		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			// New random upward velocity
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1); // [-0.001, 0.001)
			particle.velocity[1] = 0.01 * Math.random();			// [-0.01, 0.01)

			// Add velocity to position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		
		// If the particle is on the floor, make it bounce	
		}  else if (particle.position[1] <= -0.95) {
			// Negate the y-component of velocity and scale it down relative to the particle
			// This makes sure that the particle always has a bounce smaller than its previous bounce
			particle.velocity[1] = -(particle.scale + 0.5) * particle.velocity[1];

			// Add velocity to position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];

		// Otherwise, go downwards	
		} else {
			// Add a negative value, i.e., gravity, to the velocity
			particle.velocity[1] += -0.001;

			// Add velocity to position
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

		// Clamp the y-value so that a particle's position doesn't 'go through the floor'
		particle.position[1] = clamp(particle.position[1], -0.95, 2);
	}
}

// Particle constructor
function Particle(size, position, velocity, color, scale) {
	this.size = size;
	this.position = position;
	this.velocity = velocity;
	this.color = color;
	this.scale = scale;
}

// Quick distance check
function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) ** 2  + (y1 - y2) ** 2);
}

// Clamp function, same as GLSL
function clamp(value, min, max) {
	if (value <= min) {
		return min;
	} else if (value >= max) {
		return max;
	} else {
		return value;
	}
}


// HSV to RGB color conversion
// Based off of this code: https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 1].
 */
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r, g, b];
}
