


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
        this.furHistory = [];
        this.generation = 0;
        this.tick = 0;
        this.crossover = true;
        this.mutationFactor = 0.25;
        this.temperatureMap = [];
        this.fishMap = [];
        this.foodMap = [];
        let numSquares = 9;
        this.numSquares = numSquares;
        //populate map
        for (let i = 0; i < numSquares+1; i++) {
            this.fishMap.push([]);
            this.foodMap.push([]);
            this.temperatureMap.push([]);
            for (let j = 0; j < numSquares+1; j++) {
                this.fishMap[i].push([]);
                this.foodMap[i].push([]);
                this.temperatureMap[i].push(10+(40/(1+i+j)));
            }
        }
        //populate food
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
        for (let i = 0; i < numFish; i++) {
            this.fishes.push(new Fish(this,Math.random() * this.width, Math.random() * this.height));
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

    scan(fish,range,channels){
        
        let numSquares = this.numSquares;
        let squareWidth = this.width/numSquares;
        let squareHeight = this.height/numSquares;
        let x = Math.floor(fish.x/squareWidth);
        let y = Math.floor(fish.y/squareHeight);
        x = Math.max(0,Math.min(x,numSquares-1));
        y = Math.max(0,Math.min(y,numSquares-1));
        let fishArray = [];
        let foodArray = [];
        //if range is able to leave current square from the fish's position, do the neighborhood check- otherwise, just check the current square
        if(range > (fish.x - x*squareWidth) && range > (fish.y - y*squareHeight) && range > (squareWidth - (fish.x - x*squareWidth)) && range > (squareHeight - (fish.y - y*squareHeight))){
            fishArray.push(...this.fishMap[x][y]);
            foodArray.push(...this.foodMap[x][y]);

        }else{
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++){
                if(x+i < 0 || x+i >= numSquares || y+j < 0 || y+j >= numSquares) continue;
                fishArray.push(...this.fishMap[x+i][y+j]);
                foodArray.push(...this.foodMap[x+i][y+j]);
            }
        }
        }
        
        //raycast channels rays, spacing them evenly in fov
        //exclude self
        fishArray.splice(fishArray.indexOf(fish),1);
        let foodView = [];
        let fishView = [];
        //fill with 0s
        for (let i = 0; i < channels; i++) {
            foodView.push(0);
            fishView.push(0);
        }

        
        //go through all fish and sort their angle into a channel, if intersects
        for (let i = 0; i < fishArray.length; i++) {
            let otherFish = fishArray[i];
            let rayLength = Math.sqrt((otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2);
            if(rayLength > range) continue;
            
            //the other fish is a circle- check if the ray intersects the circle

            //get the angle of the ray
            let angle = Math.atan2(otherFish.y - fish.y, otherFish.x - fish.x);
            //get the angle of the ray relative to the fish's angle
            let relativeAngle = angle - fish.angle;
            //make sure that the angle is between -pi and pi
            if(relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
            if(relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
            //make sure that the angle is within the fov
            if(Math.abs(relativeAngle) > fish.fov / 2) continue;
            //get the channel
            let channel = Math.round((relativeAngle + fish.fov / 2) / fish.fov * channels);
            //make sure that the channel is within the range
            if(channel < 0) channel = 0;
            if(channel >= channels) channel = channels - 1;
            //add the fish's size to the channel
            fishView[channel] += (1 - (rayLength / range)) * (otherFish.size / fish.size);
        }
        //go through all food and sort their angle into a channel, if intersects
        for (let i = 0; i < foodArray.length; i++) {
            let food = foodArray[i];
            let rayLength = Math.sqrt((food.x - fish.x) ** 2 + (food.y - fish.y) ** 2);
            if(rayLength > range) continue;
            
            //the food is a circle- check if the ray intersects the circle
            
            //get the angle of the ray
            let angle = Math.atan2(food.y - fish.y, food.x - fish.x);
            //get the angle of the ray relative to the fish's angle
            let relativeAngle = angle - fish.angle;
            //make sure that the angle is between -pi and pi
            if(relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
            if(relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
            //make sure that the angle is within the fov
            if(Math.abs(relativeAngle) > fish.fov / 2) continue;
            //get the channel
            let channel = Math.round((relativeAngle + fish.fov / 2) / fish.fov * channels);
            //make sure that the channel is within the range
            if(channel < 0) channel = 0;
            if(channel >= channels) channel = channels - 1;
            //add the food's size to the channel
            foodView[channel] += (1 - (rayLength / range)) * (food.size / fish.size);
        }

         


            /*
            if(rayHit){
                inspectedFish = this.fishes.indexOf(fish);
                if(rayFish != null) fishView[i] = (1 - (rayLength / range)) * (rayFish.size / fish.size);
                if(rayFood != null) foodView[i] = (1 - (rayLength / range)) * (rayFood.size / fish.size);
            }
            */

        let result = [...fishView,...foodView];

        return result;


    }

    update(){

        //spawn food every 700 ticks
        if(this.tick % 500 == 0){
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }


        let numSquares = this.numSquares;
        let squareWidth = this.width/numSquares;
        let squareHeight = this.height/numSquares;

        //assume that the maximum size of a fish is 40, split the map into 40x40 squares
        for (let i = 0; i < numSquares+1; i++) {
            for (let j = 0; j < numSquares+1; j++) {
                //empty out the map
                this.fishMap[i][j] = [];
                this.foodMap[i][j] = [];
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
            //make sure that not nan
             
            this.fishMap[x][y].push(fish);
            
        }
        //sort food into map
        for (let i = 0; i < this.food.length; i++) {
            let food = this.food[i];
            let x = Math.floor(food.x/squareWidth);
            let y = Math.floor(food.y/squareHeight);
            x = Math.max(0,Math.min(x,numSquares-1));
            y = Math.max(0,Math.min(y,numSquares-1));
            this.foodMap[x][y].push(food);
        }
        


        for (let i = 0; i < this.fishes.length; i++){
        this.fishes[i].update();
        if(this.tick % 8 == 0) this.fishes[i].act();
        }
        let map = this.fishMap;

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
                       

                    }
                }
            }
        }

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
        
        //draw the map
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        let squareWidth = this.width/this.numSquares;
        let squareHeight = this.height/this.numSquares;
        for (let i = 0; i < this.numSquares; i++) {
            for (let j = 0; j < this.numSquares; j++) {
                //faint temperature map, less than 25 is blue, more than 25 is red
                let temperature = this.temperatureMap[i][j];
                let color = "rgba(" + Math.floor(255 * (temperature / 40)) + ",0," + Math.floor(255 * (1 - temperature / 40)) + ",0.325)";
                ctx.fillStyle = color;


                ctx.fillRect(i*squareWidth,j*squareHeight,squareWidth,squareHeight);
                ctx.strokeRect(i*squareWidth,j*squareHeight,squareWidth,squareHeight);

            }
        }
        


    }
    mutate(factor){
        for (let i = 0; i < this.fishes.length; i++) {
            if(Math.random()>0.2)this.fishes[i].mutate(factor);
        }
    }

    evolve(fraction=0.5){
        this.generation++;
        
        //get the top 10% of fishes
        let sortedFishes = this.fishes.sort((a,b) => b.score - a.score);
        
        let topFishes = sortedFishes.slice(0,Math.floor(this.fishes.length * fraction));
        
        //check if length is 0, if so, just return
        if(topFishes.length == 0) return;


        
        if(this.generation%60==0){
        this.mutationFactor*=0.94;
        let layer = 1;
        if(this.generation<400){
        topFishes.forEach(fish => fish.brain.expand(layer));
        this.mutate(0.3);    
        }
        }

        this.fitnessHistory[this.generation]=(this.fishes.length);
        this.sizeHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].size);
        this.speedHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].speed);
        this.furHistory[this.generation]=(topFishes[Math.floor(topFishes.length / 2)].furThickness);
        return;

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
        /*

        for (let i = 0; i < this.numFish; i++) {
            newFishes[i].x = this.width / 2 + Math.cos(i / this.numFish * 2 * Math.PI) * (this.width-40) / 2;
            newFishes[i].y = this.height / 2 + Math.sin(i / this.numFish * 2 * Math.PI) * (this.height-25) / 2;
        }
        */
       //spread randomly
         for (let i = 0; i < this.numFish; i++) {
            newFishes[i].x = Math.random() * this.width;
            newFishes[i].y = Math.random() * this.height;
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

    }

    serialize(){
        return {
            fishes: this.fishes.map(fish => fish.serialize()),
            food: this.food.map(food => food.serialize()),
            fitnessHistory: this.fitnessHistory,
            speedHistory: this.speedHistory,
            furHistory: this.furHistory,
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
        sim.furHistory = serialized.furHistory;
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
        this.drag = 0.055;
        this.turnSpeed = 0.032;
        
        
        this.visionFocus = 0;
        this.targetRange = 0;
        this.maxRange = this.world.width/this.world.numSquares;
        this.fov = 0.9 * Math.PI;
        this.calories = 120;
        this.calorieCap = 1000;
        
        this.life = 100;
        this.age = 0;
        this.targetTemperature = 37;
        this.bodyTemperature = 37;
        this.furThickness = 1;
        this.heartRate = 1;
        
        this.size = Math.random() * 5 + 5;
        this.brain = new FishBrain([14+3,9,5+3]);
        this.speed = 0.8; //acceleration
        
        this.memory = [0,0,0]; //useless?
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.score = 0;
    }
    
    update(){
        
        this.x += this.vx;
        this.y += this.vy;
        //log vx, vy if anything is nan
        if(isNaN(this.vx) || isNaN(this.vy)){
            console.log(this.vx,this.vy);
            //un-nan everything
            this.vx = 0;
            this.vy = 0;
            this.angle = 0;
            this.angularVelocity = 0;
            inspectedFishObj = this;
        
        }

        this.angle += this.angularVelocity;
        
        this.vx *= 1 - this.drag;
        this.vy *= 1 - this.drag;
        this.angularVelocity *= 1 - this.drag;

        


        if(this.angle < 0) this.angle += 2 * Math.PI;
        if(this.angle > 2 * Math.PI) this.angle -= 2 * Math.PI;



        //eat food
        let possibleFood = [];
        let numSquares = this.world.numSquares;
        let squareWidth = this.world.width/numSquares;
        let squareHeight = this.world.height/numSquares;
        let x = Math.floor(this.x/squareWidth);
        let y = Math.floor(this.y/squareHeight);
        x = Math.max(0,Math.min(x,numSquares-1));
        y = Math.max(0,Math.min(y,numSquares-1));
        
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++){
                if(x+i < 0 || x+i >= numSquares || y+j < 0 || y+j >= numSquares) continue;
                possibleFood.push(...this.world.foodMap[x+i][y+j]);
            }
        }


        for(let i = 0; i < possibleFood.length; i++){
            let food = possibleFood[i];
            let distanceSquared = (food.x - this.x) ** 2 + (food.y - this.y) ** 2;
            if(distanceSquared < 1 * ((this.size+food.size)**2)) {
                this.world.food.splice(this.world.food.indexOf(food),1);
                this.score += food.size * 5;
                this.calories += food.size * 5;

            }
        }
        


        //actually apply a force to the fish pushing it back into the world, with a range of 3*radius
        if(this.x < 5 * this.size) {this.vx += 0.01 * (5 * this.size - this.x);}
        else if(this.x > this.world.width - 5 * this.size) {this.vx -= 0.01 * (this.x - (this.world.width - 5 * this.size));}
        if(this.y < 5 * this.size) {this.vy += 0.01 * (5 * this.size - this.y);}
        else if(this.y > this.world.height - 5 * this.size) {this.vy -= 0.01 * (this.y - (this.world.height - 5 * this.size));}
        
    }

    act(){     
        let lastCalories = this.calories;
        let tmp = [];
        if(this.targetRange>0){
        tmp = this.world.scan(this,this.targetRange,4);
        } else {
            tmp = [0,0,0,0,0,0,0,0];
        }

        //let ambientTemp = this.world.temperatureMap[Math.floor(this.x/this.world.width*this.world.numSquares)][Math.floor(this.y/this.world.height*this.world.numSquares)];
        //get ambient temperature size*2 away in the direction of the fish's angle, but check for bounds
        let ambientTemp = 0;
        let x = this.x + Math.cos(this.angle) * this.targetRange;
        let y = this.y + Math.sin(this.angle) * this.targetRange;
        if(x < 0 || x > this.world.width || y < 0 || y > this.world.height){
            ambientTemp = this.world.temperatureMap[Math.floor(Math.max(this.x,0)/this.world.width*this.world.numSquares)][Math.floor(Math.max(this.y,0)/this.world.height*this.world.numSquares)];
        }else{
            ambientTemp = this.world.temperatureMap[Math.floor(Math.max(x,0)/this.world.width*this.world.numSquares)][Math.floor(Math.max(y,0)/this.world.height*this.world.numSquares)];
        }


        let inputData = [...tmp, //8
        this.calories/this.calorieCap, //1
        Math.sin(this.heartRate*this.world.tick*0.01), //1
        this.life*0.01, //1
        this.targetRange/this.maxRange, //1,
        //body temp - target temp
        (this.bodyTemperature - this.targetTemperature)/5, //1
        ambientTemp/40, //1
        this.memory[0], //1
        this.memory[1], //1
        this.memory[2] //1
        ];
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
        
        this.memory[0] = Math.sin(output[5]);
        this.memory[1] = output[6];
        this.memory[2] = output[7];
        
        this.targetRange += output[4]*this.maxRange*0.1;
        if(this.targetRange < 44) this.targetRange = 44;
        if(this.targetRange > this.maxRange) this.targetRange = this.maxRange;
        if(this.targetRange > 0) this.calories -= (this.targetRange/this.maxRange)*0.01;
        
        this.heartRate += output[3]*0.1;
        if(this.heartRate < 0.4) this.heartRate = 0.4;
        if(this.heartRate > 3) this.heartRate = 3;



        this.angularVelocity += output[0] * this.turnSpeed;
        this.vx += Math.cos(this.angle) * (this.heartRate*this.speed*output[1]);
        this.vy += Math.sin(this.angle) * (this.heartRate*this.speed*output[1]);

        //depends on max speed and size, fast + big = inefficient
        let sizeSpeed = this.speed * (this.size*0.2);

        this.calories -= (this.heartRate**2)*sizeSpeed * (Math.abs(output[1])+Math.abs(output[0]))**2;

        this.calories -= 0.1;

        //life damage from temperature
        this.life -= Math.abs(this.bodyTemperature - this.targetTemperature) * 0.005;

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

        //get amount of calories burned, calculate body temperature
        let caloriesBurned = (lastCalories - this.calories);
        
        //assume that heat capacity is area
        let heatCapacity = Math.PI*this.size**2;
        let surface = 2*Math.PI*this.size;
        //increase according to burnt calories
        this.bodyTemperature += caloriesBurned/heatCapacity;
        let heatTransfer = (this.bodyTemperature - ambientTemp) * surface * 1/this.furThickness;
        this.bodyTemperature -= heatTransfer/heatCapacity;
        
        //increase age
        this.age += 0.1;

        //if age above 100 and space available, reproduce asexually
        if(this.age > 100 && this.world.fishes.length+6 < this.world.numFish){
            for (let i = 0; i < 5; i++) {
                let child = this.clone();
                child.mutate(this.world.mutationFactor);
                this.world.fishes.push(child);
            }
        }
        //if numFish/10 are left, reproduce forcefully
        if(this.world.fishes.length < this.world.numFish/10){
            for (let i = 0; i < 3; i++) {
                let child = new Fish(this.world,this.x,this.y);
                //randomize xy
                child.x = Math.random() * this.world.width;
                child.y = Math.random() * this.world.height;
                child.mutate(1);
                this.world.fishes.push(child);
            }
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
        //fur
        if(Math.random()>0.7){
        child.furThickness = (this.furThickness + other.furThickness) / 2;
        }else{
        child.furThickness = Math.random() > 0.5 ? this.furThickness : other.furThickness;
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
        //mutate fur
        this.furThickness += Math.random() *0.2* (factor - factor / 2);

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

        return clone;
    }
    draw(ctx){
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.size,0,2 * Math.PI);
            ctx.fill();
            //draw fish eye in direction it is facing
            
            //draw body temp vs target temp, shift eye color
            ctx.fillStyle = "rgb(" + Math.floor((this.bodyTemperature - this.targetTemperature)/5*255) + "," + Math.floor((this.targetTemperature - this.bodyTemperature)/5*255) + ",0)";
            ctx.beginPath();
            ctx.arc(this.x + Math.cos(this.angle) * (this.size*0.6),this.y + Math.sin(this.angle) * (this.size*0.6),this.size/3,0,2 * Math.PI);
            ctx.fill();
            //draw fur
            ctx.fillStyle = "rgb(" + Math.floor((this.bodyTemperature - this.targetTemperature)/5*255) + "," + Math.floor((this.targetTemperature - this.bodyTemperature)/5*255) + ",0)";
            ctx.beginPath();
            ctx.arc(this.x + Math.cos(this.angle) * (this.size*0.6),this.y + Math.sin(this.angle) * (this.size*0.6),this.size/3*this.furThickness,0,2 * Math.PI);
            ctx.fill();



        //draw scan rays and indicate hit
        let tmp = this.world.scan(this,this.targetRange,4);
        //draw rays
        for (let i = 0; i < tmp.length/2; i++) {
            let angle = this.angle - this.fov/2 + i * this.fov / (tmp.length/2-1);
            //color depends on tmp value
            let color = "rgb(" + Math.floor((1-tmp[i])*255) + "," + Math.floor((1-tmp[i+tmp.length/2])*255) + ",0)";
            ctx.strokeStyle = color;

        
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.x + Math.cos(angle) * this.targetRange,this.y + Math.sin(angle) * this.targetRange);
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
        fish.calories = serialized.calories;
        fish.life = serialized.life;
        fish.maxRange = serialized.maxRange;
        fish.targetRange = serialized.targetRange;
        return fish;
    }

}

