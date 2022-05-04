class ScriptAI {
    constructor(code,world,robot){
        this.code=code.split("\n").map(l=>l.trim());
        this.world = world;
        this.robot = robot;
        this.state={};
        this.vars={};
        this.line=0;
    }
    tick(){
        this.area=this.getSubgrid();
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
            //read from tiles
            if(token.startsWith("$tile(")){
                let x=token.substring(6,token.indexOf(","));
                let y=token.substring(token.indexOf(",")+1,token.length-1);
                //parse x and y
                x=parseInt(x);
                y=parseInt(y);
                tokens[i]=this.area[x][y];
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
    getSubgrid(){
        //return blocked tiles in a 9x9 grid around the robot
        let area=[];
        for(let x=this.robot.x-4;x<this.robot.x+5;x++){
            let row=[];
            for(let y=this.robot.y-4;y<this.robot.y+5;y++){
                if(x<0||y<0||x>=this.world.width||y>=this.world.height){
                    row.push(true);
                }
                else{
                    row.push(this.world.getTile(x,y).blocked);
                }
            }
            area.push(row);
        }
        return area;
    }
}








let instructions = {
    move: moveFunction,
    wait: waitFunction,
    set: setVarFunction,
    add: addFunction
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
function setVarFunction(robot,args){
    let varName = args[0];
    let varValue = args[1];
    //parse as int
    if(varValue.startsWith("$")){
        varValue = robot.ai.vars[varValue.substring(1)];
    }
    else{
        varValue = parseInt(varValue);
    }
    robot.ai.vars[varName]=varValue;
}
function addFunction(robot,args){
    let varName = args[0];
    let varValue = args[1];
    //parse as int
    if(varValue.startsWith("$")){
        varValue = robot.ai.vars[varValue.substring(1)];
    }
    else{
        varValue = parseInt(varValue);
    }
    robot.ai.vars[varName]+=varValue;
}





