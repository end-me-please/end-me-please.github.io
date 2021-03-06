const config = {
    inputSize: 441,
    inputRange: 1,
    hiddenLayers: [15,8],
    outputSize: 1,
    learningRate: 0.2,
    decayRate: 0.999,
};
let trainingLocked=false;
console.log("loading player file");
//console.log("brain: " + Object.keys(brain));
class Player {
    //brain.js network
    static neuralNet = new brain.NeuralNetwork(config);  
    constructor(x,y,world,color,human=false) {
        this.x = x;
        this.y = y;
        this.world = world;
        this.color = color;
        this.size=world.tileSize/2;
        this.viewingDistance=10;
        this.human=human;
        this.trainingData=[];
        this.viewportHistory=[null,null,null,null];
    }
    draw() {
        this.world.canvas.fillStyle = this.color;
        this.world.canvas.fillRect(this.x*this.world.tileSize,this.y*this.world.tileSize,this.size,this.size);
    }
    update() {
        if(this.human) {
        return;
        }
        console.log("impostor");
        let view=this.getViewport();
        let output=[0];
        try{
        output=Player.neuralNet.run(view);
        }catch(e){}
        console.log(output);
        this.step(Math.floor((output[0]*4)+0.5),false);
        }


    step(direction,human=false) {
        
        this.viewportHistory.push(this.getViewport());
        this.viewportHistory.shift();
        
        //console.log("impostor did something!!");


            //directions 1-4, store xdiff and ydiff
            console.log(direction);
            let xdiff = 0;
            let ydiff = 0;
            switch (direction) {
                case 0:
                    if(human){this.world.tick();}
                    return;
                break;

                case 1:
                    xdiff = 0;
                    ydiff = -1;
                    break;
                case 2:
                    xdiff = 0;
                    ydiff = 1;
                    break;
                case 3:
                    xdiff = -1;
                    ydiff = 0;
                    break;
                case 4:
                    xdiff = 1;
                    ydiff = 0;
                    break;
                }
                //check if player is trying to move out of bounds or into a wall
                if (this.x+xdiff<0 || this.x+xdiff>=this.world.width || this.y+ydiff<0 || this.y+ydiff>=this.world.height) {
                    return false;
                }
                //check true/false of target tile
                if(this.world.tiles[this.x+xdiff][this.y+ydiff]) {
                    return false;
                }
                //if human, train
                if(human) {
                let view=this.getViewport();
                    let newData={input: view, output: [direction/4]};
                    this.trainingData.push(newData);
                }

                //move player
                console.log(this.x,this.y);
                this.x+=xdiff;
                this.y+=ydiff;
                console.log(this.x,this.y);
                //if player is human, update world
                if (this.human&&direction==0) {
                    this.world.tick();
                }
                return true;
                }

            train() {
                console.log("training..");
                try{
                Player.neuralNet.train(this.trainingData,{iterations:100,keepNetworkIntact: true});
                //this.trainingData=[];
                }catch(e) {console.log("ono")}
                console.log("trained!");
            }


            
             getViewport() {
                let viewport = [];
                //initialize viewport
                for (let i=0;i<this.viewingDistance*2+1;i++) {
                    viewport[i]=[];
                    for (let j=0;j<this.viewingDistance*2+1;j++) {
                        viewport[i][j]=0;
                    }
                }
        
            for (let i=-this.viewingDistance;i<this.viewingDistance;i++) {
                    for (let j=-this.viewingDistance;j<this.viewingDistance;j++) {
                        //check if tile is out of bounds
                        if (this.x+i<0 || this.x+i>=this.world.width || this.y+j<0 || this.y+j>=this.world.height) {
                            viewport[i+this.viewingDistance][j+this.viewingDistance]=1;
                            //console.log("out of bounds");
                        } else {
                        viewport[i+this.viewingDistance][j+this.viewingDistance]=this.world.tiles[this.x+i][this.y+j]?1:0;
                        }
                    //check if any player has the same coordinates as the tile
                        for (let k=0;k<this.world.players.length;k++) {
                        //3 if different color, 2 if same color
                        if (this.world.players[k].x==this.x+i && this.world.players[k].y==this.y+j && this.world.players[k].color!=this.color) {
                            viewport[i+this.viewingDistance][j+this.viewingDistance]=3;
                        }
                        if(this.world.players[k].x==this.x+i && this.world.players[k].y==this.y+j && this.world.players[k].color==this.color) {
                            viewport[i+this.viewingDistance][j+this.viewingDistance]=2;
                        }
                        }
                }
            }
                this.viewportHistory.push(viewport);
                this.viewportHistory.shift();
                return viewport;
            }
}

//module.exports = Player;
















