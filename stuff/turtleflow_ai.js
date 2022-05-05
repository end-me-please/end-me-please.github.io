
//AI class, used to control the turtle
//updates on .tick()
//turtle can be controlled with turtle.move(x,y), turtle.consume(x,y)
//eating costs life and only works if the turtle is within 4 tiles of another turtle
//turtle views the world through this.world.getTile(x,y).blocked. blocked means the tile is impassible, and can be eaten
//use tensorflow.js to train the AI
class neuralAI {
    constructor(world, turtle) {
        this.world = world;
        this.turtle = turtle;
}
tick() {
    //assemble the input vector
    let input = [];
    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            input.push(this.world.getTile(this.turtle.x + i, this.turtle.y + j).blocked);
        }
    }
    //run the neural network
    let output = this.model.predict([input],[this.turtle.life]);
    //console.log(output);
    //move the turtle
    if (output[0][0] > output[0][1]) {
        this.turtle.move(0, -1);
    } else {
        this.turtle.move(0, 1);
    }
    if (output[0][2] > output[0][3]) {
        this.turtle.move(-1, 0);
    }
    else {
        this.turtle.move(1, 0);
    }
    //let the network consume in a direction it wants
    if (output[0][4] > output[0][5]) {
        this.turtle.consume(0, -1);
    }
    else if (output[0][4] < output[0][5]) {
        this.turtle.consume(0, 1);
    }
    if (output[0][6] > output[0][7]) {
        this.turtle.consume(-1, 0);
    }
    else if (output[0][6] < output[0][7]) {
        this.turtle.consume(1, 0);
    }
    //give feedback to the network about the turtle's life
    let life = this.turtle.life;

}
getRelativeTile(x, y) {
    let x1=this.robot.x+x;
    let y1=this.robot.y+y;
    return this.world.getTile(x1,y1).blocked;
}
relativeMove(x, y) {
    let x1=this.robot.x+x;
    let y1=this.robot.y+y;
    this.turtle.move(x1,y1);
}
}

//controls all turtle instances. losing life = bad, gaining life = good
//turtles will call this with an array of their surroundings, a 9 by 9 array of tiles
//output by either calling turtle.move(x,y) or turtle.eat(x,y)
//let tensorflow = require('@tensorflow/tfjs');

//import * as tensorflow from '@tensorflow/tfjs';

let brain = new tf.LayersModel({
    inputs: {
        shape: [9, 9, 1]
    },
    outputs: {
        shape: [2]
    }
});
brain.compile({
    optimizer: tensorflow.train.adam(),
    loss: tensorflow.losses.meanSquaredError
});


