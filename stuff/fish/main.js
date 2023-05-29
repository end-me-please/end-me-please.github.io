


class Simulation {
    constructor(numFish) {
        this.numFood = 80;
        this.width = 2000;
        this.height = 2000;
        this.numFish = numFish;
        this.fishes = [];
        this.food = [];
        this.fitnessHistory = [];
        this.speedHistory = [];
        this.sizeHistory = [];
        this.generation = 0;
        this.tick = 0;
        this.crossover = true;
        this.mutationFactor = 0.25;
        for (let i = 0; i < numFish; i++) {
            this.fishes.push(new Fish(this,Math.random() * this.width, Math.random() * this.height));
        }
        this.map = [];
        let numSquares = 5;
        this.numSquares = numSquares;
        //populate map
        for (let i = 0; i < numSquares; i++) {
            this.map.push([]);
            for (let j = 0; j < numSquares; j++) {
                this.map[i].push([]);
            }
        }

        //populate food
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
    }
    runGeneration(ticks){
        for (let i = 0; i < ticks; i++) {
            this.update();
        }
        this.evolve(0.4);
        let tmp = this.tick;
        this.tick = 0;
        return tmp;
    }

    scan(fish,angle,range){
        let adjustedAngle = (angle + fish.angle) % (2 * Math.PI);
        
        let fishSum = 0;
        
        let foodSum = 0;
        
        let possibleFish = this.fishes;

        for (let i = 0; i < possibleFish.length; i++) {
            //check how closely the other fish's angle matches the scan angle
            let otherFish = possibleFish[i];
            if(otherFish == fish) continue;

            let distanceSquared = (otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2;
            if(distanceSquared > (range**2)) continue;
            let otherFishAngle = Math.atan2(otherFish.y - fish.y, otherFish.x - fish.x);
            let otherFishAngleDifference = Math.abs(otherFishAngle - adjustedAngle);
            if(otherFishAngleDifference > Math.PI) otherFishAngleDifference = 2 * Math.PI - otherFishAngleDifference;
            if(otherFishAngleDifference > Math.PI*fish.visionFocus) continue;
            let otherFishCorrelation = 1 - otherFishAngleDifference / Math.PI;
            //correct for distance
            fishSum += otherFishCorrelation/(9*((1+(distanceSquared)))/(range**2));
    }

        for (let i = 0; i < this.food.length; i++) {

            let food = this.food[i];
            let distanceSquared = (food.x - fish.x) ** 2 + (food.y - fish.y) ** 2;
            if(distanceSquared > range**2) continue;
            let foodAngle = Math.atan2(food.y - fish.y, food.x - fish.x);
            let foodAngleDifference = Math.abs(foodAngle - adjustedAngle);
            if(foodAngleDifference > Math.PI) foodAngleDifference = 2 * Math.PI - foodAngleDifference;
            if(foodAngleDifference > Math.PI*fish.visionFocus) continue;
            let foodCorrelation = 1 - foodAngleDifference / Math.PI;
            //correct for distance
            foodSum += foodCorrelation/(9*((1+(distanceSquared))/(range**2)));
        }
    
        return [fishSum,foodSum];
    
    
    
    }

    update(){

        if(this.food.length == 0 && this.numFood != 0) this.evolve(0.5);
        if(this.fishes.length < this.numFish / 4) this.evolve(0.6);
        let numSquares = this.numSquares;
        let squareWidth = this.width/numSquares;
        let squareHeight = this.height/numSquares;

        //assume that the maximum size of a fish is 40, split the map into 40x40 squares
        for (let i = 0; i < numSquares; i++) {
            for (let j = 0; j < numSquares; j++) {
                //empty out the map
                this.map[i][j] = [];
            }
        }
        
        this.tick++;
        for (let i = 0; i < this.fishes.length; i++) {
            //sort into map
            let fish = this.fishes[i];
            //find the square that the fish is in
            let x = Math.floor(fish.x/squareWidth);
            let y = Math.floor(fish.y/squareHeight);
            //math.max/min to prevent out of bounds errors
            
            x = Math.max(0,Math.min(x,numSquares-1));
            y = Math.max(0,Math.min(y,numSquares-1));
            this.map[x][y].push(fish);
            

            this.fishes[i].update();
            if(this.tick % 8 == 0) this.fishes[i].act();
        }
        let map = this.map;

        //resolve collisions, check each square and the 8 surrounding squares, consider bounds
        for (let i = 0; i < numSquares; i+=2) {
            for (let j = 0; j < numSquares; j+=2) {
                //push all fish in the square and the 8 surrounding squares into an array
                let fishArray = [];
                for (let k = -1; k < 2; k++) {
                    for (let l = -1; l < 2; l++) {
                        if(i+k < 0 || i+k >= numSquares || j+l < 0 || j+l >= numSquares) continue;
                        fishArray.push(...map[i+k][j+l]);
                    }
                }
                //resolve collisions
                for (let k = 0; k < fishArray.length; k++) {
                    let fish1 = fishArray[k];
                    for (let l = k+1; l < fishArray.length; l++) {
                        let fish2 = fishArray[l];
                        let distanceSquared = (fish1.x - fish2.x) ** 2 + (fish1.y - fish2.y) ** 2;
                        if(distanceSquared < (fish1.size**2+fish2.size**2)){
                            let angle = Math.atan2(fish1.y - fish2.y, fish1.x - fish2.x);
                            let overlap = 2*(fish1.size*0.9+fish2.size*0.9 - Math.sqrt(distanceSquared));
                            fish1.x += overlap/2 * Math.cos(angle);
                            fish1.y += overlap/2 * Math.sin(angle);
                            fish2.x -= overlap/2 * Math.cos(angle);
                            fish2.y -= overlap/2 * Math.sin(angle);

                            fish1.life -= 2 * (fish2.size / fish1.size);
                            fish2.life -= 2 * (fish1.size / fish2.size);

                        }
                        //check min distance
                        if(fish1.minDistance > distanceSquared) {fish1.minDistance = distanceSquared};
                        if(fish2.minDistance > distanceSquared) {fish2.minDistance = distanceSquared};

                    }
                }
            }
        }

        //legacy collision detection 
        /*
        //resolve collisions by checking in pairs, don't check twice
        for (let i = 0; i < this.fishes.length; i++) {
            let fish1 = this.fishes[i];
            for (let j = i+1; j < this.fishes.length; j++) {
                let fish2 = this.fishes[j];
                let distanceSquared = (fish1.x - fish2.x) ** 2 + (fish1.y - fish2.y) ** 2;

                if(fish1.minDistance > distanceSquared) {fish1.minDistance = distanceSquared};
                if(fish2.minDistance > distanceSquared) {fish2.minDistance = distanceSquared};

                if(distanceSquared < (fish1.size**2+fish2.size**2)){
                    let angle = Math.atan2(fish1.y - fish2.y, fish1.x - fish2.x);
                    let overlap = 2*(fish1.size*0.5+fish2.size*0.5) - Math.sqrt(distanceSquared);
                    fish1.x += Math.cos(angle) * overlap * 0.5;
                    fish1.y += Math.sin(angle) * overlap * 0.5;
                    fish2.x -= Math.cos(angle) * overlap * 0.5;
                    fish2.y -= Math.sin(angle) * overlap * 0.5;
                    //subtract 1 health from both fish

                }
            }
        }
        */



    }

    
    
    render(ctx){
        //make canvas width and height the same as map width and height
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;
        
        ctx.clearRect(0,0,this.width,this.height);
        for (let i = 0; i < this.fishes.length; i++) {
            let fish = this.fishes[i];
            fish.draw(ctx);
            
        }
        for (let i = 0; i < this.food.length; i++) {
            this.food[i].draw(ctx);
        }
        /*
        //draw the map
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        let squareWidth = this.width/this.numSquares;
        let squareHeight = this.height/this.numSquares;
        for (let i = 0; i < this.numSquares; i++) {
            for (let j = 0; j < this.numSquares; j++) {
                ctx.strokeRect(i*squareWidth,j*squareHeight,squareWidth,squareHeight);
            }
        }
        */


    }
    mutate(factor){
        for (let i = 0; i < this.fishes.length; i++) {
            if(Math.random()>0.2)this.fishes[i].mutate(factor);
        }
    }

    evolve(fraction=0.5){
        //get the top 10% of fishes
        let sortedFishes = this.fishes.sort((a,b) => b.score - a.score);
        
        let topFishes = sortedFishes.slice(0,Math.floor(this.fishes.length * fraction));
        

        
        if(this.generation%120==0){
        this.mutationFactor*=0.94;
        let layer = 1;
        if(this.generation<750){
        topFishes.forEach(fish => fish.brain.expand(layer));
        this.mutate(0.3);    
        }
        }

        this.fitnessHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].score);
        this.sizeHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].size);
        this.speedHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].speed);



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
        this.fishes = newFishes;

        //reset food
        this.food = [];
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }

        if(this.generation<100){
            let startBoost = Math.max(0,(100-this.generation)/700);
            console.log("boosting mutations: " + startBoost);
            this.mutate(startBoost);
        }

        this.generation++;
    }

    serialize(){
        return {
            fishes: this.fishes.map(fish => fish.serialize()),
            food: this.food.map(food => food.serialize()),
            fitnessHistory: this.fitnessHistory,
            speedHistory: this.speedHistory,
            sizeHistory: this.sizeHistory,
            mutationFactor: this.mutationFactor,
            generation: this.generation,
            tick: this.tick,
            numFish: this.numFish,
            numFood: this.numFood,


        }
    }
    static deserialize(serialized){
        let sim = new Simulation(serialized.numFish);
        sim.numFood = serialized.numFood;
        sim.fishes = serialized.fishes.map(fish => Fish.deserialize(sim,fish));
        sim.food = serialized.food.map(food => Food.deserialize(sim,food));
        sim.generation = serialized.generation;
        sim.tick = serialized.tick;
        sim.mutationFactor = serialized.mutationFactor;
        sim.speedHistory = serialized.speedHistory;
        sim.sizeHistory = serialized.sizeHistory;
        sim.fitnessHistory = serialized.fitnessHistory;
        return sim;
    }

}
class Food {
    constructor(world,x,y, size=5){
        this.world = world;
        this.x = x;
        this.y = y;
        this.size = size;
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
        this.angle = Math.random() * 2 * Math.PI;
        this.angularVelocity = 0;
        this.score = 0;
        this.scanPosition = 0;
        this.targetRange = 0;
        this.calories = 120;
        this.visionFocus = 0;
        this.heartRate = 1;
        this.life = 100;
        this.minDistance = 1000;
        this.maxRange = 210;
        this.drag = 0.055;
        this.fov = 0.9 * Math.PI;
        this.turnSpeed = 0.008;
        this.size = Math.random() * 5 + 5;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.brain = new FishBrain([9,7,5,6]);
        this.speed = 0.8; //acceleration
        this.calorieCap = 1000;
    }
    
    update(){
        
        
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularVelocity;
        this.vx *= 1 - this.drag;
        this.vy *= 1 - this.drag;
        this.angularVelocity *= 1 - this.drag;

        //speed limit, trigonometry
        let speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if(speed > this.speed*1.5){
            this.vx *= this.speed*1.5 / speed;
            this.vy *= this.speed*1.5 / speed;
        }


        if(this.angle < 0) this.angle += 2 * Math.PI;
        if(this.angle > 2 * Math.PI) this.angle -= 2 * Math.PI;



        //eat food
        
        for(let i = 0; i < this.world.food.length; i++){
            let food = this.world.food[i];
            //let distance = Math.sqrt((food.x - this.x) ** 2 + (food.y - this.y) ** 2);
            let distanceSquared = (food.x - this.x) ** 2 + (food.y - this.y) ** 2;
            if(distanceSquared < 1 * ((this.size+food.size)**2)) {
                this.world.food.splice(i,1);
                this.score += food.size * 5;
                this.calories += food.size * 5;
                if(Math.random() > 0.2){
                this.world.food.push(new Food(this.world,this.world.width*Math.random(),this.world.height*Math.random()));
                }
            }
        }
        


        //actually apply a force to the fish pushing it back into the world, with a range of 3*radius
        if(this.x < 5 * this.size) {this.vx += 0.01 * (5 * this.size - this.x);}
        else if(this.x > this.world.width - 5 * this.size) {this.vx -= 0.01 * (this.x - (this.world.width - 5 * this.size));}
        if(this.y < 5 * this.size) {this.vy += 0.01 * (5 * this.size - this.y);}
        else if(this.y > this.world.height - 5 * this.size) {this.vy -= 0.01 * (this.y - (this.world.height - 5 * this.size));}
        


    }

    act(){
        
        //scanPosition is from -1 to 1, 0 being straight ahead, -1 being all the way left to this.fov, 1 being all the way right to this.fov
        //2pi fov means both -1 and 1 are straight behind the fish
        let scanRad = this.fov / 2 * this.scanPosition;
        
        //make sure that scanRad is between 0 and 2pi
        if(scanRad < 0) scanRad += 2 * Math.PI;
        if(scanRad > 2 * Math.PI) scanRad -= 2 * Math.PI;
        let tmp = [];
        if(this.targetRange>0){
        tmp = this.world.scan(this,scanRad,this.targetRange);
        } else {
            tmp = [0,0];
        }


        let inputData = [...tmp,1/(this.minDistance+1),this.scanPosition,this.calories/this.calorieCap, Math.sin(this.heartRate*this.world.tick*0.01),this.life/100, this.targetRange/this.maxRange,this.visionFocus*2];
        this.minDistance = 100000;
        
        let output = this.brain.think(inputData);
        

        //make sure output is between limits for [angle,speed]
        if(output[0] < -1) output[0] = -1;	
        if(output[0] > 1) output[0] = 1;
        if(output[1] < -1) output[1] = -1;
        if(output[1] > 1) output[1] = 1;
        if(output[2] < -1) output[2] = -1;
        if(output[2] > 1) output[2] = 1;
        if(output[3] < -1) output[3] = -1;
        if(output[3] > 1) output[3] = 1;
        if(output[4] < -1) output[4] = -1;
        if(output[4] > 1) output[4] = 1;
        if(output[5] < -1) output[5] = -1;
        if(output[5] > 1) output[5] = 1;
        
        this.targetRange += output[4]*this.maxRange*0.1;
        if(this.targetRange < 0.1) this.targetRange = 0.1;
        if(this.targetRange > this.maxRange) this.targetRange = this.maxRange;
        if(this.targetRange > 0) this.calories -= (this.targetRange/this.maxRange)*0.1;
        
        this.visionFocus += output[5]*0.03;
        if(this.visionFocus < 0.01) this.visionFocus = 0.01;
        if(this.visionFocus > 0.5) this.visionFocus = 0.5;
        this.calories -= this.visionFocus*0.06;
        
        
        this.scanPosition += output[2]*this.turnSpeed*4;
        if(this.scanPosition < -1) this.scanPosition = -1;
        if(this.scanPosition > 1) this.scanPosition = 1;

        this.heartRate += output[3]*0.1;
        if(this.heartRate < 0.4) this.heartRate = 0.4;
        if(this.heartRate > 3) this.heartRate = 3;



        this.angularVelocity += output[0] * this.turnSpeed;
        this.vx += Math.cos(this.angle) * (this.heartRate*this.speed*output[1]);
        this.vy += Math.sin(this.angle) * (this.heartRate*this.speed*output[1]);

        //depends on max speed and size, fast + big = inefficient
        let sizeSpeed = this.speed * (this.size*0.2);

        this.calories -= (this.heartRate**2)*sizeSpeed * (Math.abs(output[1])+Math.abs(output[0]))**2;

        //heal using calories if life is below max, higher heart rate means more healing
        if(this.life < 100) {
            this.life += this.heartRate * 0.3;
            this.calories -= this.heartRate * 0.3;
        }


        if(this.calories < 0 || this.life < 0) {
            //turn into food
            this.world.fishes.splice(this.world.fishes.indexOf(this),1);
            this.world.food.push(new Food(this.world,this.x,this.y, this.size));
        }

    }
    pair(other){
        let child = new Fish(this.world,this.world.width*Math.random(),this.world.height*Math.random());


        //average or select size, 0.3 chance average
        if(Math.random()>0.7){
        child.size = (this.size + other.size) / 2;
        }else{
        child.size = Math.random() > 0.5 ? this.size : other.size;
        }

        //average or select speed, 0.3 chance average
        if(Math.random()>0.7){
        child.speed = (this.speed + other.speed) / 2;
        }else{
        child.speed = Math.random() > 0.5 ? this.speed : other.speed;
        }


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


        if(Math.random() < 0.8) child.mutate(this.world.mutationFactor);
        return child;
    }
    mutate(factor){

        //mutate size
        this.size += Math.random() * factor - factor / 2;
        if(this.size < 5) this.size = 5;

        //mutate speed
        this.speed += Math.random() * factor - factor / 2;
        if(this.speed < 0.1) this.speed = 0.1;
        //upper bound is 10
        if(this.speed > 10) this.speed = 10;

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
        clone.drag = this.drag;
        clone.scanPosition = this.scanPosition;

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
            //if(this.world.fishes[inspectedFish] == this) {
            
                //if targetRange is negative, return
                if(this.targetRange < 0) return;

                let scanRad = this.fov / 2 * this.scanPosition;
        
                //make sure that scanRad is between 0 and 2pi
                if(scanRad < 0) scanRad += 2 * Math.PI;
                if(scanRad > 2 * Math.PI) scanRad -= 2 * Math.PI;
        
            let scanResult = this.world.scan(this,scanRad, this.targetRange);
            ctx.strokeStyle = "rgba("+ scanResult[0]*25+","+ scanResult[1]*255 +",0,0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();            
            //its actually a pie slice going from -pi/32 to pi/32, draw two arcs
            ctx.lineTo(this.x,this.y);
            ctx.arc(this.x,this.y,this.targetRange,this.angle + this.fov / 2 * this.scanPosition - Math.PI*this.visionFocus,this.angle + this.fov / 2 * this.scanPosition + Math.PI*this.visionFocus);
            ctx.lineTo(this.x,this.y);
            //from both ends of the arc, draw a line to the center
            

            
            ctx.stroke();
        //}

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
            scanPosition: this.scanPosition,
            calories: this.calories,
            life: this.life,
            maxRange: this.maxRange,
            targetRange: this.targetRange,
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
        fish.scanPosition = serialized.scanPosition;
        fish.calories = serialized.calories;
        fish.life = serialized.life;
        fish.maxRange = serialized.maxRange;
        fish.targetRange = serialized.targetRange;
        return fish;
    }

}

