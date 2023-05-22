


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
        this.crossover = true;
        this.mutationFactor = 0.25;

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

    scan(fish,angle,range){
        let adjustedAngle = (angle + fish.angle) % (2 * Math.PI);
        
        let fishCorrelationSum = 0;
        let foodCorrelationSum = 0;

        for (let i = 0; i < this.fishes.length; i++) {
            //check how closely the other fish's angle matches the scan angle
            let otherFish = this.fishes[i];
            if(otherFish == fish) continue;
            let distance = Math.sqrt((otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2);
            if(distance > range) continue;
            let otherFishAngle = Math.atan2(otherFish.y - fish.y, otherFish.x - fish.x);
            let otherFishAngleDifference = Math.abs(otherFishAngle - adjustedAngle);
            if(otherFishAngleDifference > Math.PI) otherFishAngleDifference = 2 * Math.PI - otherFishAngleDifference;
            if(otherFishAngleDifference > Math.PI/32) continue;
            let otherFishCorrelation = 1 - otherFishAngleDifference / Math.PI;
            //correct for distance
            fishCorrelationSum += otherFishCorrelation/(15*(distance/range));
    }

        for (let i = 0; i < this.food.length; i++) {

            let food = this.food[i];
            let distance = Math.sqrt((food.x - fish.x) ** 2 + (food.y - fish.y) ** 2);
            if(distance > range) continue;
            let foodAngle = Math.atan2(food.y - fish.y, food.x - fish.x);
            let foodAngleDifference = Math.abs(foodAngle - adjustedAngle);
            if(foodAngleDifference > Math.PI) foodAngleDifference = 2 * Math.PI - foodAngleDifference;
            if(foodAngleDifference > Math.PI/32) continue;
            let foodCorrelation = 1 - foodAngleDifference / Math.PI;
            //correct for distance
            foodCorrelationSum += foodCorrelation/(15*(distance/range));
        }
        return [fishCorrelationSum,foodCorrelationSum];
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
            if(Math.random()>0.2)this.fishes[i].mutate(factor);
        }
    }

    evolve(){
        //get the top 10% of fishes
        let sortedFishes = this.fishes.sort((a,b) => b.score - a.score);
        //check if top fish is new top fish
        if(sortedFishes[0].score > this.topFish.score) this.topFish = sortedFishes[0];


        //median of
        let topFishes = sortedFishes.slice(0,Math.floor(this.fishes.length / 4));
        this.fitnessHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].score);
        
        
        let newFishes = [];
        //randomly match top fish and pair them to create numFish new fishes
        
        if(this.crossover){
        for (let i = 0; i < this.numFish; i++) {
            let fish1 = topFishes[Math.floor(Math.random() * topFishes.length)];
            let fish2 = topFishes[Math.floor(Math.random() * topFishes.length)];
            newFishes.push(fish1.pair(fish2));
        }
        }else{
            for (let i = 0; i < this.numFish; i++) {
                let fish1 = topFishes[Math.floor(Math.random() * topFishes.length)];
                let newFish = fish1.clone();
                newFish.mutate(this.mutationFactor);
                newFishes.push(newFish);
            }
        }
        //add top fish to new fishes
        newFishes[0] = this.topFish.clone();


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
            topFish: this.topFish.serialize(),
            numFish: this.numFish,
            numFood: this.numFood,

        }
    }
    static deserialize(serialized){
        let sim = new Simulation(serialized.numFish);
        sim.numFood = serialized.numFood;
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
        this.drag = 0.09;
        this.fov = 0.7 * Math.PI;
        this.angle = Math.random() * 2 * Math.PI;
        this.turnSpeed = 0.01;
        this.size = 9;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.score = 0;
        this.brain = new FishBrain();
        this.speed = 1.8; //acceleration
        this.scanPosition = 0;
        this.minDistance = Infinity;
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

        if (minDistance < 2*this.size) {this.score -=5;this.x = oldX;this.y = oldY; this.x+=Math.cos(-otherAngle);this.y+=Math.sin(-otherAngle);this.vx = 0;this.vy = 0;this.angularVelocity = 0;}
        this.minDistance = minDistance;
        //this.score -= minDistance/(10*this.size);
        this.score -= Math.abs(this.angularVelocity)*3;


        //eat food
        
        for(let i = 0; i < this.world.food.length; i++){
            let food = this.world.food[i];
            let distance = Math.sqrt((food.x - this.x) ** 2 + (food.y - this.y) ** 2);
            if(distance < 1 * this.size) {
                this.world.food.splice(i,1);
                this.score += 25;
                if(Math.random() > 0.2){
                this.world.food.push(new Food(this.world,this.world.width*Math.random(),this.world.height*Math.random()));
                }
            }
        }
        

        //bounce off the walls, losing speed and points
        if(this.x < 0) {this.x = 0; this.vx *= -0.5; this.score -= 1;}
        if(this.x > this.world.width) {this.x = this.world.width; this.vx *= -0.5; this.score -= 1;}
        if(this.y < 0) {this.y = 0; this.vy *= -0.5; this.score -= 1;}
        if(this.y > this.world.height) {this.y = this.world.height; this.vy *= -0.5; this.score -= 1;}

    }




    act(){
        
        //scanPosition is from -1 to 1, 0 being straight ahead, -1 being all the way left to this.fov, 1 being all the way right to this.fov
        //2pi fov means both -1 and 1 are straight behind the fish
        let scanRad = this.fov / 2 * this.scanPosition;

        //make sure that scanRad is between 0 and 2pi
        if(scanRad < 0) scanRad += 2 * Math.PI;
        if(scanRad > 2 * Math.PI) scanRad -= 2 * Math.PI;



        let tmp = this.world.scan(this,scanRad,250);
        
        let inputData = [...tmp,1/this.minDistance,this.scanPosition];

        let output = this.brain.think(inputData);

        //check output for nan
        for (let i = 0; i < output.length; i++) {
            if(isNaN(output[i])) console.log("nan:" + output);
        }


        //make sure output is between limits for [angle,speed]
        if(output[0] < -1) output[0] = -1;	
        if(output[0] > 1) output[0] = 1;
        if(output[1] < -1) output[1] = -1;
        if(output[1] > 1) output[1] = 1;
        if(output[2] < -1) output[2] = -1;
        if(output[2] > 1) output[2] = 1;

        this.scanPosition = output[2];



        this.angularVelocity += output[0] * this.turnSpeed;
        this.vx += Math.cos(this.angle) * (this.speed*output[1]);
        this.vy += Math.sin(this.angle) * (this.speed*output[1]);

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


        if(Math.random() < 0.4) child.mutate(this.world.mutationFactor);
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
        clone.score = 0;
        clone.brain = this.brain.clone();
        clone.fov = this.fov;
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
            //draw sensor line in direction of scanPosition
            if(this.world.fishes[inspectedFish] == this) {
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 2;
            ctx.beginPath();            
            //its actually a pie slice going from -pi/32 to pi/32, draw two arcs
            ctx.lineTo(this.x,this.y);
            ctx.arc(this.x,this.y,300,this.angle + this.fov / 2 * this.scanPosition - Math.PI/32,this.angle + this.fov / 2 * this.scanPosition + Math.PI/32);
            ctx.lineTo(this.x,this.y);
            //from both ends of the arc, draw a line to the center
            
            
            ctx.stroke();
        }

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
            brain: this.brain.serialize(),
            fov: this.fov,
            drag: this.drag,
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
        fish.brain = FishBrain.deserialize(serialized.brain);
        fish.fov = serialized.fov,
        fish.drag = serialized.drag;
        return fish;
    }

}

