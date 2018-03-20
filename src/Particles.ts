import {vec3, vec4} from 'gl-matrix';
import * as OBJLOADER from 'webgl-obj-loader';

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
    center: boolean;
    mesh: any;
    coord: number;
    maxforce: number;
    indices: number[];
    radius: number;
    radius2: number;

    constructor(numofps: number, interval: number = 1.0, objstring: string = null, radius: number = 0.01, radius2: number = 25.0){
        this.ps = new Array<Particle>();
        this.interval = interval;
        this.center = false;
        this.maxforce = 1.0;
        

        let n = Math.pow(numofps, 1.0/3.0);
        console.log("n="+n);
        let origin = vec3.create();
        let coord = n / 2.0 * interval;
        this.coord = coord;
        this.radius = radius * coord;
        this.radius2 = radius2;
        origin = vec3.fromValues(coord, coord, coord);
        this.forcecenter = vec3.fromValues(0.0, 0.0, 0.0);
        for(let i = 0; i < n; i++)
        {
            for(let j = 0; j < n; j++)
            {
                for(let k = 0; k < n; k++)
                {
                    let position = vec3.fromValues(i * interval - coord, j * interval - coord, k * interval - coord);
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
        
        this.setobj(objstring);
    }

    setobj(objstring: string = null)
    {
        if(objstring=='center')
        {
            this.mesh = 'center';
        }
        else if(objstring!=null)
        {
            this.mesh = new OBJLOADER.Mesh(objstring);
            let verticeslength = this.mesh.vertices.length/3.0;
            let indiceslength = this.mesh.indices.length/3.0;
            this.indices = new Array<number>();
            for(let i = 0;  i < this.ps.length;  i++)
            {
                if(i>=verticeslength)
                {
                    this.indices.push(Math.floor(Math.random() * indiceslength));
                    let r = Math.random();
                    let s = Math.random();
                    if(r+s>=1)
                    {
                        r = 1 - r;
                        s = 1 - s;
                    }
                    this.indices.push(r);
                    this.indices.push(s);
                }
            }
        }
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

    update(time: number, timestep: number, offsets: number[], colors: number[], strs: number[]){
        // let origin = vec3.create();
        // let coord = Math.pow(this.ps.length, 1.0/3.0) / 2.0 * this.interval;
        // origin = vec3.fromValues(coord, coord, coord);

        //decide how many particles a vertices
        let verticeslength = 0;
        let indiceslength = 0;
        if(this.mesh!=null && this.mesh!='center')
        {
            verticeslength = this.mesh.vertices.length/3.0;
            indiceslength = this.mesh.indices.length/3.0;
            //console.log("indiceslength" + indiceslength);
        }
        //let numpervert = Math.floor(this.ps.length / verticeslength);
        //console.log("numpervert" + numpervert);
        for(let i = 0; i < this.ps.length; i++)
        {

            //decide a force center
            let forcecenter = vec3.fromValues(0.0, 0.0, 0.0);
            if(this.mesh!=null && this.mesh!='center')
            {
                //let index = i%verticeslength;
                //forcecenter = vec3.fromValues(this.mesh.vertices[index * 3] * this.coord, this.mesh.vertices[index * 3+1] * this.coord, this.mesh.vertices[index * 3+2]* this.coord);
                if(i<verticeslength)
                {
                    forcecenter = vec3.fromValues(this.mesh.vertices[i * 3] * this.coord, this.mesh.vertices[i * 3+1] * this.coord, this.mesh.vertices[i * 3+2]* this.coord);
                }
                //https://adamswaab.wordpress.com/2009/12/11/random-point-in-a-triangle-barycentric-coordinates/
                else
                {
                    let j = (i - verticeslength)*3;
                    let randomindex = this.indices[j];
                    let r = this.indices[j+1];
                    let s = this.indices[j+2];
                    let index1 = this.mesh.indices[randomindex * 3];
                    let index2 = this.mesh.indices[randomindex * 3 + 1];
                    let index3 = this.mesh.indices[randomindex * 3 + 2];
                    let A = vec3.fromValues(this.mesh.vertices[index1 * 3] * this.coord, 
                                            this.mesh.vertices[index1 * 3+1] * this.coord, 
                                            this.mesh.vertices[index1 * 3+2] * this.coord);
                    let AB = vec3.fromValues(this.mesh.vertices[index2 * 3] * this.coord - this.mesh.vertices[index1 * 3] * this.coord, 
                                             this.mesh.vertices[index2 * 3+1] * this.coord - this.mesh.vertices[index1 * 3+1] * this.coord, 
                                             this.mesh.vertices[index2 * 3+2] * this.coord - this.mesh.vertices[index1 * 3+2] * this.coord);
                    let AC = vec3.fromValues(this.mesh.vertices[index3 * 3] * this.coord - this.mesh.vertices[index1 * 3] * this.coord, 
                                             this.mesh.vertices[index3 * 3+1] * this.coord - this.mesh.vertices[index1 * 3+1] * this.coord, 
                                             this.mesh.vertices[index3 * 3+2] * this.coord - this.mesh.vertices[index1 * 3+2] * this.coord);
                    vec3.scale(AB, AB, r);
                    vec3.scale(AC, AC, s);
                    vec3.add(forcecenter, A, AB);
                    vec3.add(forcecenter, forcecenter, AC);
                }
                
            }

            //update force
            let forcevalue = 0.0;
            let force = vec3.create();
            vec3.subtract(force, forcecenter, this.ps[i].curpos);
            forcevalue = vec3.length(force);
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
            if(forcevalue>this.maxforce)
            {
                forcevalue = this.maxforce;
            }
            vec3.normalize(force, force);
            vec3.scale(force, force, forcevalue * 25.0);


            //ifmouseattraction
            let force2 = vec3.fromValues(0.0, 0.0, 0.0);
            let forcevalue2 = 0.0;
            if(this.center==true)
            {
                
                vec3.subtract(force2, this.forcecenter, this.ps[i].curpos);
                forcevalue2 = vec3.length(force2);
                if(forcevalue2!=0)
                {
                    if(forcevalue2>1.0)
                    {
                        forcevalue2 = 1.0 / forcevalue2;
                    }
                    else
                    {
                        forcevalue2 = 1.0;
                    }
                }
                if(forcevalue2>this.maxforce)
                {
                    forcevalue2 = this.maxforce;
                }
                vec3.normalize(force2, force2);
                vec3.scale(force2, force2, forcevalue2 * 25.0);
            }

            vec3.add(force, force, force2);
            this.ps[i].force = force;//vec3.fromValues(0.0, 0.0, Math.sin(time) * 10.0);
            // if(this.center==true)
            // {
            //     this.ps[i].force = force2;
            // }
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
            if(this.mesh!='center')
            {
                let arrivalvel = vec3.create();
                vec3.subtract(arrivalvel, forcecenter, this.ps[i].curpos);
                if(this.center==true)
                {
                    let dist = vec3.length(arrivalvel);
                    if(dist<this.radius)
                    {
                        forcecenter = this.forcecenter;
                    }
                    arrivalvel = vec3.create();
                    vec3.subtract(arrivalvel, forcecenter, this.ps[i].curpos);
                    vec3.scale(arrivalvel, arrivalvel, 1.5);

                    // let randomvel = vec3.fromValues((Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
                    // vec3.normalize(randomvel, randomvel);
                    // vec3.scale(randomvel, randomvel, 1.0);
                    // vec3.add(randomvel, this.ps[i].curvel, randomvel);
                    // vec3.normalize(randomvel, randomvel);
                    // vec3.scale(randomvel, randomvel, Math.max(vec3.length(arrivalvel) / 1.5, 1.0));
                    // vec3.add(arrivalvel, randomvel, arrivalvel);

                    this.ps[i].curvel = arrivalvel;
                }
                else
                {
                    vec3.scale(arrivalvel, arrivalvel, 0.05);
                    //wander
                    let randomvel = vec3.fromValues((Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
                    vec3.normalize(randomvel, randomvel);
                    vec3.scale(randomvel, randomvel, 1.0);
                    vec3.add(randomvel, this.ps[i].curvel, randomvel);
                    vec3.normalize(randomvel, randomvel);
                    vec3.scale(randomvel, randomvel, Math.max(vec3.length(arrivalvel) / 0.05, 3.0));
                    vec3.add(arrivalvel, randomvel, arrivalvel);
                    this.ps[i].curvel = arrivalvel;
                }
            }

            //u
            if(this.center==true)
            {
                let force3 = vec3.create();
                vec3.subtract(force3, this.forcecenter, this.ps[i].curpos);
                //vec3.subtract(force3, this.ps[i].curpos, this.forcecenter);
                let dist = vec3.length(force3);
                if(dist<this.radius * this.radius2)
                {
                    vec3.normalize(force3, force3);
                    if(dist!=0)
                    {
                        // if(dist>1)
                        // {
                            dist = 1 / dist;
                        // }
                        // else
                        // {
                        //     dist = 1.0;
                        // }
                        
                    }
                    vec3.scale(force3, force3, dist * 10000.0);
                    //update acceleration
                    let acceleration = vec3.create();
                    vec3.scale(acceleration, force3, 1 / this.ps[i].mass);
                    //console.log("acceleration" + acceleration);
                    //update velocity
                    let accelmutitime = vec3.create();
                    vec3.scale(accelmutitime, acceleration, timestep);
                    vec3.add(this.ps[i].curvel, this.ps[i].curvel, accelmutitime);

                    let randomvel = vec3.fromValues((Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0, (Math.random()-0.5)*2.0);
                    vec3.normalize(randomvel, randomvel);
                    vec3.scale(randomvel, randomvel, 1.0);
                    vec3.add(randomvel, this.ps[i].curvel, randomvel);
                    vec3.normalize(randomvel, randomvel);
                    vec3.scale(randomvel, randomvel, Math.max(vec3.length(this.ps[i].curvel), 10.0));
                    vec3.add(this.ps[i].curvel, randomvel, this.ps[i].curvel);
                }
            }

            //update position
            let velmutitime = vec3.create();
            vec3.scale(velmutitime, this.ps[i].curvel, timestep);
            vec3.add(this.ps[i].curpos, this.ps[i].curpos, velmutitime);

           //push position and color
           offsets.push(this.ps[i].curpos[0]);
           offsets.push(this.ps[i].curpos[1]);
           offsets.push(this.ps[i].curpos[2]);
       
           //use force as color
           //0.5, 0.5, 0.5		0.5, 0.5, 0.5	2.0, 1.0, 0.0	0.50, 0.20, 0.25
           let t = vec3.length(this.ps[i].curvel);
           t = (forcevalue + forcevalue2) * 5.0;
           let color = this.palette(Math.sin(t), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(2.0, 1.0, 1.0), vec3.fromValues(0.50, 0.50, 0.25));
           colors.push(color[0]);
           colors.push(color[1]);
           colors.push(color[2]);
           colors.push(this.ps[i].color[3]); 

           strs.push(vec3.length(velmutitime) * 100.0);
        }
    }
}

export default Particles;