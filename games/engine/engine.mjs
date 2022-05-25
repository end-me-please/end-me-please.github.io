const Vars = {};
Vars.world = new world(64,64);


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
        return new pos(this.x-pos.x,this.y-pos.y);
    }
    translate(angle,distance){
        this.x+=Math.cos(angle)*distance;
        this.y+=Math.sin(angle)*distance;
    }
    clone(){
        return new vector(this.x,this.y);
    }
}


//structure to define a square in 2d
//should contain mass, x/y movement and angular movement
class square{
    constructor(mass,pos,vel,angle)
    {
        this.mass=mass;
        this.pos=pos; //center of mass
        this.vel=vel;
        this.angle=angle;
        this.angularVel=0;
    }
    update(delta){
        this.pos.translate(this.angle,this.vel.x*delta);
        this.pos.translate(this.angle+Math.PI/2,this.vel.y*delta);
        this.angle+=this.angularVel*delta;
    }

    //collision detection
    //returns true if the square is colliding with the other square	
    collides(other){
        //rotate the other square
        let otherRotated = other.clone();
        otherRotated.rotate(-this.angle);
        //rotate the square
        let rotated = this.clone();
        rotated.rotate(-other.angle);
        //move the other square to the origin
        otherRotated.translate(-this.pos.x,-this.pos.y);
        //move the square to the origin
        rotated.translate(-other.pos.x,-other.pos.y);
        //check if the squares are overlapping
        if(Math.abs(rotated.pos.x)<=otherRotated.radius && Math.abs(rotated.pos.y)<=otherRotated.radius){
            //check if the squares are overlapping on the x axis
            if(Math.abs(rotated.pos.x)<=otherRotated.radius){
                //check if the squares are overlapping on the y axis
                if(Math.abs(rotated.pos.y)<=otherRotated.radius){
                    //collision detected
                    return true;
                }
            }
        }
        //no collision detected
        return false;
    }
    collide(other){
        if(this.collides(other)){
        //respect inertia and angular velocity
        let thisRotated = this.clone();
        thisRotated.rotate(-other.angle);
        let otherRotated = other.clone();
        otherRotated.rotate(-this.angle);
        //move the other square to the origin
        otherRotated.translate(-this.pos.x,-this.pos.y);
        //move the square to the origin
        thisRotated.translate(-other.pos.x,-other.pos.y);
        //calculate the angle between the squares
        let angle = Math.atan2(thisRotated.pos.y,thisRotated.pos.x);
        //calculate the distance between the squares
        let distance = thisRotated.pos.radius;
        //calculate the overlap
        let overlap = distance - otherRotated.radius;
        //calculate the impulse
        let impulse = -(1+0.5)*overlap;
        //calculate the impulse force
        let impulseForce = new vector(Math.cos(angle)*impulse,Math.sin(angle)*impulse);
        //apply the impulse force to the squares
        thisRotated.vel.translate(impulseForce.x,impulseForce.y);
        otherRotated.vel.translate(-impulseForce.x,-impulseForce.y);
        //calculate the angular impulse
        let angularImpulse = -(1+0.5)*(thisRotated.pos.x*otherRotated.pos.y-thisRotated.pos.y*otherRotated.pos.x)/(thisRotated.pos.radius*otherRotated.pos.radius);
        //calculate the angular impulse force
        let angularImpulseForce = angularImpulse*thisRotated.massInertia;
        //apply the angular impulse force to the squares
        thisRotated.angularVel+=angularImpulseForce;
        otherRotated.angularVel-=angularImpulseForce;
        //rotate the squares back
        thisRotated.rotate(this.angle);
        otherRotated.rotate(other.angle);
        //move the squares back to their original position
        thisRotated.translate(this.pos.x,this.pos.y);
        otherRotated.translate(other.pos.x,other.pos.y);
        //update the squares
        this.update(0);
        other.update(0);
        }
    }
}




















