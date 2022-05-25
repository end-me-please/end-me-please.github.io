const Vars = {};
//Vars.world = new world(64,64);


class world{
    constructor(width, height){
        this.width=width; //width and height of the world in tiles
        this.height=height;
        this.clusters = [];
    }
    update(delta){
        for(let i=0; i<this.clusters.length; i++){
        this.clusters[i].update(delta);
    }
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
        this.size = 32;
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
    addParent(parent){
        this.parent = parent;
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

        this.forceVisualPos = new vector(0,0);
        this.forceVisual = new vector(0,0);
    }
    get totalMass(){
        let mass=0;
        for(let i=0; i<this.members.length; i++){
            mass+=this.members[i].mass;
        }
        return mass;
    }
    get CenterOfMass(){ //center of mass in local coordinates
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
        
        let forcePos = pos.clone().relativeTo(this.CenterOfMass);
        forcePos = forcePos.rotate(this.angle);
        //get component pointing towards center of mass
        let forceComponent = forcePos.normalize().multiplyScalar(force.radius);
        //get component pointing perpendicular to center of mass
        let torqueComponent = forcePos.cross(force.normalize());
        //add components
        this.accel = this.accel.add(forceComponent);
        this.angularAccel = this.angularAccel + torqueComponent;

        this.forceVisualPos = forcePos;
        this.forceVisual = force;


    }
    update(delta){
        //rotate
        this.angleRate += this.angularAccel*delta;this.angularAccel=0;
        this.vel = this.vel.add(this.accel.multiplyScalar(delta)); this.accel=new vector(0,0);
        
        this.angle += this.angleRate*delta;
        this.pos = this.pos.add(this.vel.multiplyScalar(delta));
    }
}











