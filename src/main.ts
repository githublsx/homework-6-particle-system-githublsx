import {vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Particles from './Particles';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
};

let square: Square;
let time: number = 0.0;
let simulationTimeStep: number = 1 / 60.0;
let particles: Particles;
let particlenumber: number = 10000.0;

function updatepos(particles: Particles, time: number, timestep: number) {
  let offsetsArray = new Array<number>();
  let colorsArray = new Array<number>();
  particles.update(time, timestep, offsetsArray, colorsArray);
  // let n: number = particles.ps.length;
  // //console.log(particles.numofps);
  // for(let i = 0; i < n; i++) {
  //   offsetsArray.push(particles.ps[i].curpos[0]);
  //   offsetsArray.push(particles.ps[i].curpos[1]);
  //   offsetsArray.push(particles.ps[i].curpos[2]);
  //   //console.log(particles.ps[i].curpos);

  //   colorsArray.push(particles.ps[i].color[0]);
  //   colorsArray.push(particles.ps[i].color[1]);
  //   colorsArray.push(particles.ps[i].color[2]);
  //   colorsArray.push(particles.ps[i].color[3]); 
  // }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(particles.ps.length); // 10x10 grid of "particles"
}

function loadScene() {
  square = new Square();
  square.create();
  particles = new Particles(particlenumber);

  // Set up particles here. Hard-coded example data for now
  //updatepos(particles);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  let coord = Math.pow(particlenumber, 1.0/3.0) / 2.0;
  const camera = new Camera(vec3.fromValues(0, 0, coord * 10.0), vec3.fromValues(coord, coord, coord));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    lambert.setTime(time++);
    updatepos(particles, time, simulationTimeStep);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, lambert, [
      square,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
