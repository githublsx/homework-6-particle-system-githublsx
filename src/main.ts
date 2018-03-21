import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Particles from './Particles';

function readTextFile(file: string): string
{
    var allTest = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allTest = rawFile.responseText;
                return allTest;
            }
        }
    }
    rawFile.send(null);
    return allTest;
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  cameracontrol: false,
  camerarotation: true,
  mesh: 'sphere',
  radius1: 0.01,
  radius2: 1.0,
  palettes: 0,
  reversepalette: false,
  change: true,
};

let square: Square;
let time: number = 0.0;
let simulationTimeStep: number = 1 / 30.0;
let particles: Particles;
let particlenumber: number = 9000.0;
let interval: number = 5.0;
let bunny = readTextFile("./src/mesh/bunny.obj");
let sphere = readTextFile("./src/mesh/sphere.obj");
let dragon = readTextFile("./src/mesh/dragon.obj");
let teapot = readTextFile("./src/mesh/teapot.obj");
let armadillo = readTextFile("./src/mesh/armadillo.obj");
let cube = readTextFile("./src/mesh/cube.obj");
let plane = readTextFile("./src/mesh/plane.obj");
let tyra = readTextFile("./src/mesh/tyra.obj");

function updatepos(particles: Particles, time: number, timestep: number) {
  let offsetsArray = new Array<number>();
  let colorsArray = new Array<number>();
  let strsArray = new Array<number>();
  particles.update(time, timestep, offsetsArray, colorsArray, strsArray);
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
  let strs: Float32Array = new Float32Array(strsArray);
  square.setInstanceVBOs(offsets, colors, strs);
  square.setNumInstances(particles.ps.length); // 10x10 grid of "particles"
}

function loadScene() {
  square = new Square();
  square.create();
  if(controls.mesh=="sphere")
  {
    particles = new Particles(particlenumber, interval, sphere);
  }
  if(controls.mesh=="bunny")
  {
    particles = new Particles(particlenumber, interval, bunny);
  }
  if(controls.mesh=="dragon")
  {
    particles = new Particles(particlenumber, interval, dragon);
  }
  if(controls.mesh=="center")
  {
    particles = new Particles(particlenumber, interval, 'center');
  }
  //particles = new Particles(particlenumber, interval, 'center');
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
  //gui.add(controls, 'Load Scene');
  gui.add(controls, 'change');
  gui.add(controls, 'cameracontrol').listen();
  gui.add(controls, 'camerarotation').listen();
  gui.add(controls, 'mesh', ['null','center','plane','sphere','cube','bunny','dragon', 'teapot', 'armadillo', 'tyra']).listen();
  gui.add(controls, 'radius1', 0, 0.10);
  gui.add(controls, 'radius2', 0, 5.0);
  gui.add(controls, 'palettes', 0, 8).step(1);
  gui.add(controls, 'reversepalette').listen();
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

  let coord = Math.pow(particlenumber, 1.0/3.0) / 2.0 * interval;
  console.log("coord" + coord);
  const camera = new Camera(vec3.fromValues(0.0, 0.0, coord*2.5), vec3.fromValues(0.0, 0.0, 0.0));
  camera.controls.rotateSpeed = 0.0;
  camera.controls.translateSpeed = 0.0;
  camera.controls.zoomSpeed = 0.0;
  // console.log("camerapos" + camera.position);
  // console.log("cameratarget" + camera.target);

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.05, 0.05, 0.05, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  //camera.controls.eye = vec3.fromValues(0.0, 0.0, coord * 1000000.0);
  camera.update();
  console.log("camerapos" + camera.position);
  console.log("cameratarget" + camera.target);
  let lastmesh = controls.mesh;
  let lastmousecontrol = controls.cameracontrol;
  let lastcamerarotation = controls.camerarotation;
  let lasteye = vec3.clone(camera.controls.eye);
  let lastup = vec3.clone(camera.controls.up);
  let lastpalettes = controls.palettes;
  let rotatetime = time;
  let lastreversepalette = controls.reversepalette;
  let changetime = 0;
  let id = 3;
  let meshlist = ['null','center','plane','sphere','cube','bunny','dragon', 'teapot', 'armadillo', 'tyra'];

  // This function will be called every frame
  function tick() {
    if(controls.change)
    {
      changetime++;
      //console.log("changetime" + changetime);
      if(changetime>400)
      {
        id++;
        id = id%meshlist.length;
        controls.mesh = meshlist[id];
        changetime = 0;
      }
    }
    //reverse
    if(lastreversepalette != controls.reversepalette)
    {
      particles.reverse = controls.reversepalette;
      lastreversepalette = controls.reversepalette;
    }
    //palettes
    if(lastpalettes!=controls.palettes)
    {
      particles.palettes = controls.palettes;
      lastpalettes = controls.palettes;
    }
    //camera control
    if(controls.cameracontrol!=lastmousecontrol)
    {
      if(controls.cameracontrol)
      {
        controls.camerarotation = false;
        camera.controls.rotateSpeed = 1.0;
        camera.controls.translateSpeed = 0.0;
        camera.controls.zoomSpeed = 1.0;
        lastmousecontrol = controls.cameracontrol;
        lasteye = vec3.clone(camera.controls.eye);
        lastup = vec3.clone(camera.controls.up);
        rotatetime = 0;
      }
      else
      {
        camera.controls.rotateSpeed = 0.0;
        camera.controls.translateSpeed = 0.0;
        camera.controls.zoomSpeed = 0.0;
        lastmousecontrol = controls.cameracontrol;
        lasteye = vec3.clone(camera.controls.eye);
        lastup = vec3.clone(camera.controls.up);
        rotatetime = 0;
      }
    }
    //rotate camera

    // if(lastcamerarotation!=controls.camerarotation)
    // {//set lasteye
    //   if(!controls.camerarotation)
    //   {
    //     lasteye = vec3.clone(camera.controls.eye);
    //   }
    //   lastcamerarotation = controls.camerarotation;
    // }

    if(controls.camerarotation)
    {
      controls.cameracontrol = false;
      let rotationmat = mat4.create();
      mat4.fromRotation(rotationmat, rotatetime++/100.0, lastup);
      //mat4.fromYRotation(rotationmat, rotatetime++/100.0);
      var eye = vec3.create();
      vec3.transformMat4(eye, lasteye, rotationmat);
      // console.log("lasteye" + lasteye);
      var center = vec3.fromValues(0.0, 0.0, 0.0);
      camera.controls.lookAt(eye, center, lastup);
      camera.update();
      //console.log("rotatetime" + rotatetime);
    }

    // else if(lastcamerarotation!=controls.camerarotation)
    // {
    //   if(!controls.camerarotation)
    //   {
    //     lasteye = vec3.clone(camera.controls.eye);
    //     lastup = vec3.clone(camera.controls.up);
    //   }
    //   else
    //   {
    //     lasteye = vec3.clone(camera.controls.eye);
    //     lastup = vec3.clone(camera.controls.up);
    //   }
    //   lastcamerarotation = controls.camerarotation;
    // }


    if(controls.radius1 * coord!=particles.radius)
    {
      particles.radius = controls.radius1 * coord;
    }
    if(controls.radius2 * coord!=particles.radius2)
    {
      particles.radius2 = controls.radius2 * coord;
    }
    if(controls.cameracontrol)
    {
      camera.update();
      lasteye = vec3.clone(camera.controls.eye);
      lastup = vec3.clone(camera.controls.up);
      rotatetime = 0;
      //console.log("updatelasteye");
    }
    if(lastmesh!=controls.mesh)
    {
      if(controls.mesh=="sphere")
      {
        particles.setobj(sphere);
      }
      else if(controls.mesh=="bunny")
      {
        particles.setobj(bunny);
      }
      else if(controls.mesh=="center")
      {
        particles.setobj(controls.mesh);
      }
      else if(controls.mesh=="dragon")
      {
        particles.setobj(dragon);
      }
      else if(controls.mesh=="teapot")
      {
        particles.setobj(teapot);
      }
      else if(controls.mesh=="armadillo")
      {
        particles.setobj(armadillo);
      }
      else if(controls.mesh=="cube")
      {
        particles.setobj(cube);
      }
      else if(controls.mesh=="plane")
      {
        particles.setobj(plane);
      }
      else if(controls.mesh=="tyra")
      {
        particles.setobj(tyra);
      }
      else if(controls.mesh=="null")
      {
        particles.setobj(null);
      }
      lastmesh = controls.mesh;
    }
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

  function updateforcecenter(x: number, y: number)
  {
    var dist = vec3.create();
    vec3.subtract(dist, camera.target, camera.position);
    var ldist = vec3.length(dist);
    var hdist = Math.tan(camera.fovy / 2.0) * ldist;
    var wdist = hdist / canvas.height * canvas.width;
    var h = vec3.create();
    vec3.scale(h, camera.up, hdist * y);
    var w = vec3.create();
    vec3.scale(w, camera.right, wdist * x);
    var origin = vec3.create();
    vec3.add(origin, h, w);
    vec3.add(origin, origin, camera.target);
    //console.log("origin" + origin);
    particles.forcecenter = origin;
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  // window.addEventListener('mousemove', function(event){
  //   console.log("click");
  //   var rect = canvas.getBoundingClientRect();
  //   var x = event.clientX - rect.left;
  //   var y = event.clientY - rect.top;
  //   x = x / canvas.width * 2 - 1;
  //   y = y / canvas.height * -2 + 1;
  //   updateforcecenter(x, y);
  //   // console.log("position x " + x + " y " + y);
  //   // console.log("WebGL coordinate x " + x + " y " + y);
  //   // console.log("camerapos" + camera.position);
  //   // console.log("cameraforward" + camera.forward);
  //   // console.log("cameratarget" + camera.target);

  // }, false);

var mouseIsDown = false;
canvas.onmousedown = function(event){
  // console.log("onmousedown");
  //console.log("camerapos" + camera.position);
  if(!controls.cameracontrol)
  {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x = x / canvas.width * 2 - 1;
    y = y / canvas.height * -2 + 1;
    updateforcecenter(x, y);
    particles.center = true;
    if(event.button == 0)
    {
      // console.log("left");
      particles.attract = true;
    }
    if(event.button == 2)
    {
      // console.log("right");
      particles.attract = false;
    }
  }
  mouseIsDown = true;
}
canvas.onmouseup = function(event){
  if(mouseIsDown){
    if(!controls.cameracontrol)
    {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      x = x / canvas.width * 2 - 1;
      y = y / canvas.height * -2 + 1;
      updateforcecenter(x, y);
      particles.center = true;
      // if(event.button == 0)
      // {
      //   console.log("left");
      // }
      // if(event.button == 2)
      // {
      //   console.log("right");
      // }
    }
  }
  // console.log("onmouseup");
  particles.center = false;
  mouseIsDown = false;
}

canvas.onmousemove = function(event){
  if(!mouseIsDown) return;
  if(!controls.cameracontrol){
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    x = x / canvas.width * 2 - 1;
    y = y / canvas.height * -2 + 1;
    updateforcecenter(x, y);
    particles.center = true;
    // if(event.button == 0)
    // {
    //   console.log("left");
    // }
    // if(event.button == 2)
    // {
    //   console.log("right");
    // }
  }
  // console.log("onmousemove");
  return false;
}

function mouseClick(e: any){
  // click action
}

  window.addEventListener('touchstart', function(event){
    console.log("touchstart");
  }, false);

  window.addEventListener('touchmove', function(event){
    console.log("touchmove");
  }, false);

  window.addEventListener('touchend', function(event){
    console.log("touchend");
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
