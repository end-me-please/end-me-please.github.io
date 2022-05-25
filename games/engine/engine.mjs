const Vars = {};
Vars.world = new world(64,64,16);


class world{
    constructor(width, height,tileSize){
        this.width=width; //width and height of the world in tiles
        this.height=height;
        this.tileSize=tileSize; //size of a tile in pixels
        this.objects = [];
    }
    addObject(object){    
        this.objects.push(object);
        return object.id;
    }
    removeObject(id){
        //set dead to true
        for(let i=0;i<this.objects.length;i++){
            if(this.objects[i].id==id){
                this.objects[i].dead=true;
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
        return new pos(this.x-pos.x,this.y-pos.y);
    }
    translate(angle,distance){
        this.x+=Math.cos(angle)*distance;
        this.y+=Math.sin(angle)*distance;
    }
    toJSON(){
        return {type:"vector",x:this.x,y:this.y};
    }
    static fromJSON(json){
        return new vector(json.x,json.y);
    }
}


class gameObject{
    constructor(x,y){
        this.id=Math.floor(Math.random()*1000000);
        this.groupId=0;
        this.pos=new pos(x,y);
        this.rotation=0;
        this.dead=false;
        this.collides=false;
        this.static=true;
    }
    update(delta){
    }
}
class movingObject extends gameObject{
    constructor(x,y,w,h,mass,vel){
        super(x,y,w,h);
        this.vel=new vector(vel.x,vel.y);
        this.rotationRate=0;
        this.mass=mass;
    }
    update(delta){
        this.pos.x+=this.vel.x*delta;
        this.pos.y+=this.vel.y*delta;
        this.rotation+=this.rotationRate*delta;
    }
}










