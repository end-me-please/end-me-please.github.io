/*

given is the number of inputs and the number of outputs
at the start, there are no connections

a mutation can:
- add a connection
- change the weight of a connection
- add a node with weight 1 and bias 0 to a connection
- enable/disable a connection
- change the bias of a node
- change the activation function of a node
- remove a node that isnt input or output- adjust the remaining graph to prevent floating nodes or connections

a node connected to itself will apply it's current value to itself on the next tick

The network should be serializable to JSON and deserializable from JSON

crossover is optional for now.

*/


class GeneticNetwork {
    constructor(io) {
        this.inputs = io[0];
        this.outputs = io[1];
        let inputs = this.inputs;
        let outputs = this.outputs;
        this.connections = [];
        this.nodeCounter = 0;
        this.connectionCounter = 0;
        this.nodes = [];
        //mutation rate is supplied externally when calling mutate(factor)

        //create input nodes
        for (let i = 0; i < inputs; i++) {
            this.nodes.push(new Node(this.nodeCounter++, 0, "identity"));
        }

        //create output nodes
        for (let i = 0; i < outputs; i++) {
            this.nodes.push(new Node(this.nodeCounter++, 0, "identity"));
        }

        //create connections between input and output nodes
        for (let i = 0; i < inputs; i++) {
            for (let j = inputs; j < inputs + outputs; j++) {
                this.connections.push({ id: this.connectionCounter++, from: i, to: j, weight: 1, enabled: true });
            }
        }




    }

    //mutate the network
    mutate(factor) {
        //factor is the mutation rate
        //factor is a number between 0 and 1

        //factor/80 chance to add a connection, factor/300 chance to add a node, factor/600 chance to remove a node, factor/400 chance to toggle a connection, factor chance to change a weight, factor/2 chance to change a bias

        //add a connection
        if (Math.random() < factor / 80) {
            //pick two random nodes
            let from = Math.floor(Math.random() * this.nodes.length);
            let to = Math.floor(Math.random() * this.nodes.length);

            //check if a connection already exists between the two nodes
            let exists = false;
            for (let i = 0; i < this.connections.length; i++) {
                if (this.connections[i].from == from && this.connections[i].to == to) {
                    exists = true;
                    break;
                }
            }

            //if no connection exists, add it
            if (!exists) {
                this.connections.push({ id: this.connectionCounter++, from: from, to: to, weight: Math.random() * 2 - 1, enabled: true });
            }
        }	

        //add a node
        if (Math.random() < factor / 300) {
            //pick a random connection
            let connection = Math.floor(Math.random() * this.connections.length);

            //delete the connection, not disabling it
            this.connections.splice(connection, 1);

            //add a node
            this.nodes.push(new Node(this.nodeCounter++, 0, "identity"));

            //add two connections
            this.connections.push({ id: this.connectionCounter++, from: this.connections[connection].from, to: this.nodes.length - 1, weight: 1, enabled: true });
            this.connections.push({ id: this.connectionCounter++, from: this.nodes.length - 1, to: this.connections[connection].to, weight: this.connections[connection].weight, enabled: true });
        }

        //remove a node
        if (Math.random() < factor / 600) {
            //pick a random node
            let node = Math.floor(Math.random() * this.nodes.length);

            //check if the node is an input or output node
            if (node < this.inputs || node >= this.inputs + this.outputs) {
                //delete the node
                this.nodes.splice(node, 1);

                //delete all connections to and from the node
                for (let i = 0; i < this.connections.length; i++) {
                    if (this.connections[i].from == node || this.connections[i].to == node) {
                        this.connections.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        //toggle a connection
        if (Math.random() < factor / 400) {
            //pick a random connection
            let connection = Math.floor(Math.random() * this.connections.length);

            //toggle the connection
            this.connections[connection].enabled = !this.connections[connection].enabled;
        }

        //change a weight
        if (Math.random() < factor) {
            //pick a random connection
            let connection = Math.floor(Math.random() * this.connections.length);

            //change the weight
            this.connections[connection].weight = Math.random() * 2 - 1;
        }

        //change a bias
        if (Math.random() < factor / 2) {
            //pick a random node
            let node = Math.floor(Math.random() * this.nodes.length);

            //change the bias
            this.nodes[node].bias = Math.random() * 2 - 1;
        }

        //change the activation function
        if (Math.random() < factor / 50) {
            //pick a random node
            let node = Math.floor(Math.random() * this.nodes.length);

            //change the activation function
            this.nodes[node].activation = ["identity", "sigmoid", "tanh", "relu", "leakyrelu", "softplus", "sin", "cos", "gauss", "abs", "square", "cube", "sqrt", "step", "sign", "inverse", "ones", "zeros"][Math.floor(Math.random() * 18)];
        }

    }

    //run the network
    think(inputs) {
        //inputs is an array of numbers

        //set the input nodes to the input values
        for (let i = 0; i < this.inputs; i++) {
            this.nodes[i].value = inputs[i];
        }

        //calculate the values of the hidden and output nodes
        for (let i = this.inputs; i < this.nodes.length; i++) {
            //calculate the value of the node
            this.nodes[i].value = 0;
            for (let j = 0; j < this.connections.length; j++) {
                if (this.connections[j].to == i && this.connections[j].enabled) {
                    this.nodes[i].value += this.nodes[this.connections[j].from].value * this.connections[j].weight;
                }
            }
            this.nodes[i].value += this.nodes[i].bias;
            this.nodes[i].value = this.activation(this.nodes[i].activation, this.nodes[i].value);
        }

        //return the values of the output nodes
        let outputs = [];
        for (let i = this.inputs; i < this.inputs + this.outputs; i++) {
            outputs.push(this.nodes[i].value);
        }
        return outputs;
    }

    //activation functions
    activation(type, value) {
        switch (type) {
            case "identity":
                return value;
            case "sigmoid":
                return 1 / (1 + Math.exp(-value));
            case "tanh":
                return Math.tanh(value);
            case "relu":
                return Math.max(0, value);
            case "leakyrelu":
                return Math.max(0.01 * value, value);
            case "softplus":
                return Math.log(1 + Math.exp(value));
            case "sin":
                return Math.sin(value);
            case "cos":
                return Math.cos(value);
            case "gauss":
                return Math.exp(-Math.pow(value, 2));
            case "abs":
                return Math.abs(value);
            case "square":
                return Math.pow(value, 2);
            case "cube":
                return Math.pow(value, 3);
            case "sqrt":
                return Math.sqrt(Math.abs(value));
            case "step":
                return value >= 0 ? 1 : 0;
            case "sign":
                return value >= 0 ? 1 : -1;
            case "inverse":
                return -value;
            case "ones":
                return 1;
            case "zeros":
                return 0;
            default:
                return value;
        }
    }

    draw(ctx){
        //arrange nodes left to right
        let nodePositions = [];
        let nodeLayers = [];
        let nodeLayer = 0;
        for (let i = 0; i < this.nodes.length; i++) {
            nodePositions.push({x: 0, y: 0});
            nodeLayers.push(0);
        }
        for (let i = 0; i < this.inputs; i++) {
            nodePositions[i].x = 0;
            nodePositions[i].y = i;
            nodeLayers[i] = 0;
        }
        for (let i = this.inputs; i < this.nodes.length; i++) {
            let max = 0;
            for (let j = 0; j < this.connections.length; j++) {
                if (this.connections[j].to == i && this.connections[j].enabled) {
                    if (nodeLayers[this.connections[j].from] > max) {
                        max = nodeLayers[this.connections[j].from];
                    }
                }
            }
            nodeLayers[i] = max + 1;
        }
        for (let i = 0; i < this.nodes.length; i++) {
            nodePositions[i].x = nodeLayers[i];
        }
        
        //arrange nodes top to bottom
        for (let i = 0; i < this.nodes.length; i++) {
            nodePositions[i].x *= 100;
            nodePositions[i].y = nodeLayers[i] * 100;
        }

        //draw connections
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].enabled) {
                ctx.beginPath();
                ctx.moveTo(nodePositions[this.connections[i].from].x, nodePositions[this.connections[i].from].y);
                ctx.lineTo(nodePositions[this.connections[i].to].x, nodePositions[this.connections[i].to].y);
                ctx.stroke();
            }
        }

        //draw nodes
        for (let i = 0; i < this.nodes.length; i++) {
            ctx.beginPath();
            ctx.arc(nodePositions[i].x, nodePositions[i].y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //draw node values
        for (let i = 0; i < this.nodes.length; i++) {
            ctx.fillText(this.nodes[i].value.toFixed(2), nodePositions[i].x - 10, nodePositions[i].y - 10);
        }
        

    }


    clone(){
        let clone = new GeneticNetwork(this.inputs, this.outputs);
        clone.connections = JSON.parse(JSON.stringify(this.connections));
        clone.nodes = JSON.parse(JSON.stringify(this.nodes));
        clone.nodeCounter = this.nodeCounter;
        clone.connectionCounter = this.connectionCounter;
        return clone;
    }
    serialize(){
        return JSON.stringify(this);
    }
    static deserialize(json){
        let obj = JSON.parse(json);
        let network = new GeneticNetwork(obj.inputs, obj.outputs);
        network.connections = obj.connections;
        network.nodes = obj.nodes;
        network.nodeCounter = obj.nodeCounter;
        network.connectionCounter = obj.connectionCounter;
        return network;
    }


    pair(network){
        //return clone
        let clone = this.clone();
        return clone;
    }

}

class Node {
    constructor(id, bias, activation) {
        this.id = id;
        this.bias = bias;
        this.activation = activation;
        this.value = 0;
    }
}

//demo running with 4 inputs, 4 outputs, mutating 20 times randomly and then feeding results to the network
function test (){

    let network = new GeneticNetwork(4, 4);
    for (let i = 0; i < 20; i++) {
        network.mutate(0.5);
    }
    console.log(network);
    console.log(network.think([1, 0, 0, 1]));


}
test();