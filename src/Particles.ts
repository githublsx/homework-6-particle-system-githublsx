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
    interval: number;
    forcecenter: vec3;

    constructor(numofps: number, interval: number = 1.0){
        this.ps = new Array<Particle>();
        this.interval = interval;
        let n = Math.pow(numofps, 1.0/3.0);
        console.log("n="+n);
        let origin = vec3.create();
        let coord = n / 2.0 * interval;
        origin = vec3.fromValues(coord, coord, coord);
        this.forcecenter = origin;
        for(let i = 0; i < n; i++)
        {
            for(let j = 0; j < n; j++)
            {
                for(let k = 0; k < n; k++)
                {
                    let position = vec3.fromValues(i * interval, j * interval, k * interval);
                    //let velocity = vec3.fromValues(Math.random(), Math.random(), Math.random());
                    let velocity = vec3.fromValues((Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
                    let toorigin = vec3.fromValues(coord-i, coord-j, coord-k);
                    vec3.normalize(toorigin, toorigin);
                    //velocity = vec3.cross(velocity, velocity, toorigin);
                    //velocity = vec3.fromValues(0.0, 0.0, 0.0);

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

    palette( t: number, a: vec3, b: vec3, c: vec3, d: vec3)
    {
        let temp = vec3.create();
        vec3.scale(temp, c, t);
        vec3.add(temp, temp, d);
        vec3.scale(temp, temp, 6.28318);
        temp = vec3.fromValues(Math.cos(temp[0]), Math.cos(temp[1]), Math.cos(temp[2]));
        vec3.multiply(temp, temp, b);
        vec3.add(temp, temp, a);
        return temp;
    }

    update(time: number, timestep: number, offsets: number[], colors: number[]){
        // let origin = vec3.create();
        // let coord = Math.pow(this.ps.length, 1.0/3.0) / 2.0 * this.interval;
        // origin = vec3.fromValues(coord, coord, coord);
        for(let i = 0; i < this.ps.length; i++)
        {
            //update force
            let force = vec3.create();
            vec3.subtract(force, this.forcecenter, this.ps[i].curpos);
            let forcevalue = vec3.length(force);
            if(forcevalue!=0)
            {
                if(forcevalue>1.0)
                {
                    forcevalue = 1.0 / forcevalue;
                }
                else
                {
                    forcevalue = 1.0;
                }
            }
            // if(forcevalue>maxforce)
            // {
            //     forcevalue = maxforce;
            // }
            vec3.normalize(force, force);
            vec3.scale(force, force, forcevalue * 50.0 + 10.0);
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


            //arival
            let arrivalvel = vec3.create();
            vec3.subtract(arrivalvel, this.forcecenter, this.ps[i].curpos);
            //wander
            let randomvel = vec3.fromValues((Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
            vec3.normalize(randomvel, randomvel);
            vec3.scale(randomvel, randomvel, 1.0);
            vec3.add(randomvel, this.ps[i].curvel, randomvel);
            vec3.normalize(randomvel, randomvel);
            vec3.scale(randomvel, randomvel, 100.0);


            vec3.add(arrivalvel, randomvel, arrivalvel);
            //seek
            //vec3.normalize(arrivalvel, arrivalvel);
            //vec3.scale(arrivalvel, arrivalvel, 10.0);
            this.ps[i].curvel = arrivalvel;


            //console.log("this.ps[i].curvel" + this.ps[i].curvel);
            //update position
            let velmutitime = vec3.create();
            vec3.scale(velmutitime, this.ps[i].curvel, timestep);
            //console.log("velmutitime" + velmutitime);
            vec3.add(this.ps[i].curpos, this.ps[i].curpos, velmutitime);
           //console.log("this.ps[i].curpos" + this.ps[i].curpos);
           //push position and color
           offsets.push(this.ps[i].curpos[0]);
           offsets.push(this.ps[i].curpos[1]);
           offsets.push(this.ps[i].curpos[2]);
           //console.log(particles.ps[i].curpos);
       
           //use force as color
           //0.5, 0.5, 0.5		0.5, 0.5, 0.5	2.0, 1.0, 0.0	0.50, 0.20, 0.25
           let t = vec3.length(this.ps[i].curvel);
           t = forcevalue;
           let color = this.palette(forcevalue, vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(2.0, 1.0, 1.0), vec3.fromValues(0.50, 0.50, 0.25));
           colors.push(color[0]);
           colors.push(color[1]);
           colors.push(color[2]);
           colors.push(this.ps[i].color[3]); 
        }
    }
}

export default Particles;