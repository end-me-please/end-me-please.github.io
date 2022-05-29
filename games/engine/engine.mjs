const Vars = {};
//Vars.world = new world(64,64);


class world{
    constructor(width, height){
        this.width=width; //width and height of the world in tiles
        this.height=height;
        this.clusters = [];
        this.walls = [];
        this.gravity = new vector(0,0.1);
    }
    update(delta){

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
}


class vector{
    constructor(x,y){
        this.x=x;
        this.y=y;
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
    fromJSON(json){
        let newPart = new clusterPart({},json.type,json.pos.x,json.pos.y,json.rotation,json.mass);
        newPart.id = json.id;
        return newPart;
    }
    getCollisionForce(other){
        let force = new vector(0,0);
        let dist = 9000;
        if(other instanceof clusterPart && other.parent.id != this.parent.id){
            dist = this.globalPosition().distanceTo(other.globalPosition());
            //dist = dist * 0.9;
            let forceMag = other.parent.totalMass/dist;
            force = this.globalPosition().relativeTo(other.globalPosition());
            force = force.normalize();
            force = force.multiplyScalar(forceMag);
        } else if(other instanceof staticCollider){
            //check if circle is inside of rotated rectangle defined by other's width, height and rotation
            let pos = this.globalPosition();
            let rot = other.angle;
            let width = other.width;
            let height = other.height;
            let radius = this.size/2;
            let x = pos.x;
            let y = pos.y;
            let x1 = x - radius;
            let x2 = x + radius;
            let y1 = y - radius;
            let y2 = y + radius;
            let x1r = x1 * Math.cos(rot) - y1 * Math.sin(rot);
            let x2r = x2 * Math.cos(rot) - y1 * Math.sin(rot);
            let y1r = x1 * Math.sin(rot) + y1 * Math.cos(rot);
            let y2r = x2 * Math.sin(rot) + y2 * Math.cos(rot);
            let x1r1 = x1r - width/2;
            let x2r1 = x2r - width/2;
            let y1r1 = y1r - height/2;
            let y2r1 = y2r - height/2;
            let x1r2 = x1r + width/2;
            let x2r2 = x2r + width/2;
            let y1r2 = y1r + height/2;
            let y2r2 = y2r + height/2;
            if(x1r1<x2r2 && x2r1<x1r2 && y1r1<y2r2 && y2r1<y1r2){
                //circle is inside of rectangle
                //calculate force
                let forceMag = other.mass/dist;
                force = this.globalPosition().relativeTo(pos);
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
        this.maxSpan = Math.max(this.maxSpan,part.pos.radius+0.5);
        this.totalMass = this.getTotalMass();
        this.CenterOfMass = this.getCenterOfMass();
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
        let accel = force.multiplyScalar(1/this.totalMass).multiplyScalar(0.97);
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
            for(let i=0; i<this.members.length; i++){
                for(let j=0; j<other.members.length; j++){
                    let force1 = this.members[i].getCollisionForce(other.members[j]);
                    if(force1.radius>0.01){
                        this.update(-this.lastDelta,false);
                        this.applyForce(this.members[i].pos,this.members[i].getCollisionForce(other.members[j]).multiplyScalar(1));
                        this.update(this.lastDelta,false);
                    }
                }
            }
        }
        else if (other instanceof staticCollider){
            for(let i=0; i<this.members.length; i++){
                let force = this.members[i].getCollisionForce(other);
                if(force.radius>0.01){
                    this.update(-this.lastDelta,false);
                    this.applyForce(this.members[i].pos,this.members[i].getCollisionForce(other).multiplyScalar(1));
                    this.update(this.lastDelta,false);
                }
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
        }
        
        this.angle += this.angleRate*delta;
        this.angleRate *= 0.97;
        this.pos = this.pos.add(this.vel.multiplyScalar(delta));
    }
    globalToLocal(pos){
        return pos.relativeTo(this.CenterOfMass).rotate(-this.angle);
    }
}
class staticCollider{
    constructor(x,y,width,height,angle){
        this.pos = new vector(x,y);
        this.width = width;
        this.height = height;
        this.angle = angle;
    }
    getCollisionForce(other){
    return new vector(0,0);
    }
    update(delta){
    }
}











