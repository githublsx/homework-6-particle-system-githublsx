# CIS 566 Project 6: Particle System

* Name: Linshen Xiao
* PennKey: Linshen
* Tested on: Windows 10, Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16.0GB, NVIDIA GeForce GTX 970M (Personal computer)

![](img/cover.gif)

## Demo

- [https://githublsx.github.io/homework-6-particle-system-githublsx/](https://githublsx.github.io/homework-6-particle-system-githublsx/);

## Assignment Description

**Goal:** to make physics-based procedural animation of particles and to practice using OpenGL's instanced rendering system.

## Particle collection
I wrote a particles class to support a collection of particles that move over time and interact with various forces in the environment. At minimum, each particle will track position, velocity, and acceleration, and update position value from within `main.ts`'s `tick()` function. There are 9000 particles here.

## Procedural coloration and shaping of particles
The particles' colors are determined in some procedural manner. It's based on the force. The particle coloration scheme is based on IQ's palettes page [here](http://iquilezles.org/www/articles/palettes/palettes.htm) so that the particle collection is coherently colored.

## Interactive forces
User can click on the scene to attract and repel particles from the cursor. I place a 3D point in the scene by add NDC coordinate with the up and right vector on the center point of lookat camera, from which particles can flee or move towards). User can press left button of mouse to attract, and press right button of mouse to repel particles.

There is also a "force fields", A random noise velocity will add to the original velocity of the particles to make them move randomly.

## Mesh surface attraction (20 points)
User have the option of selecting a mesh from a drop-down menu in the GUI and let particles become attracted to points on the surface of the mesh. First, I try just having each vertex on the mesh attract one unique particle in your collection. Then, for extra credit, I generated random points on the surfaces of the mesh faces that will attract rest of the particles. The method is to warping a 2D point with X, Y values in the range [0, 1) to the barycentric coordinates (u, v) of any arbitrary triangle. I used the method [here](https://adamswaab.wordpress.com/2009/12/11/random-point-in-a-triangle-barycentric-coordinates/).

These mesh attractor points are pre-greneated every time user change a mesh.

## Aesthetic
When user try to attract or repel particles from the cursor, Particles will have lots of waves with different color. User can also change the palette of the particles.

### Interactivity

I use dat.GUI to make lots of aspects of the demo an interactive variable, including:

* cameracontrol: Make it true to control the camera. Make it false to attract or repel with your cursor.
* camerarotation: Make it true to rotate the camera.
* mesh: Select different meshes to attract particles.
* radius 1: Adjust the wave of rest of the particles when attracting or repelling.
* radius 2: Adjust the attracting or repelling radius.
* palettes: Change different palettes for colors.
* reversepalette: Reverse the palettes.

### More gifs

![](img/particle3.gif)

![](img/particle4.gif)

## Extra credit

I generated random points on the surfaces of the mesh faces that will attract the particles. The method is to warping a 2D point with X, Y values in the range [0, 1) to the barycentric coordinates (u, v) of any arbitrary triangle. I used the method [here](https://adamswaab.wordpress.com/2009/12/11/random-point-in-a-triangle-barycentric-coordinates/).

## Resources

- [webgl-obj-loader](https://www.npmjs.com/package/webgl-obj-loader)
- [How to read a local text file?](https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file)
- [IQ's palettes](http://iquilezles.org/www/articles/palettes/palettes.htm)
- [Random point in a triangle barycentric coordinates](https://adamswaab.wordpress.com/2009/12/11/random-point-in-a-triangle-barycentric-coordinates/)
