class SpikingBrain {

    constructor(layerShape ) {
        this.layerShape = layerShape;
        this.inputLayer = new InputLayer(layerShape[0]);

        this.weights = [];
        this.decayRates = [];
        this.biases = [];
        this.thresholds = [];
        
        this.layers = []; //state information
        
        //dont use matrices at all
        for (let i = 0; i < layerShape.length; i++) {
            this.weights.push([]);
            this.decayRates.push([Array(layerShape[i]).fill(0)]);
            this.biases.push(Array(layerShape[i]).fill(0));
            this.thresholds.push(Array(layerShape[i]).fill(0));
            this.layers.push(Array(layerShape[i]).fill(0));
        }
        for (let i = 0; i < layerShape.length-1; i++) {
            for (let j = 0; j < layerShape[i]; j++) {
                this.weights[i].push(Array(layerShape[i+1]).fill(0));
            }
        }

     
    }
    think(input) {
        //decay
        for (let i = 0; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].length; j++) {
                this.layers[i][j] *= 1 - this.decayRates[i][j];
            }
        }

        //add input to the state of the first layer
        for (let i = 0; i < this.layerShape[0]; i++) {
            this.layers[0][i] += input[i];
        }

        //check if any neurons have fired
        for (let i = 0; i < this.layers.length; i++) {
            for (let j = 0; j < this.layers[i].length; j++) {
                if (this.layers[i][j] > this.thresholds[i][j]) {
                    this.layers[i][j] = 0;
                    //if output layer,return
                    if (i == this.layers.length - 1) {
                        continue;
                    }

                    for (let k = 0; k < this.weights[i][j].length; k++) {
                        this.layers[i+1][k] += this.weights[i][j][k];
                    }
                }
            }
        }
        return this.layers[this.layers.length - 1];

    }
        


















}

function none(x) {
    return x;
}
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
function leakyRelu(x) {
    return Math.max(0.1 * x, x);
}
function tanh(x) {
    return Math.tanh(x);
}