



class NeuralNet {

    constructor(layerShape) {
        //layerShape is array(2), input and output layer sizes
        this.inputSize = layerShape[0];
        this.outputSize = layerShape[1];

        this.neurons = [];
        //create input neurons
        for (let i = 0; i < this.inputSize; i++) {
            this.neurons.push(new InputNeuron(Math.tanh,this.neurons.length));
        }
        //create output neurons
        for (let i = 0; i < this.outputSize; i++) {
            this.neurons.push(new Neuron(Math.tanh,this.neurons.length));
        }
        
        //create connections
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                this.neurons[i].connections.push(new Connection(this.neurons[i], this.neurons[this.inputSize + j], Math.random() - 0.5));
            }
        }



    }

    cleanup() {
        //prune floating connections
        for (let i = 0; i < this.neurons.length; i++) {
            if (this.neurons[i].connections.length == 0) {
                this.neurons.splice(i, 1);
                i--;
            }
        }
        
    }






    mutate(factor) {
        //mutate all connections
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = 0; j < this.neurons[i].connections.length; j++) {
                this.neurons[i].connections[j].mutate(factor);
            }
        }


        //possibly add new connection
        if (Math.random() < factor) {
            //dont connect to input neurons
            let from = Math.floor(Math.random() * (this.neurons.length - this.outputSize)) + this.outputSize;
            let to = Math.floor(Math.random() * this.neurons.length);
            //connecting to self is allowed

            //check if connection already exists, if so, reinforce it (multiply instead of add)
            let exists = false;
            for (let i = 0; i < this.neurons[from].connections.length; i++) {
                if (this.neurons[from].connections[i].to == this.neurons[to]) {
                    this.neurons[from].connections[i].weight *= 2;
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                this.neurons[from].connections.push(new Connection(this.neurons[from], this.neurons[to], Math.random() - 0.5));
            }
        }

        //possibly add new neuron
        if (Math.random() < factor) {
            //using connection.insert()

            //choose random connection
            let connection = this.neurons[Math.floor(Math.random() * this.neurons.length)].connections[Math.floor(Math.random() * this.neurons.length)];
            //create new neuron
            let newNeuron = new Neuron(Math.tanh,this.neurons.length);
            //insert new neuron into connection
            connection.insert(newNeuron);
        }


    };
    think(input) {
        //go through the input neurons and set their values
        for (let i = 0; i < this.inputSize; i++) {
            this.neurons[i].value = input[i];
        }
        //go through the rest of the neurons and calculate their values
        for (let i = this.inputSize; i < this.neurons.length; i++) {
            this.neurons[i].output();
        }
        //return the output
        let output = [];
        for (let i = 0; i < this.outputSize; i++) {
            output.push(this.neurons[this.inputSize + i].value);
        }
        return output;


    };
    clone() {
        return NeuralNet.deserialize(this.serialize());
    };
    pair() {return this.clone();};

    serialize() {
        //returns a string that can be used to recreate the neural net
        //format: inputSize, outputSize, [neuron1, neuron2, ...]
        //neuron format: id, activation, value, bias, [connection1, connection2, ...]
        //connection format: weight, toNeuronID
        let result = this.inputSize + "," + this.outputSize + ",";
        for (let i = 0; i < this.neurons.length; i++) {
            let neuron = this.neurons[i];
            result += neuron.id + "," + neuron.activation + "," + neuron.value + "," + neuron.bias + ",";
            for (let j = 0; j < neuron.connections.length; j++) {
                let connection = neuron.connections[j];
                result += connection.weight + "," + connection.to.id + ",";
            }
            result += ";";
        }
        return result;
    }	
    static deserialize(string) {
        let layers = string.split(";");
        let layerShape = layers[0].split(",");
        let net = new NeuralNet([parseInt(layerShape[0]), parseInt(layerShape[1])]);
        net.neurons = [];
        for (let i = 1; i < layers.length - 1; i++) {
            let neuron = layers[i].split(",");
            net.neurons.push(new Neuron(Math.tanh,parseInt(neuron[0])));
            net.neurons[i - 1].activation = neuron[1];
            net.neurons[i - 1].value = parseFloat(neuron[2]);
            net.neurons[i - 1].bias = parseFloat(neuron[3]);
            net.neurons[i - 1].connections = [];
            for (let j = 4; j < neuron.length - 1; j += 2) {
                net.neurons[i - 1].connections.push(new Connection(net.neurons[i - 1], net.neurons[parseInt(neuron[j + 1])], parseFloat(neuron[j])));
            }
        }
        return net;
    }

    draw(ctx){
        //arrange in useful way
        let layers = [];
        for (let i = 0; i < this.neurons.length; i++) {
            if (layers[this.neurons[i].id] == undefined) {
                layers[this.neurons[i].id] = [];
            }
            layers[this.neurons[i].id].push(this.neurons[i]);
        }
        //draw connections
        for (let i = 0; i < this.neurons.length; i++) {
            for (let j = 0; j < this.neurons[i].connections.length; j++) {
                let connection = this.neurons[i].connections[j];
                ctx.beginPath();
                ctx.moveTo(connection.from.id * 100 + 50, connection.from.bias * 100 + 50);
                ctx.lineTo(connection.to.id * 100 + 50, connection.to.bias * 100 + 50);
                ctx.lineWidth = Math.abs(connection.weight) * 10;
                ctx.strokeStyle = connection.weight > 0 ? "green" : "red";
                ctx.stroke();
            }
        }
        //draw neurons
        for (let i = 0; i < layers.length; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                let neuron = layers[i][j];
                ctx.beginPath();
                ctx.arc(neuron.id * 100 + 50, neuron.bias * 100 + 50, 20, 0, 2 * Math.PI);
                ctx.fillStyle = neuron.value > 0 ? "green" : "red";
                ctx.fill();
                ctx.stroke();
            }
        }
        


    }


}
class Neuron { //base class for all neurons
    constructor(actFunc,id) {
        this.id = id;
        this.activation = actFunc;
        this.value = 0;
        this.connections = [];
        this.active = true;
        this.bias = 0;
    }
    input(signal) {
        this.value += signal;
    }
    output() {
        if (!this.active) {
            return;
        }
        //for all connections, send signal
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].to.input(this.value * this.connections[i].weight);
        }
        this.value = 0;
    }
    
}
class InputNeuron extends Neuron {
    constructor(actFunc,id) {
        super(actFunc,id);
        this.input = true;
    }
}

class Connection { //base class for all connections
    constructor(from, to, weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
    mutate(factor) {
        this.weight += factor * (Math.random() - 0.5);
    }
    insert(neuron) {
        //redirect connection to new neuron, connect new neuron to old target
        let newConnection = new Connection(neuron, this.to, this.weight);
        this.to = neuron;
        this.to.connections.push(newConnection);
    }
}












































