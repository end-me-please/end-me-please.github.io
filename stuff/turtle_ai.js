class AI{
    constructor(code,world,robot){
        this.code=code.split("\n").map(l=>l.trim());
        this.world = world;
        this.robot = robot;
        this.state={};
        this.vars={};
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
            tokens=this.tokenReplacer(tokens);
            instructions[command](this.robot,tokens);
            this.line++;
            if(this.line>=this.code.length)
            {
                this.line=0;
            }
    }

    tokenReplacer(tokens){
        for(let i=0;i<tokens.length;i++){
            let token=tokens[i];
            if(token=="$randX"){
                tokens[i]=Math.floor(Math.random()*this.world.width);
            }
            if(token=="$randY"){
                tokens[i]=Math.floor(Math.random()*this.world.height);
            }
            if(token=="$thisX"){
                tokens[i]=this.robot.x;
            }
            if(token=="$thisY"){
                tokens[i]=this.robot.y;
            }
            //allow $rand(num)
            if(token.startsWith("$rand(")){
                let num=token.substring(6,token.length-1);
                tokens[i]=Math.floor(Math.random()*num);
            }

            if(token.startsWith("$")){
                let varName=token.substring(1);
                if(varName in this.vars){
                    tokens[i]=this.vars[varName];
                }
            }
        }
        return tokens;
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






