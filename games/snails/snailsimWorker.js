//this is a worker
importScripts("proceduralsnails.js");
importScripts('snailentity.js');
//listen for frame request from main thread
//on message, run update


let speed = 1;
onmessage = function(e) {
    //listen for speedupdate type messages
    if(e.data.type=="speedupdate"){
        speed = e.data.speed;
    }
}


let snails = [];
for(let i=0;i<100;i++){
    snails.push(new Snail());
}

function frame() {
}






