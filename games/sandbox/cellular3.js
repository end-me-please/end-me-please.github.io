


class ParticleSim{
    constructor(width, height){
        this.renderHeight = 800;
        this.renderWidth = 800;
        this.width = width;
        this.height = height;
        this.particleId = 1;
        
        this.offscreenCanvas = new OffscreenCanvas(this.renderWidth,this.renderHeight);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');


        this.collisionMap = new Array(this.width);
        for (let i = 0; i < this.height; i++) {
            this.collisionMap[i] = new Array(this.height);
            for (let j = 0; j < this.height; j++) {
                this.collisionMap[i][j] = 0;
            }
        }

        this.particleData = new ArrayBuffer(width*height*Float64Array.BYTES_PER_ELEMENT*8);

        this.cheatParticles = [];
    }

    calculateCollisionMap(){
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.collisionMap[i][j] = 0;
            }
        }
        for(let id=0;id<this.particleId;id++){
            let particle = this.getParticle(id);
            
            if(particle == null||particle.dead==1) continue;

            let x = Math.floor(particle.x);
            let y = Math.floor(particle.y);
            if(x<0||x>=this.width||y<0||y>=this.height) {
                this.setParticle({id:particle.id,dead:1});
                continue;
            }
            this.collisionMap[x][y] = particle.id;
        }
    }




    getParticle(id){
        //return this.cheatParticles[id];

        let start = id*8*Float64Array.BYTES_PER_ELEMENT;
        let end = start + 8*Float64Array.BYTES_PER_ELEMENT;
        let data = new Float64Array(this.particleData.slice(start,end));
        let identifier = data[0];
        let x = data[1];
        let y = data[2];
        let vx = data[3];
        let vy = data[4];
        let type = data[5];
        let state = data[6];
        let dead = data[7];
        return {x:x,y:y,vx:vx,vy:vy,type:type,id:identifier,state:state, dead:dead};
    }
    setParticle(data){
        //this.cheatParticles[data.id] = data;
        return;
        let id = data.id;
        let start = id*8*Float64Array.BYTES_PER_ELEMENT;
        let end = start + 8*Float64Array.BYTES_PER_ELEMENT;
        let buffer = new Float64Array(this.particleData);
        if(data.id!=null) buffer[start] = data.id;
        if(data.x!=null) buffer[start+1] = data.x;
        if(data.y!=null) buffer[start+2] = data.y;
        if(data.vx!=null) buffer[start+3] = data.vx;
        if(data.vy!=null) buffer[start+4] = data.vy;
        if(data.type!=null) buffer[start+5] = data.type;
        if(data.state!=null) buffer[start+6] = data.state;
        if(data.dead!=null) buffer[start+7] = data.dead;
    }
    getId(){
        this.particleId++;
        return this.particleId-1;

        //get an empty id slot
        for(let id=0;id<this.particleId;id++){
            let particle = this.getParticle(id);
            if(particle.dead==1||particle.type==0){
                return id;
            }
        }
        this.particleId++;
        return this.particleId-1;
    }

    renderImageData(ctx){
        let imageData = this.offscreenCtx.createImageData(this.width,this.height);
        
        //go through all id's and draw the pixels
        for(let id=0;id<this.particleId;id++){
            let particle = this.getParticle(id);

            if(particle==null||particle.dead==1) continue;
            let x = Math.floor(particle.x);
            let y = Math.floor(this.height-particle.y);
            if(x<0||x>=this.width||y<0||y>=this.height) continue;
            let type = particle.type;
            let color = particleTypes[type].rgbColor;
            //invert y
            let index = (y*this.width+x)*4;
            imageData.data[index] = color[0];
            imageData.data[index+1] = color[1];
            imageData.data[index+2] = color[2];
            imageData.data[index+3] = 255;
        }



        this.offscreenCtx.fillColor = "black";
        this.offscreenCtx.fillRect(0,0,this.width,this.height);
        //zoom into the canvas
        this.offscreenCtx.putImageData(imageData,0,0);
        ctx.scale(this.renderWidth/this.width,this.renderHeight/this.height);
        ctx.drawImage(this.offscreenCanvas,0,0);
        ctx.scale(this.width/this.renderWidth,this.height/this.renderHeight);
        //scale back
    };
    update(){
        this.calculateCollisionMap();

    };
    addParticle(type,x,y){
        let id = this.getId();
        //check bounds
        if(x<0||x>=this.width||y<0||y>=this.height) {return;};

        //check existing particle
        let existingId = this.collisionMap[Math.floor(x)][Math.floor(y)];
        //skip if the particle is not dead
        if(existingId!=0){
            let existingParticle = this.getParticle(existingId);
            if(existingParticle.dead==0) return;
        
        }


        //check nan
        if(isNaN(x)||isNaN(y)) {console.log({type,x,y});return;};
        console.log({type,x,y});
        this.setParticle({id:id,x:x,y:y,type:type,dead:0,state:0});
    };

    logAllParticles(){
        for(let id=0;id<this.particleId;id++){
            let particle = this.getParticle(id);
            console.log(particle);
        }
    }

    get particleCount(){
        //return this.cheatParticles.length;

        let count = 0;
        for(let id=0;id<this.particleId;id++){
            let particle = this.getParticle(id);
            if(particle.dead==0) count++;
        }
        return count;
    }
}


class BaseParticleType {
    constructor(name, color){
        this.name = name;
        this.color = color;
        this.rgbColor = color.match(/\d+/g);
        this.density = 3;
        this.moveable = true;
        this.slipperiness = 0.1;
        this.maxSupportMass = 9;
        this.gravity = 0.1;
        this.drag=0.001;
        
        this.state = "solid"; //solid, liquid, gas
    }
}


let emptyType = new BaseParticleType("empty","rgb(0,0,0)");
let sandType = new BaseParticleType("snad","rgb(190,170,0)");

let waterType = new BaseParticleType("water","rgb(35,15,255)");
waterType.density = 1;
waterType.moveable = true;
waterType.state = "liquid";

let particleTypes = {0: emptyType, 1: sandType, 2: waterType};