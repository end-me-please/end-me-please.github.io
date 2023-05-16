class FishBrain2 {
    constructor() {
        //polynomial approach instead of neural network
        let inputSize = 16;
        let outputSize = 2;
        let degree = 4;
        let outputFunctions = [];
        //for each output, create a list of functions for each input (they will be summed)
        for (let i = 0; i < outputSize; i++) {
            let functions = [];
            for (let j = 0; j < inputSize; j++) {
                let coefficients = [];
                //first coefficient is the bias, initialize to 0
                coefficients.push(0);
                for (let k = 1; k < degree; k++) {
                    coefficients.push(((Math.random() * 2) - 1)*0.2);
                }
                functions.push(coefficients);
            }
            outputFunctions.push(functions);
        }
        this.outputFunctions = outputFunctions;

    }

    think(input) {
        
        let output = [];
        for (let i = 0; i < this.outputFunctions.length; i++) {
            let functions = this.outputFunctions[i];
            let sum = 0;
            for (let j = 0; j < functions.length; j++) {
                let coefficients = functions[j];
                let value = 0;
                for (let k = 0; k < coefficients.length; k++) {
                    value += coefficients[k] * Math.pow(input[j]*3, k);
                }
                sum += value;
            }
            output.push(sum);
        }

        return output;
    }

    draw(ctx) {
        //clear the canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";

        //draw all the functions
        for (let i = 0; i < this.outputFunctions.length; i++) {
            let functions = this.outputFunctions[i];
            for (let j = 0; j < functions.length; j++) {
                let coefficients = functions[j];
                ctx.beginPath();
                for (let k = 0; k < ctx.canvas.width; k++) {
                    let x = k / ctx.canvas.width;
                    let y = 0;
                    for (let l = 0; l < coefficients.length; l++) {
                        y += coefficients[l] * Math.pow(x*3, l);
                    }
                    y = y * ctx.canvas.height / 2 + ctx.canvas.height / 2;
                    ctx.lineTo(k, y);
                }
                ctx.stroke();
            }
        }
        
    }

    mutate() {
        //randomly change some of the coefficients
        for (let i = 0; i < this.outputFunctions.length; i++) {
            let functions = this.outputFunctions[i];
            for (let j = 0; j < functions.length; j++) {
                let coefficients = functions[j];
                for (let k = 0; k < coefficients.length; k++) {
                    if (Math.random() < 0.4) {
                        coefficients[k] += (Math.random() * 2 - 1)/10;
                    }
                }
            }
        }
    }

    pair(other) {
        //create a new brain by combining the functions of this brain and the other brain
        let newBrain = new FishBrain2();
        for (let i = 0; i < this.outputFunctions.length; i++) {
            let functions = this.outputFunctions[i];
            let otherFunctions = other.outputFunctions[i];
            for (let j = 0; j < functions.length; j++) {
                let coefficients = functions[j];
                let otherCoefficients = otherFunctions[j];
                for (let k = 0; k < coefficients.length; k++) {
                    if (Math.random() < 0.5) {
                        newBrain.outputFunctions[i][j][k] = coefficients[k];
                    } else {
                        newBrain.outputFunctions[i][j][k] = otherCoefficients[k];
                    }
                    //average the coefficients with low probability
                    if (Math.random() < 0.1) {
                        newBrain.outputFunctions[i][j][k] = (coefficients[k] + otherCoefficients[k]) / 2;
                    }
                    //mutate the coefficients with low probability
                    if (Math.random() < 0.7) {
                        newBrain.outputFunctions[i][j][k] += (Math.random() * 2 - 1)/50;
                    }
                    //chance of nullifying the coefficient
                    if (Math.random() < 0.05) {
                        newBrain.outputFunctions[i][j][k] = 0;
                    }

                }
            }
        }
        return newBrain;
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
