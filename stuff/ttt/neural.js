class NeuralNetwork {
    constructor(layerShape, memorySize) {

        
        this.fitness = 0; //used for external access

        //clone
        this.layerShape = [];
        this.originalShape = [];


        for(let i = 0; i < layerShape.length; i++){
            this.layerShape.push(layerShape[i]);
            this.originalShape.push(layerShape[i]);
        }
        this.memorySize = memorySize;
        this.memory = [];
        for(let i = 0; i < this.memorySize; i++){
            this.memory.push(0);
        }

        this.layerShape[0] += this.memorySize;
        this.layerShape[this.layerShape.length-1] += this.memorySize;



        this.weights = [];
        this.biases = [];

        //these are 2d arrays
        //structure: this.weights[layer][node]

        //initialize weights and biases
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            this.weights.push([]);
            this.biases.push([]);
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                this.weights[i].push([]);
                for (let k = 0; k < this.layerShape[i]; k++) {
                    this.weights[i][j].push(Math.random() * 2 - 1);
                }
                this.biases[i].push(Math.random() * 2 - 1);
            }
        }
       
    }
    
    run(input) {
        //add memory to input
        input = input.concat(this.memory);
        //pad input with zeroes if too short
       

        let output = input;
        
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            let newOutput = [];
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                let sum = this.biases[i][j];
                
                for (let k = 0; k < this.layerShape[i]; k++) {
                    sum += this.weights[i][j][k] * output[k];
                }
                //newOutput.push(activate(sum));
                //dont activate last layer
                //check if last layer
                if(i == this.layerShape.length - 2){
                    newOutput.push(sum);
                }else{
                    //check if last layer
                    let activated = activate(sum);
                    newOutput.push(activated);

                }
            }
            output = newOutput;
        }
        //set this.memory to the last this.memorySize values of output
        //splice those values out of output
        this.memory = output.splice(output.length-this.memorySize,this.memorySize);
        return output;
    }
    



    mutate(rate) {
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                for (let k = 0; k < this.layerShape[i]; k++) {
                    
                    this.weights[i][j][k] += (Math.random() * 2 - 1)*rate;
                    //low chance to zero out
                    if(Math.random() < 0.01*rate){
                        this.weights[i][j][k] = 0;
                    }
                    
                }

                this.biases[i][j] += (Math.random() * 2 - 1)*rate;
                //low chance to zero out
                if(Math.random() < 0.001*rate){
                    this.biases[i][j] = 0;
                }
            }
        }
      


        this.fitness = 0;
    }
    clone() {
        
        let nn = new NeuralNetwork(this.originalShape, this.memorySize);
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                for (let k = 0; k < this.layerShape[i]; k++) {
                    nn.weights[i][j][k] = this.weights[i][j][k];
                }
                nn.biases[i][j] = this.biases[i][j];
            }
        }
        return nn;
    }
    crossover(nn) {
        let blendFactor = 0.5;
        let child = new NeuralNetwork(this.originalShape, this.memorySize);
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                for (let k = 0; k < this.layerShape[i]; k++) {
                    //weighted average of weights
                    //either parent's weight
                    child.weights[i][j][k] = (Math.random() < blendFactor)? this.weights[i][j][k]: nn.weights[i][j][k];
                    if(Math.random()<0.5){
                    child.weights[i][j][k] = blendFactor*this.weights[i][j][k] + (1-blendFactor)*nn.weights[i][j][k];
                    }
                }
                //weighted average of biases
                //either parent's bias
                child.biases[i][j] = (Math.random() < blendFactor)? this.biases[i][j]: nn.biases[i][j];
                if(Math.random()<0.5){
                child.biases[i][j] = blendFactor*this.biases[i][j] + (1-blendFactor)*nn.biases[i][j];
                }
            }
        }
        return child;
    }
    

    render(context, x, y, width, height) {
        //evenly space the nodes
        let nodeSpacing = width / (this.layerShape.length + 1);
        let nodeRadius = nodeSpacing / 5;
        let nodeYSpacing = height / (Math.max(...this.layerShape) + 1);
        let nodeYRadius = nodeYSpacing / 2;
        //draw nodes
        for (let i = 0; i < this.layerShape.length; i++) {
            for (let j = 0; j < this.layerShape[i]; j++) {
                context.beginPath();
                context.arc(x + nodeSpacing * (i + 1), y + nodeYSpacing * (j + 1), nodeRadius, 0, 2 * Math.PI, false);
                let isMemory = false;
                //if first or last layer, and the last memorySize nodes, color yellow
                if((i == 0 || i == this.layerShape.length-1) && j >= this.layerShape[i]-this.memorySize){
                    isMemory = true;
                }

                context.fillStyle = (isMemory)? 'yellow': 'green';
                context.fill();
                context.lineWidth = 5;
                context.strokeStyle = '#003300';
                context.stroke();
            }
        }
        //draw connections
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i + 1]; j++) {
                for (let k = 0; k < this.layerShape[i]; k++) {
                    //get weight
                    let weight = this.weights[i][j][k];
                    //set color, green if positive, red if negative
                    if (weight > 0) {
                        context.strokeStyle = 'green';
                    } else {
                        context.strokeStyle = 'red';
                    }
                    //set width, thicker if closer to 0
                    context.lineWidth = Math.abs(weight) * 4;
                    //draw line

                    context.beginPath();
                    context.moveTo(x + nodeSpacing * (i + 1), y + nodeYSpacing * (k + 1));
                    context.lineTo(x + nodeSpacing * (i + 2), y + nodeYSpacing * (j + 1));
                    context.stroke();
                }
            }
        }
        
        




        //label input nodes based on
        
        /*
        //this
        context.font = "21px Arial";
        //bold
        context.font = "bold " + context.font;
        context.fillStyle = "black";
        context.fillText("ball X", x, y + nodeYSpacing);
        context.fillText("ball Y", x, y + nodeYSpacing * 2);
        context.fillText("ball VX", x, y + nodeYSpacing * 3);
        context.fillText("ball VY", x, y + nodeYSpacing * 4);
        context.fillText("enemy Y", x, y + nodeYSpacing * 5);
        context.fillText("own Y", x, y + nodeYSpacing * 6);
        */



    }


    
}













function activate(value){
   //return Math.max(value,0);
    return swish(value)*0.7+Math.sign(value)*0.3;
}
function mish(value){
    return value*Math.tanh(Math.log(1+Math.exp(value)));
}
function pnap(x){
    return x>0.3?Math.cos(2*x)+Math.sign(x):Math.sin(3*x);

}


function leakyRelu(value){
    return Math.max(0.01*value,value);
}
function sigmoid(value){
    return 1/(1+Math.exp(-value));
}
function tanh(value){
    return Math.tanh(value);
}
function swish(value){
    return value*sigmoid(value);
}
function ohno(value){
    return (Math.floor(value*70)&69)/70;
}


class NNTrainer{
    constructor(memorySize=0){
        this.fitnessHistory = [];
        this.leaderboard = [];
        this.leaderboardSize = 4;
        this.survivalRate = 0.4;
        this.nets = [];
        this.population = 20;
        this.crossover = false;
        this.layerShape = [9,15,15,16,10,9];
        this.memorySize = memorySize;
        

        for(let i = 0; i < this.population; i++){
            this.nets.push(new NeuralNetwork(this.layerShape, this.memorySize));
            //this.nets.push(new NeuralNetwork(randomShape(5,2)));
        }
        this.generation = 0;
        this.bestNet = this.nets[0];

        this.learningRate = 0.01;
    }
    
    sortByFitness(){
        this.nets.sort((a,b) => (b.fitness) - (a.fitness));
    }
    prune(team2){

        //this.sortByFitness();
        //this.nets = this.nets.slice(0,Math.floor(this.nets.length*this.survivalRate));
            let maxTime = 1000;
            let time = 0;
            while(this.nets.length > this.population*this.survivalRate && time < maxTime){
            time++;
            //get a random net from this.nets
            let index1 = Math.floor(Math.random()*this.nets.length);
            let net1 = this.nets[index1];
            //get a random net from team2
            let net2 = team2.nets[Math.floor(Math.random()*team2.nets.length)];
            //break if net2 is null
            if(net2 == null){
                console.log("net2 is null");
                break;
            }
            if(net1 == null){
                console.log("net1 is null");
                break;
            }


            let match = new tttGame(net1,net2);
            let score = match.runUntilDead(10000);
            //kill loser
            if(score == 1){
                this.nets[index1].fitness +=0.5;
            }else if(score == -1){
                this.nets[index1].fitness -=2;
                net2.fitness +=0.5;
                //this.nets.splice(index1,1);
            }else{
                //this.nets.splice(index1,1);
                this.nets[index1].fitness -=1;
                net2.fitness +=1;
            }
            
        
            
            }
            
            

            //sort by fitness, then kill
            
            this.sortByFitness();
            
            this.nets = this.nets.slice(0,Math.floor(this.nets.length*this.survivalRate));

            this.bestNet = this.nets[0];
    }
    repopulate(){
        //add leaderboard to population
        for(let i = 0; i < this.leaderboard.length; i++){
            this.nets.push(this.leaderboard[i].clone());
        }

        while(this.nets.length < this.population){
            //crossover
            let nn1 = this.nets[Math.floor(Math.random()*this.nets.length)];
            let nn2 = this.nets[Math.floor(Math.random()*this.nets.length)];
            
            let nn = nn1.clone();
            if(this.crossover&&Math.random()<0.5){
                nn = nn1.crossover(nn2);
            }
            
            this.nets.push(nn);
        }
    }
    mutate(rate){
        //sort and mutate depending on fitness
        //loop through all
        for(let i = 0; i < this.nets.length; i++){
            this.nets[i].mutate(rate);
        }
    }
    evolve(team2){
        
        this.mutate(this.learningRate);
        this.repopulate();
        this.prune(team2);
        //store best fitness
        this.fitnessHistory.push(this.bestNet.fitness);
        
        //check if new best
        //if nothing to check, just add
        if(this.leaderboard.length == 0){
            this.leaderboard.push(this.bestNet.clone());
        }

        if(this.bestNet.fitness > this.leaderboard[0].fitness){
            //shift leaderboard and add new best
            //console.log("new best fitness: " + this.bestNet.fitness);
            this.leaderboard.unshift(this.bestNet.clone());
            //depending on size, pop
            if(this.leaderboard.length > this.leaderboardSize){
            this.leaderboard.pop();
            }
        }

        
        return this.bestNet;
    }
}











function competeTrainers(t1, t2){
    let games = 100;
    let t1wins = 0;
    let t2wins = 0;
    let ties = 0;
    for(let i = 0; i < games; i++){
        let bestNet1 = t1.evolve(t2);
        let bestNet2 = t2.evolve(t1);
        let match = new tttGame(bestNet1,bestNet2);
        let score = match.runUntilDead(10000);
        //rematch other way
        match = new tttGame(bestNet2,bestNet1);
        let score2 = match.runUntilDead(10000);

        if(score == 1){
            t1wins++;
        }else if(score == -1){
            t2wins++;
        }else{
            ties++;
        }
        if(score2 == 1){
            t2wins++;
        }else if(score2 == -1){
            t1wins++;
        }else{
            ties++;
        }

    }
    console.log("t1 wins: " + t1wins);
    console.log("t2 wins: " + t2wins);
    console.log("ties: " + ties);
}

class RandomNet extends NeuralNetwork{
    constructor(layerShape, memorySize, plan){
        super(layerShape, memorySize);
        this.fitness = 0;
        this.plan = plan;
        this.playerGenerated = true;
        //if plan is null, generate random plan
        if(this.plan == null){
            this.plan = [];
            for(let i = 0; i < 9; i++){
                this.plan.push(Math.random());
            }
        this.playerGenerated = false;
        }
    
    
    }
    run(input){
        //either target one row or one column
        let output = this.plan;
       
        return output;

     
    }
}


class RandomTrainer{
    static playerActionPool = [];
    constructor(memorySize=0){
        this.layerShape = [9,9,9];
        this.memorySize = memorySize;
        this.nets = [];
        this.population = 3;
        for(let i = 0; i < this.population; i++){
            this.nets.push(new RandomNet(this.layerShape, this.memorySize, RandomTrainer.playerActionPool[Math.floor(Math.random()*RandomTrainer.playerActionPool.length)]));
        }
        this.generation = 0;
        }
    evolve(){
        //sort, prune, refill
        //check if one player generated net exists, if so, delete all non player generated nets
        let playerGenerated = false;
        for(let i = 0; i < this.nets.length; i++){
            if(this.nets[i].playerGenerated){
                playerGenerated = true;
            }
        }
        if(playerGenerated){
            //remove all non player generated nets
            this.nets = this.nets.filter(net => net.playerGenerated);
            this.population = 25;
        }
        //filter randomly
        this.nets = this.nets.filter(net => Math.random() < 0.5);

        this.nets = this.nets.sort((a,b) => (b.fitness) - (a.fitness));
        this.nets = this.nets.slice(0,Math.floor(this.nets.length*0.6));
        //set fitness to 0
        for(let i = 0; i < this.nets.length; i++){
            this.nets[i].fitness = 0;
        }
        //generate new using the same initial algorithm
        while(this.nets.length < this.population){
            this.nets.push(new RandomNet(this.layerShape, this.memorySize, RandomTrainer.playerActionPool[Math.floor(Math.random()*RandomTrainer.playerActionPool.length)]));
        }
        //return random of the first 15
        this.bestNet = this.nets[0];
        //if the pool grows larger than population, remove 3
        if(RandomTrainer.playerActionPool.length > this.population){
            RandomTrainer.playerActionPool.shift();
        }


        return this.nets[Math.floor(Math.random()*15)];
    }
}