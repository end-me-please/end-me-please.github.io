
//let offscreenCanvas = document.createElement('canvas');
let offscreenCanvas = new OffscreenCanvas(800,800);

let offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCtx.fillStyle = "black";
offscreenCtx.fillRect(0,0,offscreenCanvas.width,offscreenCanvas.height);


class GridCell {
    constructor(parent,x,y){
        this.parent = parent;
        this.x = x;
        this.y = y;
        this._particle = null;
        this.parentDataIndex = (this.parent.width*this.y+this.x)*5;
    }
    swapParticle(cell){
        let tmp = cell.particle;
        cell.particle = this.particle;
        this.particle = tmp;
        this.particle.cell = this;
        cell.particle.cell = cell;
    }
    get particle(){
        return this._particle;
    }
    set particle(particle){
        this._particle = particle;
        
        //access parent sim's imageData and set pixel to particle color, or black if null
        let imageData = this.parent.imageData;
        let index = ((this.parent.height-this.y)*this.parent.width+this.x)*4;
        if(particle == null){
            imageData.data[index] = 0;
            imageData.data[index+1] = 0;
            imageData.data[index+2] = 0;
            imageData.data[index+3] = 255;
        } else {
            let rgb = particle.type.rgbColor;
            imageData.data[index] = rgb[0];
            imageData.data[index+1] = rgb[1];
            imageData.data[index+2] = rgb[2];
            imageData.data[index+3] = 255;
        }

    }

}

class BaseParticle {
    static ID = 0;
    constructor(parent,type,x,y){
        this.sim = parent;
        //get the cell of the initial position
        let cell = this.sim.grid[Math.floor(x)][Math.floor(y)];
        this.cell = cell;

        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
        this.id = BaseParticle.ID++;
    }
    


    update(){
        let oldX = this.x;
        let oldY = this.y;


        //if 4 neighbors are all equal and velocity 0, skip update
        let neighbors = [this.sim.getParticle(this.x-1,this.y),this.sim.getParticle(this.x+1,this.y),this.sim.getParticle(this.x,this.y+1),this.sim.getParticle(this.x,this.y-1)];
        let allEqual = true;
        for(let i = 0; i < neighbors.length; i++){
            if(neighbors[i] == null || Math.abs(neighbors[i].vx)+Math.abs(neighbors[i].vy) > 0.01){
                allEqual = false;
                break;
            }
        }
        if(allEqual && Math.abs(this.vx)+Math.abs(this.vy) < 0.01){
            return;
        }


        if(this.type.moveable == false){ return; };
        //apply gravity if cell below is empty
        if(this.sim.getParticle(this.cell.x,this.cell.y-1) == null){
            this.vy -= this.type.gravity;
        }
        this.vx *= 1-this.type.drag;
        this.vy *= 1-this.type.drag;
        this.x += this.vx;
        this.y += this.vy;

        //if cell y is 0, stop
        if(this.y < 0){
            this.y = 0;
            this.vy = 0;
        }
        //if cell y is height, stop
        if(this.y > this.sim.height){
            this.y = this.sim.height;
            this.vy = 0;
        }
        //if cell x is 0, stop
        if(this.x < 0){
            this.x = 0;
            this.vx = 0;
        }
        //if cell x is width, stop
        if(this.x > this.sim.width){
            this.x = this.sim.width;
            this.vx = 0;
        }

        if(this.type.gaseous == true){
            //random movement based on slipperiness
            this.vx += (Math.random()-0.5)*this.type.slipperiness;
            this.vy += (Math.random()-0.5)*this.type.slipperiness;
        }


        if(this.type.liquid == true&&this.sim.getParticle(this.x,this.y-1) != null){ //is liquid
            
            //if water is below 
            if(this.sim.getParticle(this.x,this.y-1).type.liquid){
                //if water on one side but not the other, apply force to move
                let waterLeft = this.sim.getParticle(this.x-1,this.y-1) != null && this.sim.getParticle(this.x-1,this.y-1).type.name == "water";
                let waterRight = this.sim.getParticle(this.x+1,this.y-1) != null && this.sim.getParticle(this.x+1,this.y-1).type.name == "water";


                if(waterLeft && !waterRight){
                    this.vx += this.type.slipperiness*Math.random();
                }
                if(waterRight && !waterLeft){
                    this.vx -= this.type.slipperiness*Math.random();
                }
            } 

            //try move left or right, randomly, if touching another non-solid particle
            let particlesSurrounding = [this.sim.getParticle(this.x-1,this.y),this.sim.getParticle(this.x+1,this.y),this.sim.getParticle(this.x,this.y+1),this.sim.getParticle(this.x,this.y-1)];
            let moveableParticles = particlesSurrounding.filter(p => p != null && p.type.liquid == true);
            if(moveableParticles.length > 0){
            let xDir = Math.random() < 0.5 ? -1 : 1;
            if(this.sim.getParticle(this.x-xDir,this.y) == null){
                this.x -= xDir;
            } else if(this.sim.getParticle(this.x+xDir,this.y) == null){
                this.x += xDir;
            }
            }


        }
        if(Math.random() < this.type.slipperiness){    
                //check mass of all particles above this until a null particle is found
                let mass = 0;
                let currentY = Math.floor(this.y);
                while(this.sim.getParticle(this.x,currentY) != null && (mass < (this.type.maxSupportMass+1)) &&(this.sim.getParticle(this.x,currentY).type.moveable==true)){
                    mass += this.sim.getParticle(this.x,currentY).type.density;
                    currentY++;
                }
                if(mass > this.type.maxSupportMass){
                    //check if cell left or right is empty
                    let xDir = Math.random() < 0.5 ? -1 : 1;
                    if(this.sim.getParticle(this.x-xDir,this.y) == null){
                        this.x -= xDir;
                    } else if(this.sim.getParticle(this.x+xDir,this.y) == null){
                        this.x += xDir;
                    }
                }
        }

        //console.log("x: " + this.x + " y: " + this.y);
        //check bounds before setting new cell
        //check x
        if(this.x < 0){
            this.x = 0;
            this.vx = 0;
        }
        if(this.x >= this.sim.width){
            this.x = this.sim.width-1;
            this.vx = 0;
        }
        //check y
        if(this.y < 0){
            this.y = 0;
            this.vy = 0;
        }
        if(this.y >= this.sim.height){
            this.y = this.sim.height-1;
            this.vy = 0;
        }

        let newCell=null;
        let raycast = true;


        if(raycast==false){
        //newCell = this.sim.grid[Math.floor(this.x)][Math.floor(this.y)];
        newCell = this.sim.getCell(this.x,this.y);
        } else {


        //get newCell by raycasting from old xy to new xy



        let newCellX = Math.floor(this.x);
        let newCellY = Math.floor(this.y);
        let oldCellX = Math.floor(oldX);
        let oldCellY = Math.floor(oldY);
        let dx = newCellX-oldCellX;
        let dy = newCellY-oldCellY;


        let steps = Math.abs(dx)+Math.abs(dy);
        let xStep = dx/steps;
        let yStep = dy/steps;
        newCell = this.cell;
        for(let i = 0; i < steps; i++){
            newCell = this.sim.getCell(oldCellX+xStep*i,oldCellY+yStep*i);
            if(newCell.particle != null&&newCell!=this.cell){
                //compare densities
                if(newCell.particle.type.density > this.type.density){
                break;
                }
            }

        }
        }
        
        if(newCell!==this.cell){



        if(newCell.particle == null){

            //tmp.setCell(this.cell);
            this.cell.particle = null;
            newCell.particle = this;
            this.cell = newCell;
            //this.setCell(newCell);
        } else {
            
            //if this cell is denser than the new cell, swap
            if(this.type.density > newCell.particle.type.density){
                this.cell.swapParticle(newCell);
            }

            //console.log(newCell);
            this.x = this.cell.x;
            this.y = this.cell.y;
            //this.vx = 0;
            //this.vy = 0;
            //swap velocities, if moveable
            if(newCell.particle.type.moveable){
                
                let temp = this.vx;
                this.vx = newCell.particle.vx;
                newCell.particle.vx;
                temp = this.vy;
                this.vy = newCell.particle.vy;
                newCell.particle.vy = temp;
                
                
            }   
            else {
                //bounce, depending on sum of bouncinesses
                let bounciness = (this.type.bounciness + newCell.particle.type.bounciness)/2;
                let vx = -this.vx*bounciness;
                let vy = -this.vy*bounciness;

                this.vx = vx;
                this.vy = vy;
            }         
            }
            this.type.update(this);
        }

    }
    
    render(ctx,x,y){
        ctx.fillStyle = this.type.color;
        ctx.fillRect(x,y,1,1);

    }
}


class BaseParticleType {
    constructor(name, color){
        this.name = name;
        this.color = color;
        this.rgbColor = color.match(/\d+/g);

        this.density = 3;
        this.moveable = true;
        this.slipperiness = 0.1;
        this.maxSupportMass = 9;
        this.liquid = false;
        this.gaseous = false;
        this.gravity = 0.1;
        this.drag=0.001;
        this.bounciness = 0.003;
    }
    update(particle){
        //do nothing
    }
}


class CombustibleParticleType extends BaseParticleType {
    constructor(name, color){
        super(name,color);
        this.combustible = true;
    }
    update(particle){
        //if touching fire, set on fire
        let touchingFire = false;
        let x = particle.x;
        let y = particle.y;
        let particlesSurrounding = [particle.sim.getParticle(x-1,y),particle.sim.getParticle(x+1,y),particle.sim.getParticle(x,y+1),particle.sim.getParticle(x,y-1)];
        for(let i = 0; i < particlesSurrounding.length; i++){
            if(particlesSurrounding[i] != null && particlesSurrounding[i].type.name == "fire"){
                touchingFire = true;
                break;
            }
        }
        if(touchingFire){
            //particle.sim.addParticle(particleTypes.fire,particle.x,particle.y+1);
            //particle.sim.addParticle(null,particle.x,particle.y);
            particle.type = particleTypes.fire;
            setTimeout(function(){
                particle.sim.grid[particle.cell.x][particle.cell.y].particle = null;
            },5000);
        }

        super.update();
    }
}




let particleTypes = [];
particleTypes["sand"] = new CombustibleParticleType("sand", "rgb(225,225,77)");
particleTypes.sand.slipperiness = 0.1;
particleTypes.sand.density = 1;
particleTypes.sand.maxSupportMass = 12;

particleTypes["water"] = new BaseParticleType("water", "rgb(0,0,255)");
particleTypes.water.slipperiness = 1;
particleTypes.water.density = 0.4;
particleTypes.water.maxSupportMass = 1;
particleTypes.water.liquid = true;

particleTypes["wall"] = new BaseParticleType("stone", "rgb(100,100,100)");
particleTypes.wall.moveable = false;
particleTypes.wall.density = 10;

particleTypes["gas"] = new CombustibleParticleType("gas", "rgb(255,255,255)");
particleTypes.gas.slipperiness = 0.17;
particleTypes.gas.moveable = true;
particleTypes.gas.density = 0.1;
particleTypes.gas.gaseous = true;
particleTypes.gas.gravity = 0.01;
particleTypes.gas.drag = 0.1;

particleTypes["fire"] = new BaseParticleType("fire", "rgb(255,0,0)");
particleTypes.fire.moveable = true;
particleTypes.fire.density = 0.1;
particleTypes.fire.gaseous = true;
particleTypes.fire.gravity = -0.03;
particleTypes.fire.drag = 0.02;





class ParticleSim{
    constructor(width,height){
        this.width = width;
        this.height = height;
        this.grid = [];
        for(let i = 0; i < width; i++){
            this.grid.push([]);
            for(let j = 0; j < height; j++){
                this.grid[i].push(new GridCell(this,i,j));
            }
        }
        this.renderWidth = 800;
        this.renderHeight = 800;

        this.imageData = offscreenCtx.createImageData(this.width,this.height);

        //information required by a particle: type, x, y, vx, vy (all are doubles)
        //use a shared array buffer to store this information
        this.dataBuffer = new ArrayBuffer(5*Float64Array.BYTES_PER_ELEMENT*this.width*this.height);


    }
    get particleCount(){
        let count = 0;
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if(this.grid[i][j].particle != null){
                    count++;
                }
            }
        }
        return count;
    }

    render(ctx){
        //reset transform
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(this.renderWidth/this.width,this.renderHeight/this.height);
        
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if(this.grid[i][j].particle != null){
                    this.grid[i][j].particle.render(ctx,i,this.height-j);
                } else {
                    
                }
            }
        }
    }
    renderImageData(ctx){
        let imageData = this.imageData;
        /*
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if(this.grid[i][j].particle != null){
                    let index = ((this.height-j)*this.width+i)*4;
                    //get rgb from color string/name
                    //let color = this.grid[i][j].particle.type.color; //rgb string
                    //let rgb = color.match(/\d+/g);
                    let rgb = this.grid[i][j].particle.type.rgbColor;
                    imageData.data[index] = rgb[0];
                    imageData.data[index+1] = rgb[1];
                    imageData.data[index+2] = rgb[2];
                    
                    imageData.data[index+3] = 255;
                }
                }
            }
        */

        ctx.setTransform(1,0,0,1,0,0);
        
        offscreenCtx.putImageData(imageData,0,0);
        ctx.scale(this.renderWidth/this.width,this.renderHeight/this.height);
        ctx.drawImage(offscreenCanvas,0,0,offscreenCtx.canvas.width,offscreenCtx.canvas.height);

        }


    update(){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if(this.grid[i][j].particle != null){
                    this.grid[i][j].particle.update();
                }
            }
        }

    }

    addParticle(type,x,y){
        //check bounds
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){
            return;
        }
        this.grid[x][y].particle = new BaseParticle(this,type,x,y);
    }

    getParticle(x,y){
        //floor and do bounds checking
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){
            return null;
        }
        return this.grid[Math.floor(x)][Math.floor(y)].particle;
    }
    getCell(x,y){
        //floor and do bounds checking
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){
            return null;
        }
        return this.grid[Math.floor(x)][Math.floor(y)];
    }

}





