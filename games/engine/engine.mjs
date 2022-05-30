const Vars = {};
//Vars.world = new world(64,64);


class world{
    constructor(width, height){
        this.width=width; //width and height of the world in tiles
        this.height=height;
        this.clusters = [];
        this.walls = [];
        this.gravity = new vector(0,0.4);
        this.lastRemainder = 0;
        this.timeStep = 1/60;
        this.timeScale = 1/600;
    }
    update(delta){
        delta = Math.min(delta, 64);
        delta = delta * this.timeScale;
        delta += this.lastRemainder;
        let iteration = 0;
        while (delta>this.timeStep){
        iteration++;
        this.tick(this.timeStep);
        delta-= this.timeStep;
        }
        this.lastRemainder = delta;
        if(iteration>100){
            this.lastRemainder = 0;
        }
    }


    tick(delta){
        //check for collisions
        for(let i=0; i<this.clusters.length; i++){
            for(let j=i+1; j<this.clusters.length; j++){
                //check maxSpan of both, if the distance is smaller than the sum, check for collision
                let spanSum = this.clusters[i].maxSpan + this.clusters[j].maxSpan;
                let dist = this.clusters[i].pos.distanceTo(this.clusters[j].pos);
                if(dist<spanSum){
                this.clusters[i].checkCollision(this.clusters[j]);
                this.clusters[j].checkCollision(this.clusters[i]);
                }}}
        for(let i=0; i<this.clusters.length; i++){
            
            //check for wall collisions
            for(let j=0; j<this.walls.length; j++){
                this.clusters[i].checkCollision(this.walls[j]);
            }
            this.clusters[i].applyAcceleration(this.gravity);
            this.clusters[i].update(delta);
        }
    }
    getObjectAt(x,y){
        let candidate = this.clusters.find(c=>c.pos.distanceTo(new vector(x,y))<c.maxSpan);
        if(candidate){
            return candidate.members.find(p=>p.globalPosition().distanceTo(new vector(x,y))<p.size/2);
        }
        return null;
    }

    getTotalEnergy(){
        let energy = 0;
        for(let i=0; i<this.clusters.length; i++){
            //calculate energy
            let eX = this.clusters[i].vel.x * this.clusters[i].totalMass;
            let eY = this.clusters[i].vel.y * this.clusters[i].totalMass;
            energy += eX + eY;    
        }
        return energy;
    }

}


class vector{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
    null(){
        this.x=0;
        this.y=0;
    }
    get radius(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    set radius(length){
        let angle = this.angle;
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    }
    get angle(){
        return Math.atan2(this.y,this.x);
    }
    set angle(angle){
        let length = this.radius;
        this.x = Math.cos(angle) * length;
        this.y = Math.sin(angle) * length;
    }
    distanceTo(pos){
        return Math.sqrt(Math.pow(this.x-pos.x,2)+Math.pow(this.y-pos.y,2));
    }
    angleTo(pos){
        return Math.atan2(pos.y-this.y,pos.x-this.x);
    }
    relativeTo(pos){
        return new vector(this.x-pos.x,this.y-pos.y);
    }
    polarTranslate(angle,distance){
        return new vector(this.x+Math.cos(angle)*distance,this.y+Math.sin(angle)*distance);
    }
    add(v){
        return new vector(this.x+v.x,this.y+v.y);
    }
    subtract(v){
        return new vector(this.x-v.x,this.y-v.y);
    }
    rotate(angle){
        return new vector(this.x*Math.cos(angle)-this.y*Math.sin(angle),this.x*Math.sin(angle)+this.y*Math.cos(angle));
    }
    multiplyScalar(scalar){
        return new vector(this.x*scalar,this.y*scalar);
    }
    normalize(){
        let length = this.radius;
        return new vector(this.x/length,this.y/length);
    }
    dot(v){
        return this.x*v.x+this.y*v.y;
    }
    clone(){
        return new vector(this.x,this.y);
    }
    cross(v){
        return this.x*v.y-this.y*v.x;
    }
    multiply(v){
        return new vector(this.x*v.x,this.y*v.y);
    }
}


class clusterPart {
    constructor(parent,type="ohno",x=0,y=0,rotation=0,mass=1){
        this.id=Math.floor(Math.random()*1000000);
        this.pos = new vector(x,y);
        this.rotation = rotation;
        this.mass = mass;
        this.type = type;
        this.parent = parent;
        this.size = 1;
        this.forceVisual = new vector(0,0);
    }
    globalPosition(){
        //rotate around parent's center of mass
        let pos = this.pos.clone();
        //add parent's center of mass
        pos = pos.rotate(this.parent.angle);
        pos = pos.relativeTo(this.parent.CenterOfMass.rotate(this.parent.angle));
        pos = pos.add(this.parent.pos);
        return pos;
    }
    globalVelocity(){
        let parentVel = this.parent.vel.clone();
        //parentVel is the base velocity, it's already in global space
        //adjust by parent's angle and angleRate
        let angleRate = this.parent.angleRate;
        let distance = this.parent.CenterOfMass.distanceTo(this.pos);
        let angle = this.parent.CenterOfMass.angleTo(this.pos);
        let angleVel = angleRate*distance;
        let vel = parentVel.polarTranslate(angle,angleVel);
        return vel;
    }
    getCollisionForce(other){
        let force = new vector(0,0);
        let dist = 69;
        if(other instanceof clusterPart && other.parent.id != this.parent.id){
            dist = this.globalPosition().distanceTo(other.globalPosition());
            if(dist<this.size+other.size){
            let forceMag = other.parent.totalMass/(dist);
            force = this.globalPosition().relativeTo(other.globalPosition());
            force = force.normalize();
            force = force.multiplyScalar(forceMag);
            }
        }
        //if too far away, don't bother
        if(dist > (this.size+other.size)/2){
            return new vector(0,0);
        }
        this.forceVisual = force;
        return force;
    }
    hit(sourcePos,strength){
        let relativePos = this.globalPosition().relativeTo(sourcePos);
        let force = relativePos.normalize().multiplyScalar(strength);
        this.parent.applyForce(this.pos,force);
    }
}



class cluster {
    constructor(pos, id){
        this.pos=pos;
        this.angle = 0;
        this.angleRate = 0;
        this.vel = new vector(0,0);
        this.accel = new vector(0,0);
        this.angularAccel = 0;
        this.id=id;
        this.members=[];
        this.lastDelta = 0;
        this.forceVisualPos = new vector(0,0);
        this.forceVisual = new vector(0,0);
        this.maxSpan = 0;
        this.CenterOfMass = new vector(0,0);
        this.totalMass = 0;
    }
    addPart(part){
        this.members.push(part);
        part.parent = this;
        this.maxSpan = Math.max(this.maxSpan,part.pos.radius+part.size*0.5);
        this.totalMass = this.getTotalMass();
        this.CenterOfMass = this.getCenterOfMass();
        return part;
    }

    getMaxSpan(){
        //get furthest distance from origin
        let max = 0;
        for(let i=0; i<this.members.length; i++){
            let dist = this.members[i].pos.distanceTo(new vector(0,0));
            if(dist > max){
                max = dist;
            }
        }
        return max;
    }
    getTotalMass(){
        let mass=0;
        for(let i=0; i<this.members.length; i++){
            mass+=this.members[i].mass;
        }
        return mass;
    }
    getCenterOfMass(){ //center of mass in local coordinates
        let x=0;
        let y=0;
        let totalMass=this.totalMass;
        for(let i=0; i<this.members.length; i++){
            x+=this.members[i].pos.x*(this.members[i].mass/totalMass);
            y+=this.members[i].pos.y*(this.members[i].mass/totalMass);
        }
        return new vector(x,y);
    }
    applyForce(pos,force){
        let forcePos = pos.rotate(-this.angle);
        forcePos = pos.relativeTo(this.CenterOfMass);
        //get torque and acceleration
        let torque = forcePos.cross(force);
        let accel = force.multiplyScalar(1/this.totalMass);
        //add torque and acceleration
        this.angularAccel += torque;
        this.accel = this.accel.add(accel);
        
        this.forceVisualPos = forcePos;
        this.forceVisual = force;
    }
    applyAcceleration(accel){
        this.accel = this.accel.add(accel);
    }

    checkCollision(other){
        if(other instanceof cluster&&other.id!=this.id){
            let deepestForce = new vector(0,0);
            let deepestPos = new vector(0,0);
            for(let i=0; i<this.members.length; i++){
                for(let j=0; j<other.members.length; j++){
                    let force = this.members[i].getCollisionForce(other.members[j]);
                    if(force.radius > deepestForce.radius){
                        deepestForce = force;
                        deepestPos = this.members[i].pos;
                    }
                }
            }
                //console.log(deepestForce);
                this.update(-this.lastDelta,false);
                this.applyForce(deepestPos,deepestForce);
                this.update(this.lastDelta,false);
        }
        if(other instanceof staticCollider&&other.id!=this.id){
            let deepestForce = new vector(0,0);
            let deepestPos = new vector(0,0);
            for(let i=0; i<this.members.length; i++){
                for(let j=0; j<other.members.length; j++){
                    let force = this.members[i].getCollisionForce(other.members[j]);
                    //check if this is the deepest force
                    if(force.radius > deepestForce.radius){
                        deepestForce = force;
                        deepestPos = this.members[i].pos;
                    }
                }
            }
            if(deepestForce.radius > 0){
                this.update(-this.lastDelta,false);
                this.applyForce(deepestPos,deepestForce);
                this.update(this.lastDelta,false);
            }
        }
        }

    
    update(delta,resetAccel=true){
        //rotate
        this.vel = this.vel.add(this.accel.multiplyScalar(delta));        
        if(resetAccel){
        this.angleRate += this.angularAccel*delta;this.angularAccel=0;
        this.accel=new vector(0,0);
        this.lastDelta = delta;
        this.angleRate = this.angleRate*0.97;
        }
        
        this.angle += this.angleRate*delta;
        this.pos = this.pos.add(this.vel.multiplyScalar(delta));
    }
    globalToLocal(pos){
        return pos.relativeTo(this.CenterOfMass).rotate(-this.angle);
    }
}
class staticCollider extends cluster{
    constructor(x,y,width,height){
        super(new vector(x,y), Math.floor(Math.random()*10000));
        this.width = width;
        this.height = height;
        this.segmentSize=1;
        //generate clusterParts to fill the walls
        for(let i=0; i<this.width; i+=this.segmentSize){
            for(let j=0; j<this.height; j+=this.segmentSize){
                this.addPart(new clusterPart(this, "wall",i,j,0,1));
            }
        }
    }
    update(delta,resetAccel=true){
    }
}











