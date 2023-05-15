class Simulation {
    constructor(numFish) {
        this.numFood = 50;
        this.width = 800;
        this.height = 800;
        this.numFish = numFish;
        this.fishes = [];
        this.food = [];
        this.workers = [];
        for (let i = 0; i < numFish; i++) {
            this.fishes.push(new Fish(this,Math.random() * this.width, Math.random() * this.height));
        }
        
        //populate food
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
    }
    fishIntensities(fish,channels){
        let intensities = [];
        for (let i = 0; i < channels*2; i++) {
            intensities[i]=0;
        }
        
        for (let i = 0; i < this.fishes.length; i++) {
            let otherFish = this.fishes[i];
            if(otherFish == fish) continue;
            let angle = Math.atan2(otherFish.y - fish.y, otherFish.x - fish.x) - fish.angle;
            if(angle < 0) angle += 2 * Math.PI;
            let channel = Math.floor(angle / (2 * Math.PI / channels));
            if(channel >= channels) continue;
            let distance = Math.sqrt((otherFish.x - fish.x) ** 2 + (otherFish.y - fish.y) ** 2);
            if(distance > 400) continue;
            if(distance==0){distance=0.0001};

            intensities[channel] += 1 / distance;
        }
        
        //food
        for (let i = channels; i < channels*2; i++) {
            intensities[i] = 0;
        }
        for(let i = 0; i < this.food.length; i++){
            let food = this.food[i];
            let angle = Math.atan2(food.y - fish.y, food.x - fish.x) - fish.angle;
            if(angle < 0) angle += 2 * Math.PI;
            let channel = Math.floor(angle / (2 * Math.PI / channels));
            if(channel >= channels) continue;
            let distance = Math.sqrt((food.x - fish.x) ** 2 + (food.y - fish.y) ** 2);
            if(distance > 400) continue;
            if(distance==0){distance=0.0001};
            if(isNaN(channel)) continue;
            intensities[channel+channels] += 1 / distance;
        }

        
        return intensities;
    }
update(){
    for (let i = 0; i < this.fishes.length; i++) {
        this.fishes[i].act();
        //wrap around
        if(this.fishes[i].x < -5) this.fishes[i].x += this.width;
        if(this.fishes[i].x > this.width+5) this.fishes[i].x -= this.width;
        if(this.fishes[i].y < -5) this.fishes[i].y += this.height;
        if(this.fishes[i].y > this.height+5) this.fishes[i].y -= this.height;

    }

    //if no food, evolve
        if(this.food.length == 0&&this.numFood>0) {
            this.evolve();
            generation++;
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
            if(Math.random()>0.7)this.fishes[i].mutate();
        }
    }

    evolve(){
        //get the top 10% of fishes
        let sortedFishes = this.fishes.sort((a,b) => b.score - a.score);
        let topFishes = sortedFishes.slice(0,Math.floor(this.fishes.length / 15));
        
        
        let newFishes = [];
        //randomly match top fish and pair them to create numFish new fishes
        for (let i = 0; i < this.numFish; i++) {
            let fish1 = topFishes[Math.floor(Math.random() * topFishes.length)];
            let fish2 = topFishes[Math.floor(Math.random() * topFishes.length)];
            newFishes.push(fish1.pair(fish2));
        }
        newFishes[0]=(new Fish(this,this.width*Math.random(),this.height*Math.random()));
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

        this.fishes = newFishes;

        //reset food
        this.food = [];
        for (let i = 0; i < this.numFood; i++) {
            this.food.push(new Food(this,Math.random() * this.width, Math.random() * this.height));
        }
        let json = {};
        json.width = this.width;
        json.height = this.height;
        json.numFood = this.numFood;
        json.numFish = this.numFish;
        json.fishes = [];
        json.food = [];
        for (let i = 0; i < this.fishes.length; i++) {
            let fish = this.fishes[i];
            let jsonFish = {};
            jsonFish.x = fish.x;
            jsonFish.y = fish.y;
            jsonFish.angle = fish.angle;
            jsonFish.speed = fish.speed;
            jsonFish.turnSpeed = fish.turnSpeed;
            jsonFish.size = fish.size;
            jsonFish.color = fish.color;
            jsonFish.score = fish.score;
            jsonFish.sensorDirections = fish.sensorDirections;
            jsonFish.brain = {};
            jsonFish.brain.layerShape = fish.brain.layerShape;
            jsonFish.brain.weights = fish.brain.weights;
            jsonFish.brain.biases = fish.brain.biases;
            json.fishes.push(jsonFish);
        }
        for (let i = 0; i < this.food.length; i++) {
            let food = this.food[i];
            let jsonFood = {};
            jsonFood.x = food.x;
            jsonFood.y = food.y;
            json.food.push(jsonFood);
        }
        return json;
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
}


class Fish {
    constructor(world,x,y){
        this.world = world;
        this.x = x;
        this.y = y;
        this.angle = Math.random() * 2 * Math.PI;
        this.turnSpeed = 0.1;
        this.size = 10;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.score = 0;
        this.sensorDirections = 8;
        this.brain = new FishBrainGPU();
        this.speed = 4.5;
    }
    act(){
        let intensities = this.world.fishIntensities(this,this.sensorDirections);
        let output = this.brain.think(intensities);
        //make sure output is between limits for [angle,speed]
        if(output[0] < -1) output[0] = -1;	
        if(output[0] > 1) output[0] = 1;
        if(output[1] < -1) output[1] = -1;
        if(output[1] > 1) output[1] = 1;

        if(output[1]<0.05) {this.score -= 0.01;}
        this.angle += output[0] * this.turnSpeed;
        //make sure angle is between 0 and 2pi
        if(this.angle < 0) this.angle += 2 * Math.PI;
        if(this.angle > 2 * Math.PI) this.angle -= 2 * Math.PI;

        let oldX = this.x;
        let oldY = this.y;
        this.x += Math.cos(this.angle) * (this.speed*output[1]);
        this.y += Math.sin(this.angle) * (this.speed*output[1]);
        let minDistance = Infinity;
        let otherAngle = 0;
        for(let i = 0; i < this.world.fishes.length; i++) {
            let otherFish = this.world.fishes[i];
            if(otherFish == this) continue;
            let distance = Math.sqrt((otherFish.x - this.x) ** 2 + (otherFish.y - this.y) ** 2);
            if(distance < minDistance) {minDistance = distance; otherAngle = Math.atan2(otherFish.y - this.y, otherFish.x - this.x)};
        }

        if (minDistance < 2*this.size) {this.score -=0.5;this.x = oldX;this.y = oldY; this.x+=Math.cos(-otherAngle);this.y+=Math.sin(-otherAngle);};

        //close proximity to wall bad
        if(this.x < 5) this.score -= 1;
        if(this.x > this.world.width - 5) this.score -= 1;
        if(this.y < 5) this.score -= 1;
        if(this.y > this.world.height - 5) this.score -= 1;

        //this.score += fishCountReward;

        //eat food
        for(let i = 0; i < this.world.food.length; i++){
            let food = this.world.food[i];
            let distance = Math.sqrt((food.x - this.x) ** 2 + (food.y - this.y) ** 2);
            if(distance < 1 * this.size) {
                this.world.food.splice(i,1);
                this.score += 100;
                if(Math.random() > 0.5){
                this.world.food.push(new Food(this.world,this.world.width*Math.random(),this.world.height*Math.random()));
                }
            }
        }

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


        if(Math.random() < 0.1) child.mutate();
        return child;
    }
    mutate(){
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

        this.brain.mutate(0.2);

    }
    clone(){
        let clone = new Fish(this.world,this.x,this.y);
        clone.angle = this.angle;
        clone.speed = this.speed;
        clone.turnSpeed = this.turnSpeed;
        clone.size = this.size;
        clone.color = this.color;
        clone.score = 0;
        clone.sensorDirections = this.sensorDirections;
        clone.brain = this.brain;
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
}

class FishBrain {
    constructor() {
        this.inputSize = 16;
        this.outputSize = 2;
        this.layerShape = [this.inputSize,12,this.outputSize];
        //count total number of nodes
        
        //all values from previous layer are multiplied by weights of their connections and added to all values of the next layer
        this.weights = [];
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            this.weights.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                this.weights[i].push([]);
                for (let k = 0; k < this.layerShape[i + 1]; k++) {
                    this.weights[i][j].push(Math.random() * 2 - 1);
                }
            }
        }
        this.biases = [];
        //biases for input and output layer are always 0
        for (let i = 0; i < this.layerShape.length; i++) {
            this.biases.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                if(i==0||i==this.layerShape.length-1) this.biases[i].push(0);
                else this.biases[i].push((Math.random() * 2 - 1)*0.0001);
            }
        }

        
        this.lastValues = [];
    }
    mutate(factor){
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    this.weights[i][j][k] += factor*(Math.random() * 2 - 1);
                    if(Math.random() < factor/10) this.weights[i][j][k] = (Math.random() * 2 - 1) * 0.5;
                }
            }
        }
        //bias mutation
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                this.biases[i][j] += (factor/5)*((Math.random() * 2 - 1)*0.001);
                if(Math.random() < factor/10) this.biases[i][j] = (Math.random() * 2 - 1) * 0.0001;
            }
        }
    }
    pair (other) {
        let child = new FishBrainGPU();
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    child.weights[i][j][k] = Math.random() < 0.5 ? this.weights[i][j][k] : other.weights[i][j][k];
                    if(Math.random() < 0.3) {
                        child.weights[i][j][k] = (this.weights[i][j][k] + other.weights[i][j][k]) / 2;
                    }
                    if(Math.random()<0.5){
                        child.weights[i][j][k] += (Math.random() * 2 - 1) * 0.09;
                    }
                    if(Math.random() < 0.05) {
                        child.weights[i][j][k] *=-1;
                    }
                }
            }
        }
        
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                child.biases[i][j] = Math.random() < 0.8 ? this.biases[i][j] : other.biases[i][j];
                if(Math.random() < 0.3) {
                    child.biases[i][j] = (this.biases[i][j] + other.biases[i][j]) / 2;
                }
            }
        }

        return child;
    }
    think (input) {
        if(input.length != this.inputSize) throw new Error("size does not match input size: "+ input.length);

        let values = [];
        for (let i = 0; i < this.layerShape.length; i++) {
            values.push(Array(this.layerShape[i]).fill(0));
        }
        values[0] = input;
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i]; j++) {
                for (let k = 0; k < this.layerShape[i + 1]; k++) {
                    //weight array is of shape [layer][node][next node]
                    let weightedValue = values[i][j] * this.weights[i][j][k];
                    let bias = this.biases[i][j];
                    values[i + 1][k] += activation(weightedValue + bias);
                }
            }
        }
        this.lastValues = values;
        return values[values.length - 1];
    }

    draw(ctx) {
        let height = ctx.canvas.height;
        let width = ctx.canvas.width;
        ctx.clearRect(0,0,width,height);
        let circleRadius = 10;

        //distribute nodes around layers of circles, output layer being in the center
        let centerX = width / 2;
        let centerY = height / 2;
        let outerRadius = width / 2 - circleRadius;
       //start with outermost layer, the input layer

        let layerX = [];
        let layerY = [];
        for (let i = 0; i < this.layerShape.length; i++) {
            layerX.push([]);
            layerY.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                let angle = j / this.layerShape[i] * 2 * Math.PI;
                layerX[i].push(centerX + Math.cos(angle) * outerRadius * (i+1) / this.layerShape.length);
                layerY[i].push(centerY + Math.sin(angle) * outerRadius * (i+1) / this.layerShape.length);
            }
        }

        //draw connections
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i]; j++) {
                for (let k = 0; k < this.layerShape[i + 1]; k++) {
                    ctx.strokeStyle = this.weights[i][j][k] > 0 ? "green" : "red";
                    ctx.lineWidth = Math.abs(this.weights[i][j][k]) * 5;
                    ctx.beginPath();
                    ctx.moveTo(layerX[i][j],layerY[i][j]);
                    ctx.lineTo(layerX[i+1][k],layerY[i+1][k]);
                    ctx.stroke();
                }
            }
        }

        //draw nodes
        for (let i = 0; i < this.layerShape.length; i++) {
            for (let j = 0; j < this.layerShape[i]; j++) {
                ctx.fillStyle = "black";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(layerX[i][j],layerY[i][j],circleRadius,0,2 * Math.PI);
                ctx.fill();
                //draw red or green circle around node depending on bias
                if(i > 0 && i < this.layerShape.length - 1) {
                    ctx.strokeStyle = this.biases[i-1][j] > 0 ? "green" : "red";
                    ctx.lineWidth = 2+(Math.abs(this.biases[i-1][j]) * 50);

                    ctx.beginPath();
                    ctx.arc(layerX[i][j],layerY[i][j],circleRadius*1.5,0,2 * Math.PI);
                    ctx.stroke();
                }

                //draw red or green circle in node depending on value
                try{
                ctx.fillStyle = this.lastValues[i][j] > 0 ? "green" : "red";
                ctx.beginPath();
                let value = Math.min(1.2,20*Math.abs(this.lastValues[i][j]));
                ctx.arc(layerX[i][j],layerY[i][j],circleRadius*value*0.5,0,2 * Math.PI);
                ctx.fill();
                } catch (error) {
                }

            }
        }
    }
    checksum(){
        let str = JSON.stringify(this);
        let sum = 0;
        for (let i = 0; i < str.length; i++) {
            sum += str.charCodeAt(i);
        }
        return sum;
}
}