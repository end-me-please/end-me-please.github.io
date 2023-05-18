
class Simulation {
    constructor(numFish) {
        this.numFood = 50;
        this.width = 800;
        this.height = 800;
        this.numFish = numFish;
        this.fishes = [];
        this.food = [];
        this.fitnessHistory = [];
        this.generation = 0;
        this.tick = 0;
        for (let i = 0; i < numFish; i++) {
            this.fishes.push(new Fish(this,Math.random() * this.width, Math.random() * this.height));
        }
        
        //populate food
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
        this.topFish = this.fishes[0];
    }
    runGeneration(ticks){
        for (let i = 0; i < ticks; i++) {
            this.update();
          if(this.food.length == 0) break;
        }
        this.evolve();
        let tmp = this.tick;
        this.tick = 0;
        return tmp;
    }


    fishIntensities(fish,channels){
        let intensities = [];
        for (let i = 0; i < channels*2; i++) {
            intensities[i]=0;
        }
        
        for (let i = 0; i < this.fishes.length; i++) {
            let otherFish = this.fishes[i];
            if(otherFish == fish) continue;
            let distance = Math.sqrt((otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2);
            if(distance > 300) continue;
            let angle = Math.atan2(otherFish.y - fish.y, otherFish.x - fish.x) - fish.angle;
            if(angle < 0) angle += 2 * Math.PI;
            let channel = Math.floor(angle / (2 * Math.PI / channels));
            //nan check
            intensities[channel] += 1 / distance;
        }
        
        //food
        for (let i = channels; i < channels*2; i++) {
            intensities[i] = 0;
        }
        for(let i = 0; i < this.food.length; i++){
            let food = this.food[i];
            let distance = Math.sqrt((food.x - fish.x) ** 2 + (food.y - fish.y) ** 2);
            if(distance > 400) continue;
            let angle = Math.atan2(food.y - fish.y, food.x - fish.x) - fish.angle;
            if(angle < 0) angle += 2 * Math.PI;
            let channel = Math.floor(angle / (2 * Math.PI / channels));
            
            intensities[channel+channels] += 1 / distance;
            
        }

        
        return intensities;
    }
    update(){

        this.tick++;
        for (let i = 0; i < this.fishes.length; i++) {
            this.fishes[i].update();
            if(this.tick % 8 == 0) this.fishes[i].act();
        }
    }

    
    
    render(ctx){
        ctx.clearRect(0,0,this.width,this.height);
        for (let i = 0; i < this.fishes.length; i++) {
            let fish = this.fishes[i];
            fish.draw(ctx);
            
        }
        for (let i = 0; i < this.food.length; i++) {
            this.food[i].draw(ctx);
        }
    }
    mutate(factor){
        for (let i = 0; i < this.fishes.length; i++) {
            if(Math.random()>0.7)this.fishes[i].mutate(factor);
        }
    }

    evolve(){
        //get the top 10% of fishes
        let sortedFishes = this.fishes.sort((a,b) => b.score - a.score);
        //check if top fish is better than previous top fish
        if(sortedFishes[0].score > this.topFish.score) this.topFish = sortedFishes[0];
        
        //median of
        let topFishes = sortedFishes.slice(0,Math.floor(this.fishes.length / 15));
        this.fitnessHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].score);
        
        
        let newFishes = [];
        //randomly match top fish and pair them to create numFish new fishes
        for (let i = 0; i < this.numFish; i++) {
            let fish1 = topFishes[Math.floor(Math.random() * topFishes.length)];
            let fish2 = topFishes[Math.floor(Math.random() * topFishes.length)];
            newFishes.push(fish1.pair(fish2));
        }
        newFishes[0]=(new Fish(this,this.width*Math.random(),this.height*Math.random()));
        
        //spread evenly

        for (let i = 0; i < this.numFish; i++) {
            newFishes[i].x = this.width / 2 + Math.cos(i / this.numFish * 2 * Math.PI) * this.width / 2;
            newFishes[i].y = this.height / 2 + Math.sin(i / this.numFish * 2 * Math.PI) * this.height / 2;
        }


        //resolve collisions
        for (let i = 0; i < newFishes.length; i++) {
            let fish = newFishes[i];
            for (let j = 0; j < newFishes.length; j++) {
                let otherFish = newFishes[j];
                if(otherFish == fish) continue;
                let distance = Math.sqrt((otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2);
                if(distance < 2*fish.size) {
                    fish.x = Math.random() * this.width;
                    fish.y = Math.random() * this.height;
                }
            }
        }
        //keep top fish
        newFishes[0] = this.topFish.clone();
        this.fishes = newFishes;

        //reset food
        this.food = [];
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
        this.generation++;
    }

    serialize(){
        return {
            fishes: this.fishes.map(fish => fish.serialize()),
            food: this.food.map(food => food.serialize()),
            fitnessHistory: this.fitnessHistory,
            generation: this.generation,
            tick: this.tick,
            topFish: this.topFish.serialize()
        }
    }
    static deserialize(serialized){
        let sim = new Simulation(0);
        sim.fishes = serialized.fishes.map(fish => Fish.deserialize(sim,fish));
        sim.food = serialized.food.map(food => Food.deserialize(sim,food));
        sim.fitnessHistory = serialized.fitnessHistory;
        sim.generation = serialized.generation;
        sim.tick = serialized.tick;
        sim.topFish = Fish.deserialize(sim,serialized.topFish);
        return sim;
    }



}
class Food {
    constructor(world,x,y){
        this.world = world;
        this.x = x;
        this.y = y;
        this.size = 5;
    }
    draw(ctx){
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,2 * Math.PI);
        ctx.fill();
    }
    serialize(){
        return {
            x: this.x,
            y: this.y,
            size: this.size
        }
    }
    static deserialize(world,serialized){
        let food = new Food(world,serialized.x,serialized.y);
        food.size = serialized.size;
        return food;
    }

}


class Fish {
    constructor(world,x,y){
        this.world = world;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angularVelocity = 0;
        this.drag = 0;

        this.angle = Math.random() * 2 * Math.PI;
        this.turnSpeed = 0.01;
        this.size = 10;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.score = 0;
        this.sensorDirections = 8;
        this.brain = new FishBrain();
        this.speed = 0.8; //acceleration

    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularVelocity;
        this.vx *= 1 - this.drag;
        this.vy *= 1 - this.drag;
        this.angularVelocity *= 1 - this.drag;

        if(this.angle < 0) this.angle += 2 * Math.PI;
        if(this.angle > 2 * Math.PI) this.angle -= 2 * Math.PI;

        let oldX = this.x;
        let oldY = this.y;

        let minDistance = Infinity;
        let otherAngle = 0;
        for(let i = 0; i < this.world.fishes.length; i++) {
            let otherFish = this.world.fishes[i];
            if(otherFish == this) continue;
            let distance = Math.sqrt((otherFish.x - this.x) ** 2 + (otherFish.y - this.y) ** 2);
            if(distance < minDistance) {minDistance = distance; otherAngle = Math.atan2(otherFish.y - this.y, otherFish.x - this.x)};
        }

        if (minDistance < 2*this.size) {this.score -=5;this.x = oldX;this.y = oldY; this.x+=Math.cos(-otherAngle);this.y+=Math.sin(-otherAngle);};

        
        //get points for speed being exactly 1.4
        let velocity = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        let diff = Math.abs(velocity - 0.2);
        this.score -= diff;
        if(diff < 0.1) this.score += 0.1;

        //for low or high speed, subtract some points, depending on how far away from 1.4 it is

        this.score -= Math.abs(this.angularVelocity);


        //eat food
        //actually dont eat food, food is just a static reference point now
        /*
        for(let i = 0; i < this.world.food.length; i++){
            let food = this.world.food[i];
            let distance = Math.sqrt((food.x - this.x) ** 2 + (food.y - this.y) ** 2);
            if(distance < 1 * this.size) {
                this.world.food.splice(i,1);
                this.score += 40;
                if(Math.random() > 0.2){
                this.world.food.push(new Food(this.world,this.world.width*Math.random(),this.world.height*Math.random()));
                }
            }
        }
        */

        //bounce off the walls, losing speed and points
        if(this.x < 0) {this.x = 0; this.vx *= -0.5; this.score -= 0.1;}
        if(this.x > this.world.width) {this.x = this.world.width; this.vx *= -0.5; this.score -= 0.1;}
        if(this.y < 0) {this.y = 0; this.vy *= -0.5; this.score -= 0.1;}
        if(this.y > this.world.height) {this.y = this.world.height; this.vy *= -0.5; this.score -= 0.1;}



    }


    act(){
        let intensities = this.world.fishIntensities(this,this.sensorDirections);
        let output = this.brain.think(intensities);
        //make sure output is between limits for [angle,speed]
        if(output[0] < -1) output[0] = -1;	
        if(output[0] > 1) output[0] = 1;
        if(output[1] < -1) output[1] = -1;
        if(output[1] > 1) output[1] = 1;

        

        this.angularVelocity += output[0] * this.turnSpeed;
        this.vx += Math.cos(this.angle) * (this.speed*output[1]);
        this.vy += Math.sin(this.angle) * (this.speed*output[1]);
        //check if anythign is NaN and log it

    }
    pair(other){
        let child = new Fish(this.world,this.world.width*Math.random(),this.world.height*Math.random());
        //average color
        let color1 = this.color.match(/\d+/g).map(Number);
        let color2 = other.color.match(/\d+/g).map(Number);
        let childColor = "rgb(";
        for (let i = 0; i < color1.length; i++) {
            childColor += Math.floor((color1[i] + color2[i]) / 2);
            if(i < color1.length - 1) childColor += ",";
        }
        childColor += ")";
        child.color = childColor;

        child.brain = this.brain.pair(other.brain);
        if(Math.random()>0.7){
        let checksum = child.brain.checksum();
        //somehow generate a rgb color from the checksum
        let color = "rgb(";
        for (let i = 0; i < 3; i++) {
            color += checksum % 256;
            if(i < 2) color += ",";
            checksum = Math.floor(checksum / 256);
        }
        color += ")";
        child.color = color;    
        }


        if(Math.random() < 0.5) child.mutate(Math.random()*0.5);
        return child;
    }
    mutate(factor){
        //mutate color
        let color = this.color.match(/\d+/g).map(Number);
        for (let i = 0; i < color.length; i++) {
            color[i] += Math.floor(Math.random() * 50 - 25);
            if(color[i] < 0) color[i] = 0;
            if(color[i] > 255) color[i] = 255;
        }
        let newColor = "rgb(";
        for (let i = 0; i < color.length; i++) {
            newColor += color[i];
            if(i < color.length - 1) newColor += ",";
        }
        newColor += ")";
        this.color = newColor;

        this.brain.mutate(factor);

    }
    clone(){
        let clone = new Fish(this.world,this.x,this.y);
        clone.angle = this.angle;
        clone.speed = this.speed;
        clone.turnSpeed = this.turnSpeed;
        clone.size = this.size;
        clone.color = this.color;
        clone.score = this.score;
        clone.sensorDirections = this.sensorDirections;
        clone.brain = this.brain.clone();
        return clone;
    }
    draw(ctx){
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.size,0,2 * Math.PI);
            ctx.fill();
            //draw fish eye in direction it is facing
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + Math.cos(this.angle) * (this.size*0.6),this.y + Math.sin(this.angle) * (this.size*0.6),this.size/3,0,2 * Math.PI);
            ctx.fill();
    }
    serialize(){
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            speed: this.speed,
            turnSpeed: this.turnSpeed,
            size: this.size,
            color: this.color,
            score: this.score,
            sensorDirections: this.sensorDirections,
            brain: this.brain.serialize()
        }
    }
    static deserialize(world,serialized){
        let fish = new Fish(world,serialized.x,serialized.y);
        fish.angle = serialized.angle;
        fish.speed = serialized.speed;
        fish.turnSpeed = serialized.turnSpeed;
        fish.size = serialized.size;
        fish.color = serialized.color;
        fish.score = serialized.score;
        fish.sensorDirections = serialized.sensorDirections;
        fish.brain = FishBrain.deserialize(serialized.brain);
        return fish;
    }

}

