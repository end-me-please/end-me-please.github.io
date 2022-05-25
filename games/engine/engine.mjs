const Vars = {};
//Vars.world = new world(64,64);


class world{
    constructor(width, height){
        this.width=width; //width and height of the world in tiles
        this.height=height;
        this.objects = [];
    }
    update(delta){
    for(let i=0; i<this.objects.length; i++){
        this.objects[i].update(delta);
    }
        for(let i=0; i<this.objects.length; i++){
            for(let j=0; j<this.objects.length; j++){
                if(i!=j){
                    this.objects[i].collide(this.objects[j]);
                }
            }
        
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
        this.x+=Math.cos(angle)*distance;
        this.y+=Math.sin(angle)*distance;
    }
    add(v){
        this.x+=v.x;
        this.y+=v.y;
    }
    subtract(v){
        this.x-=v.x;
        this.y-=v.y;
    }
    rotate(angle){
        this.angle+=angle;
    }
    multiplyScalar(scalar){
        return new vector(this.x*scalar,this.y*scalar);
    }
    getNormalized(){
        let v = this.clone();
        v.normalize();
        return v;
    }
    normalize(){
        let length = this.radius;
        this.x = Math.cos(this.angle) * length;
        this.y = Math.sin(this.angle) * length;
    }
    dot(v){
        return this.x*v.x+this.y*v.y;
    }

    clone(){
        return new vector(this.x,this.y);
    }
}


//structure to define a square in 2d
//should contain mass, x/y movement and angular movement
class rect{
    constructor(mass=1,posx=1,posy=1,width=2,height=2,velx=0,vely=0,angle=0)
    {
        this.mass=mass;
        this.size=new vector(width,height);
        this.pos=new vector(posx,posy);
        this.vel=new vector(velx,vely);
        this.angle=angle;
        this.angularVel=0;
        this.texture="square";
    }
    get width(){
        return this.size.x;
    }
    get height(){
        return this.size.y;
    }
    update(delta){
        let deltaPos = new vector(this.vel.x*delta,this.vel.y*delta);
        this.pos.add(deltaPos);
        this.angle+=this.angularVel*delta;
        //gravity
        this.vel.y+=0.981*delta;
    }
    collides(other){
        if(this.pos.x+this.width/2>other.pos.x-other.width/2 && this.pos.x-this.width/2<other.pos.x+other.width/2 && this.pos.y+this.height/2>other.pos.y-other.height/2 && this.pos.y-this.height/2<other.pos.y+other.height/2){
            return true;
        }
        return false;
    }
    collide(other){
        if(this.collides(other)){
            let relativePos = this.pos.relativeTo(other.pos);
            let relativeVel = this.vel.relativeTo(other.vel);
            let relativeAngle = this.angle-other.angle;

            //apply collision response
            let overlap = this.width/2+other.width/2-relativePos.radius;
            let normal = new vector(relativePos.x/relativePos.radius,relativePos.y/relativePos.radius);
            let tangent = new vector(-normal.y,normal.x);
            let relativeVelNormal = normal.dot(relativeVel);
            let relativeVelTangent = tangent.dot(relativeVel);
            let normalVel = relativeVelNormal*(this.mass-other.mass)/(this.mass+other.mass);
            let tangentVel = relativeVelTangent*(this.mass-other.mass)/(this.mass+other.mass);
            let impulseNormal = normal.multiplyScalar(normalVel);
            let impulseTangent = tangent.multiplyScalar(tangentVel);
            this.vel.add(impulseNormal);
            this.vel.add(impulseTangent);
            other.vel.subtract(impulseNormal);
            other.vel.subtract(impulseTangent);
            this.angularVel-=relativeAngle*tangentVel*(this.mass-other.mass)/(this.mass+other.mass);
            other.angularVel+=relativeAngle*tangentVel*(this.mass-other.mass)/(this.mass+other.mass);


        }
    }
}

class wall extends rect{
    constructor(posx,posy,width,height,angle=0){
        super(0,posx,posy,width,height,0,0,angle);
        this.texture="wall";
    }
    collide(other){
        //no
    }
    update(delta){
        //no
    }
}















