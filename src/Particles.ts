import {vec3, vec4} from 'gl-matrix';

class Particle{
    curvel: vec3;
    orivel: vec3;
    curpos: vec3;
    oripos: vec3;
    color: vec4;
    force: vec3;
    mass: number;

    constructor(velocity: vec3 = vec3.fromValues(0.0, 0.0, 0.0), position: vec3 = vec3.fromValues(0.0, 0.0, 0.0), color: vec4 = vec4.fromValues(0.0, 0.0, 0.0, 0.0), 
                force: vec3 = vec3.fromValues(0.0, 0.0, 0.0), mass: number = 1.0) {
        this.curvel = velocity;
        this.orivel = velocity;
        this.curpos = position;
        this.oripos = position;
        this.color = color;
        this.force = force;
        this.mass = mass;
    }
}

class Particles{
    ps: Particle[];
    numofps: number;

    constructor(numofps: number){
        this.ps = new Array<Particle>();
        let n = Math.pow(numofps, 1.0/3.0);
        console.log("n="+n);
        for(let i = 0; i < n; i++)
        {
            for(let j = 0; j < n; j++)
            {
                for(let k = 0; k < n; k++)
                {
                    let velocity = vec3.fromValues(0.0, 0.0, 0.0);
                    let position = vec3.fromValues(i, j, k);
                    let color = vec4.fromValues(i/n, j/n, k/n, 1.0);
                    let force = vec3.fromValues(0.0, 0.0, 0.0);
                    let mass = 1.0;
                    let particle = new Particle(velocity, position, color, force, mass);
                    this.ps.push(particle);
                }
            }
        }
        this.numofps = n * n * n;
    }

    update(time: number, timestep: number){
        let origin = vec3.create();
        let coord = Math.pow(this.ps.length, 1.0/3.0) / 2.0;
        origin = vec3.fromValues(coord, coord, coord);
        for(let i = 0; i < this.ps.length; i++)
        {
            //update force
            let force = vec3.create();
            vec3.subtract(force, origin, this.ps[i].curpos);
            let forcevalue = vec3.length(force);
            if(forcevalue!=0)
            {
                forcevalue = 1.0 / forcevalue;
            }
            if(forcevalue>5.0)
            {
                forcevalue = 5.0;
            }
            vec3.normalize(force, force);
            vec3.scale(force, force, forcevalue);
            this.ps[i].force = force;//vec3.fromValues(0.0, 0.0, Math.sin(time) * 10.0);
            //console.log("this.ps[i].force" + this.ps[i].force);
            //update acceleration
            let acceleration = vec3.create();
            vec3.scale(acceleration, this.ps[i].force, 1 / this.ps[i].mass);
            //console.log("acceleration" + acceleration);
            //update velocity
            let accelmutitime = vec3.create();
            vec3.scale(accelmutitime, acceleration, timestep);
            vec3.add(this.ps[i].curvel, this.ps[i].curvel, accelmutitime);
            //console.log("this.ps[i].curvel" + this.ps[i].curvel);
            //update position
            let velmutitime = vec3.create();
            vec3.scale(velmutitime, this.ps[i].curvel, timestep);
            //console.log("velmutitime" + velmutitime);
            vec3.add(this.ps[i].curpos, this.ps[i].curpos, velmutitime);
           //console.log("this.ps[i].curpos" + this.ps[i].curpos);
        }
    }
}

export default Particles;