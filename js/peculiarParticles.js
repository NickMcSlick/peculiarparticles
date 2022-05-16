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

const V_SHADER_SOURCE = `#version 300 es
	in vec4 a_p;		// Position
	in float a_p_s;		// Point size
	
	void main() {
		gl_Position = a_p;
		gl_PointSize = a_p_s;
	}
`

const F_SHADER_SOURCE = `#version 300 es
	precision highp float;
	out vec4 out_c; // Output color
	
	uniform vec4 u_c;	// Input color
	
	void main() {
		out_c = u_c;
	}
`

// Main program
function main() {
	let canvas = document.getElementById("canvas");
	let webGL = canvas.getContext("webgl2");
	
	initShaders(webGL, V_SHADER_SOURCE, F_SHADER_SOURCE);
	
	let particle = new Particle(1, [0, 0], [0, 0], [, 0, 0, 1]);
	
	drawParticle(webGL, particle);
}

function drawParticle(gl, particle) {
	// Vertex shader pointers
	let a_p = gl.getAttribLocation(gl.program, "a_p");
	let a_p_s = gl.getAttribLocation(gl.program, "a_p_s");
	
	// Fragment shader pointers
	let u_c = gl.getUniformLocation(gl.program, "u_c");
	
	gl.vertexAttrib4f(a_p, particle.position[0], particle.position[1], 0.0, 0.0);
	gl.vertexAttrib1f(a_p_s, particle.size);
	gl.uniform4f(u_c, particle.color[0], particle.color[1], particle.color[2], particle.color[3]);

	followCursor(particle);
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, 1);
}

function followCursor(particle) {
	
}

function Particle(size, position, velocity, color) {
	this.size = size;
	this.position = position;
	this.velocity = velocity;
	this.color = color;
}

