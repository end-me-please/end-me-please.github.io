class FishBrain {
    constructor(layerShape) {
        this.inputSize = layerShape[0];
        this.outputSize = layerShape[layerShape.length-1];
        this.layerShape = layerShape;
        
        //all values from previous layer are multiplied by weights of their connections and added to all values of the next layer
        this.weights = [];
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            this.weights.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                this.weights[i].push([]);
                for (let k = 0; k < this.layerShape[i + 1]; k++) {
                    this.weights[i][j].push((Math.random() * 2 - 1)*0.1);
                }
            }
        }
        this.biases = [];
        //biases for input and output layer are always 0
        for (let i = 0; i < this.layerShape.length; i++) {
            this.biases.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                if(i==0||i==this.layerShape.length-1) this.biases[i].push(0);
                else this.biases[i].push((Math.random() * 2 - 1)*0.1);
            }
        }
        
        
        this.lastValues = [];
        //initialize lastValues
        for (let i = 0; i < this.layerShape.length; i++) {
            this.lastValues.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                this.lastValues[i].push(0);
            }
        }



    }
    mutate(factor){
        for(let i = 0; i < factor*20; i++) {
        //select one random weight or bias and mutate it
        let layer = Math.floor(Math.random() * (this.layerShape.length - 2)) + 1;
        let node = Math.floor(Math.random() * this.layerShape[layer]);
        let nextNode = Math.floor(Math.random() * this.layerShape[layer+1]);

        if(Math.random() < 0.5) {
            this.weights[layer][node][nextNode] += (Math.random() * 2 - 1) * factor;
        }
        else {
            this.biases[layer][node] += (Math.random() * 2 - 1) * factor;
        }
    }


    }
    pair (other) {
        //deep-check if layer shapes match, iterate through layerShape
        for (let i = 0; i < this.layerShape.length; i++) {
            if(this.layerShape[i] != other.layerShape[i]) {console.log("layer shape mismatch");return this.clone();};
        }
    

        let child = new FishBrain(this.layerShape.map(x=>x));
        
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    child.weights[i][j][k] = Math.random() < 0.5 ? this.weights[i][j][k] : other.weights[i][j][k];
                    if(Math.random() < 0.2) {
                        child.weights[i][j][k] = (this.weights[i][j][k] + other.weights[i][j][k]) / 2;
                    }
                }
            }
        }
        
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].length; j++) {
                child.biases[i][j] = Math.random() < 0.5 ? this.biases[i][j] : other.biases[i][j];
                if(Math.random() < 0.2) {
                    child.biases[i][j] = (this.biases[i][j] + other.biases[i][j]) / 2;
                }
            }
        }
       
        



        return child;
    }


    think(input) {
        //use matrix operations instead
        if(input.length != this.inputSize) throw new Error("size does not match input size: "+ input.length);
        let values = [];
        for (let i = 0; i < this.layerShape.length; i++) {
            values.push([]);
            for (let j = 0; j < this.layerShape[i]; j++) {
                //bias
                values[i].push(this.biases[i][j]);
            }
        }

        
       
        values[0] = input;
        //weight array is of shape weight=[layer][node][next node]
        for (let i = 0; i < this.layerShape.length - 1; i++) {
            for (let j = 0; j < this.layerShape[i]; j++) {
                for (let k = 0; k < this.layerShape[i + 1]; k++) {
                    values[i + 1][k] += activation(values[i][j]) * this.weights[i][j][k];
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
                    if(this.weights[i][j][k] == 0) continue;

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

                //draw red or green circle in node depending on value

                ctx.fillStyle = "black";

                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(layerX[i][j],layerY[i][j],circleRadius,0,2 * Math.PI);
                ctx.fill();
                //draw red or green circle around node depending on bias
                if(i > 0 && i < this.layerShape.length - 1) {
                    ctx.strokeStyle = this.biases[i-1][j] > 0 ? "green" : "red";
                    ctx.lineWidth = 2+(Math.abs(this.biases[i-1][j]) * 25);

                    ctx.beginPath();
                    ctx.arc(layerX[i][j],layerY[i][j],circleRadius*1.5,0,2 * Math.PI);
                    ctx.stroke();
                }

                let value = Math.min(1.2,3*Math.abs(this.lastValues[i][j]));
                ctx.fillStyle = this.lastValues[i][j] > 0 ? "green" : "red";
                ctx.beginPath();
                ctx.arc(layerX[i][j],layerY[i][j],circleRadius*value*0.5,0,2 * Math.PI);
                
                ctx.fill();
                //if input or output, draw number as text
                if(i==0||i==this.layerShape.length-1){
                    ctx.fillStyle = "yellow";
                    ctx.font = "10px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(j, layerX[i][j], layerY[i][j]);
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
    serialize() {
        //store important metadata, and weights/biases
        let data = {
            inputSize: this.inputSize,
            outputSize: this.outputSize,
            layerShape: this.layerShape,
            weights: this.weights,
            biases: this.biases,
        };

        return data;

    }
    static deserialize(data) {
        let brain = new FishBrain(data.layerShape);
        brain.inputSize = data.inputSize;
        brain.outputSize = data.outputSize;
        brain.layerShape = data.layerShape;
        brain.weights = data.weights;
        brain.biases = data.biases;
        return brain;
    }
    clone() {
        return FishBrain.deserialize(this.serialize());
    }

    expand(layer) {
        //make sure that layer is not input or output layer
        if(layer == 0 || layer == this.layerShape.length - 1) layer = 1;

        //add a node to that layer
        this.layerShape[layer]++;
        //add a row to the weights array
        this.weights[layer].push([]);
        //add 0-weights to the previous layer linking to the new node
        for (let i = 0; i < this.layerShape[layer-1]; i++) {
            this.weights[layer-1][i].push(0);
        }
        //add 0-weights to the next layer linking from the new node
        for (let i = 0; i < this.layerShape[layer+1]; i++) {
            this.weights[layer][this.layerShape[layer]-1].push(0);
        }
        //add a bias to the new node
        this.biases[layer].push(0);
        //add a memory weight to the new node

        //add a row to the lastValues array
        this.lastValues[layer].push(0);




    }
}

function activation(x) {
    //return x+Math.sin(x*2)*0.4;
    return Math.sign(Math.round(Math.tanh(x)));
    //return 1 / (1 + Math.exp(-x));
    //return Math.max(x*0.1,x);
}































