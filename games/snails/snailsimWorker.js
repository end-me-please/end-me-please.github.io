console.log("worker loaded");

postMessage("worker loaded");

let canvas={width:1000, height:1000};
importScripts('grid.js');

//this is a worker
importScripts("proceduralsnails.js");
importScripts('snailentity.js');
//listen for frame request from main thread
//on message, run update


let speed = 1;
let cursorDown = false;
let cursorX = 0;
let cursorY = 0;
let debug = false;



let frameQueue = [];












onmessage = function(e) {
    //listen for speedupdate type messages
    
    if(e.data.type=="speedupdate"){
        speed = e.data.speed;
    }
    if(e.data.type=="requestframe"){
        let cframe = frameQueue.shift();
        if(cframe!=undefined){
            postMessage({type:"frame",frame:cframe});
        }
        if(frameQueue.length<2){
            frame();
        }
    }
    if(e.data.type=="setup"){
        setup(e.data.width, e.data.height);
    }
    if(e.data.type=="cursorupdate"){
        cursorDown = e.data.down;
        cursorX = e.data.x;
        cursorY = e.data.y;
    }

}







let windowWidth = 1000;
let windowHeight = 1000;
let grid = new Grid(1000, 1000, 8, 8);
let isSetup = false;
function setup(width, height){
    console.log("setup");
    grid = new Grid(width, height, 8, 8);
    windowWidth = width;
    windowHeight = height;
    canvas={width:width, height:height};
    isSetup = true;


    for(let i=0;i<2000;i++){
        snails.push(new Snail(i));
        snails[i].randomSeed = i;
        grid.addEntity(snails[i]);
    }
    


}


let snails = [];



function frame(){
    for(let t = 0; t < speed; t++){
        physicsFrame();
    }
    let frame = [];
    for(let i=0;i<snails.length;i++){
        frame.push({x:snails[i].x, y:snails[i].y, radius:snails[i].radius, angle:snails[i].angle, speed:snails[i].speed, dead:snails[i].dead});
    }
    frameQueue.push(frame);
}







function physicsFrame() {
    grid.updateGrid();

    for (let i = 0; i < snails.length; i++) {
        snails[i].update();
        let potentialPartners = grid.getEntitiesInCircle(snails[i].x, snails[i].y, 9*snails[i].radius);
        //draw a line to each partner
        if(debug==true){
        for (let j = 0; j < potentialPartners.length; j++) {
            ctx.beginPath();
            ctx.moveTo(snails[i].x, snails[i].y);
            ctx.lineTo(potentialPartners[j].x, potentialPartners[j].y);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        }
        for (let j = 0; j < potentialPartners.length; j++) {
            if (potentialPartners[j] != snails[i]) {
                snails[i].collide(potentialPartners[j]);
            }
        }
    }
}





