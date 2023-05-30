


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
        this.fishMap = [];
        this.foodMap = [];
        let numSquares = 5;
        this.numSquares = numSquares;
        //populate map
        for (let i = 0; i < numSquares; i++) {
            this.fishMap.push([]);
            this.foodMap.push([]);
            for (let j = 0; j < numSquares; j++) {
                this.fishMap[i].push([]);
                this.foodMap[i].push([]);
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

    scan(fish,range){
        

        //return format: [fish1angle,fish1intens,fish2angle,fish2intens,food1angle,food1intens,food2angle,food2intens]
        let numSquares = this.numSquares;
        let squareWidth = this.width/numSquares;
        let squareHeight = this.height/numSquares;
        let x = Math.floor(fish.x/squareWidth);
        let y = Math.floor(fish.y/squareHeight);
        x = Math.max(0,Math.min(x,numSquares-1));
        y = Math.max(0,Math.min(y,numSquares-1));
        let fishArray = [];
        let foodArray = [];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++){
                if(x+i < 0 || x+i >= numSquares || y+j < 0 || y+j >= numSquares) continue;
                fishArray.push(...this.fishMap[x+i][y+j]);
                foodArray.push(...this.foodMap[x+i][y+j]);
            }
        }
        //sort by distance
        fishArray.sort((a,b) => (a.x - fish.x)**2 + (a.y - fish.y)**2 - (b.x - fish.x)**2 - (b.y - fish.y)**2);
        foodArray.sort((a,b) => (a.x - fish.x)**2 + (a.y - fish.y)**2 - (b.x - fish.x)**2 - (b.y - fish.y)**2);
        //filter by range and being within fov
        fishArray = fishArray.filter(other => (other.x - fish.x)**2 + (other.y - fish.y)**2 < range**2 && Math.abs(Math.atan2(other.y - fish.y, other.x - fish.x) - fish.angle) < fish.fov / 2);
        foodArray = foodArray.filter(other => (other.x - fish.x)**2 + (other.y - fish.y)**2 < range**2 && Math.abs(Math.atan2(other.y - fish.y, other.x - fish.x) - fish.angle) < fish.fov / 2);
        //return closest two fish and closest two food
        let result = [];
        for (let i = 0; i < 2; i++) {
            if(i < fishArray.length){
                let other = fishArray[i];
                result.push(Math.atan2(other.y - fish.y, other.x - fish.x) - fish.angle);
                result.push(1 - Math.sqrt((other.x - fish.x)**2 + (other.y - fish.y)**2) / range);
            }else{
                result.push(0);
                result.push(0);
            }
        }
        for (let i = 0; i < 2; i++) {
            if(i < foodArray.length){
                let other = foodArray[i];
                result.push(Math.atan2(other.y - fish.y, other.x - fish.x) - fish.angle);
                result.push(1 - Math.sqrt((other.x - fish.x)**2 + (other.y - fish.y)**2) / range);
            }else{
                result.push(0);
                result.push(0);
            }
        }
        return result;


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
            //console.log(x,y,squareWidth,squareHeight);
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
        this.targetRange = 0;
        this.calories = 120;
        this.visionFocus = 0;
        this.heartRate = 1;
        this.life = 100;
        this.maxRange = this.world.width/this.world.numSquares;
        this.drag = 0.055;
        this.fov = 0.9 * Math.PI;
        this.turnSpeed = 0.008;
        this.size = Math.random() * 5 + 5;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.brain = new GeneticNetwork([12,5]);
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
            //let distance = Math.sqrt((food.x - this.x) ** 2 + (food.y - this.y) ** 2);
            let distanceSquared = (food.x - this.x) ** 2 + (food.y - this.y) ** 2;
            if(distanceSquared < 1 * ((this.size+food.size)**2)) {
                this.world.food.splice(this.world.food.indexOf(food),1);
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
        let tmp = [];
        if(this.targetRange>0){
        tmp = this.world.scan(this,this.targetRange);
        } else {
            tmp = [0,0,0,0,0,0,0,0];
        }


        let inputData = [...tmp, //8
        this.calories/this.calorieCap, //1
        Math.sin(this.heartRate*this.world.tick*0.01), //1
        this.life/100, //1
        this.targetRange/this.maxRange, //1
        ];
        //length 12
        
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
        
        this.targetRange += output[4]*this.maxRange*0.1;
        if(this.targetRange < 0.1) this.targetRange = 0.1;
        if(this.targetRange > this.maxRange) this.targetRange = this.maxRange;
        if(this.targetRange > 0) this.calories -= (this.targetRange/this.maxRange)*0.1;
        
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

            //draw fov
            if(this.targetRange > 0){
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.targetRange, this.angle - this.fov/2, this.angle + this.fov/2);
            

            
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

