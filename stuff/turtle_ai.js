class AI{
    constructor(code,world,robot){
        this.code=code.split("\n").map(l=>l.trim());
        this.world = world;
        this.robot = robot;
        this.state={};
        this.line=0;
    }
    tick(){
        if(this.state.timeoutUntil>Date.now()){
            return;
        }

            let line=this.code[this.line];
            let tokens=line.split(" ");
            let command=tokens.shift();
            if(Object.keys(instructions).indexOf(command)==-1){
                return;
            }
            instructions[command](this.robot,tokens);
            this.line++;
            if(this.line>=this.code.length)
            {
                this.line=0;
            }
    }
}

let instructions = {
    move: moveFunction,
    wait: waitFunction
}

function moveFunction(robot,args){
    let x = parseInt(args[0]);
    let y = parseInt(args[1]);
    robot.move(x,y);
}

function waitFunction(robot,args){
    let timeout = parseInt(args[0]);
    robot.ai.state.timeoutUntil = Date.now()+timeout;
}








