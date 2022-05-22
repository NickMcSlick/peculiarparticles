/***** TITLE *****/
// Peculiar Particles
/*****************/

/***** AUTHOR *****/
// Bryce Paubel
/******************/

/***** DESCRIPTION *****/
// A fun look into simple 2D particle systems
// These are all processed serially
/***********************/

/***** WARNING *****/
// THIS PROGRAM CONTAINS FLASHING COLORS
/*******************/

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

alert("WARNING: THIS PROGRAM CONTAINS FLASHING COLORS FOR PARTICLES");

const V_SHADER_SOURCE = `#version 300 es
	in vec2 a_p;		// Position
	in float a_p_s;		// Point size
	
	void main() {
		gl_PointSize = a_p_s;
		gl_Position = vec4(a_p, 0.0, 1.0);
	}
`

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
	
	window.onresize = function() {
		console.log("fired");
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
	
	setCanvasEvents(canvas);
	setRadioButtonEvents(radioButtons, radioShapeButtons);
	setSliderEvents(particleSlider, colorSlider, particles, canvas, rave);
	
	colorSlider.style.backgroundColor = "rgb(0, 255, 255)";
	
	for (let i = 0; i < config.PARTICLES; i++) {		
		particles.push(new Particle(
			Math.log(i + 100000), 
			[0.0, 0.0], 
			[0.0, 0.0], 
			[0.0, 1.0, 1.0, 1.0], 
			(i + 1) / (3 * config.PARTICLES)));
		console.log(particles[i]);
	}

	let update = function() {
		if (rave.checked) {
			colorSlider.value = (Number(colorSlider.value) + 1) % 360;
			colorSlider.dispatchEvent(new Event("input"));
		}
		cancelAnimationFrame(animID);		
		webGL.clearColor(0.0, 0.0, 0.0, 1.0);
		webGL.clear(webGL.COLOR_BUFFER_BIT);
		drawParticles(canvas, webGL, particles);
		particleDisplayPrompt.innerHTML = "Number of Particles: " + config.PARTICLES;
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
	
	gl.vertexAttrib2f(a_p, particle.position[0], particle.position[1]);
	gl.vertexAttrib1f(a_p_s, particle.size);
	gl.uniform4f(u_c, particle.color[0], particle.color[1], particle.color[2], particle.color[3]);
	gl.uniform1f(u_circle, config.CIRCLE);
	gl.drawArrays(gl.POINTS, 0, 1);
}

// Update particle to follow the cursor
function followCursor(canvas, particle) {
	if (config.MOUSE) {
		particle.velocity = [(2 * config.MOUSE[0] / canvas.width) - 1 - particle.position[0], (2 * config.MOUSE[1] / (-canvas.height)) + 1 - particle.position[1]];
		particle.velocity = [particle.velocity[0] * particle.scale, particle.velocity[1] * particle.scale];
		particle.position = [particle.position[0] + particle.velocity[0], particle.position[1] + particle.velocity[1]];
	}
}

// Update particle to follow the cursor in a circular fashion
function followCursorCircle(canvas, particle) {
	if (config.MOUSE) {
		let centerVelo = [(2 * config.MOUSE[0] / canvas.width) - 1 - particle.position[0], (2 * config.MOUSE[1] / (-canvas.height)) + 1 - particle.position[1]];
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];
		
		particle.velocity = [
			centerVelo[0] * particle.scale + perpendicularVelo[0] * particle.scale,
			centerVelo[1] * particle.scale + perpendicularVelo[1] * particle.scale
		];
		
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to orbit
function followCursorSloppyOrbit(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];	
			
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];
		
		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);		
		if (centerMag < 0.2) {
			centerVelo = [0.0, 0.0];
		}
		
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * particle.scale * 0.2 + centerVelo[0] * 0.02,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * particle.scale * 0.2 + centerVelo[1] * 0.02
		];
		
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to orbit sharply
function followCursorSharpOrbit(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];	
			
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);	
		let isOrbiting = false;
		if (centerMag < 0.2 && centerMag > 0.15) {
			centerVelo = [0.0, 0.0];
		} else if (centerMag <= 0.15) {
			centerVelo = [-0.5 * centerVelo[0], -0.5 * centerVelo[1]];
		} else if (centerMag > 0.2 && centerMag < 0.25) {
			centerVelo = [0.1 * centerVelo[0], 0.1 * centerVelo[1]];
		} else {
			centerVelo = [centerVelo[0] * 1.5, centerVelo[1] * 1.5];
		}
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * (particle.scale + 0.1) * 0.2 + centerVelo[0] * 0.02,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * (particle.scale + 0.1) * 0.2 + centerVelo[1] * 0.02
		];
		
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Update particle to circle around the center like a galaxy
function followCursorGalaxy(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];	
			
		let centerVelo = [glMouseCoords[0] - particle.position[0], glMouseCoords[1] - particle.position[1]];
		
		let perpendicularVelo = [-centerVelo[1], centerVelo[0]];

		let centerMag = Math.sqrt(centerVelo[0] ** 2 + centerVelo[1] ** 2);		
	
		perpendicularVelo = [(1 / centerMag) * perpendicularVelo[0], (1 / centerMag) * perpendicularVelo[1]];
		
		particle.velocity = [
			config.MOUSE_MOVEMENT[0] / 1000 + perpendicularVelo[0] * particle.scale * 0.1 + centerVelo[0] / particle.scale * 0.01,
			-config.MOUSE_MOVEMENT[1] / 1000 + perpendicularVelo[1] * particle.scale * 0.1 + centerVelo[1] / particle.scale * 0.01
		];
		
		particle.position = [
			particle.position[0] + particle.velocity[0], 
			particle.position[1] + particle.velocity[1]
		];
	}
}

// Let the particles spray
function followCursorSpray(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		if (distance(0, 0, particle.position[0], particle.position[1]) >  Math.sqrt(2)) {
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}

		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1);
			particle.velocity[1] = 0.01 * Math.random();
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		} else {
			particle.velocity[1] += -0.0002;
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

	}
}

// Follow cursor with a fire-like sharp spray
function followCursorFire(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		if (particle.velocity[1] < 0.001) {
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}

		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1);
			particle.velocity[1] = 0.01 * Math.random();
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		} else {
			particle.velocity[1] += -0.0002;
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

	}
}

// Let the particles spray and bounce
function followCursorBounce(canvas, particle) {
	if (config.MOUSE) {
		let glMouseCoords = [(2 * config.MOUSE[0] / canvas.width) - 1, (2 * config.MOUSE[1] / (-canvas.height)) + 1];

		particle.position[1] = clamp(particle.position[1], -0.95, 2);


		if (particle.position[1] <= -0.95 && Math.abs(particle.velocity[1]) < 0.01) {
			console.log(particle.position[1]);
			particle.position[0] = glMouseCoords[0];
			particle.position[1] = glMouseCoords[1];
		}

		if (0.01 > distance(glMouseCoords[0], glMouseCoords[1], particle.position[0], particle.position[1])) {
			particle.velocity[0] = 0.001 * (Math.random() * 2 - 1);
			particle.velocity[1] = 0.01 * Math.random();
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}  else if (particle.position[1] <= -0.95) {
			particle.velocity[1] = -0.7 * particle.velocity[1];
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		} else {
			particle.velocity[1] += -0.001;
			particle.position[0] += particle.velocity[0];
			particle.position[1] += particle.velocity[1];
		}

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
