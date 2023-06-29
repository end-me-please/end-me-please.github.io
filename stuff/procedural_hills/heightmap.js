


class NoiseMap {
    constructor(scale) {
        this.scale = scale;
    }
    get(x, y) {
        //get a somewhat random number from x and y as integers
        let x0 = Math.floor(x * this.scale);
        let y0 = Math.floor(y * this.scale);
        let x1 = x0 + 1;
        let y1 = y0 + 1;

        //get values at the corners of the square
        let r00 = this.random(x0, y0);
        let r01 = this.random(x0, y1);
        let r10 = this.random(x1, y0);
        let r11 = this.random(x1, y1);

        //interpolate
        let sx = x * this.scale - x0; //scale factor within cell
        let sy = y * this.scale - y0;

        let a = r00 * (1 - sx) + r10 * sx;
        let b = r01 * (1 - sx) + r11 * sx;

        let value = a * (1 - sy) + b * sy;
        return value;


    }

    random(x,y){
        let seed = x * 10000 + y;
        let rand = Math.sin(seed) * 10000;
        return rand - Math.floor(rand);
        
    }
}









class Terrain {
    constructor(scale){
        this.scale = scale;
        this.noiseMapDetail = new NoiseMap(scale/2);
        this.noiseMapRough = new NoiseMap(scale/8);
        this.rivers = [];
        //populate rivers
        for(let i = 0; i < 15; i++){
            let frequency1 = Math.random()*0.05 + 0.05;
            let frequency2 = Math.random()*0.05 + 0.05;
            let amplitude = Math.random()*0.5 + 0.5;
            let offset = Math.random()*0.5 + 0.5;
            let angle = Math.random()*Math.PI*2;
            this.rivers.push(new River(frequency1,frequency2,amplitude,offset,angle));
        }

    }
    get(x,y){
        //get the height at a point
        let detail = this.noiseMapDetail.get(x,y);
        let rough = this.noiseMapRough.get(x,y)**3;
        
        //approx 60% of the map should be flatland- set rough to 0 there, determine biome using 2d sin wave
        let biome = Math.sin(x*0.06)*Math.sin(y*0.04);
        if(biome > -0.4){
            rough*=((biome+0.4)**2);
        }

        
        
        
        let height = detail*0.2 + rough*0.8;
        //clip- some areas should be flat
        if(height < 0.4){
            height*=height/0.4;
        }

        //add rivers
        let riverProximity = this.getRiverProximity(x,y);
        //if proximity is less than 30, slowly lower the height
        //if less than 10, lower it a lot
        //if less than 5, zero it out
        if(riverProximity < 30){
            height -= (30 - riverProximity)/30 * 0.1;
        }
        if(riverProximity < 10){
            height -= (10 - riverProximity)/10 * 0.2;
        }
        if(riverProximity < 5){
            height = 0;
        }
        return height;
    }


    getRiverProximity(x,y){
        //check all rivers
        let minDistance = 100000;
        for(let i = 0; i < this.rivers.length; i++){
            let distance = this.rivers[i].get(x,y);
            if(distance < minDistance){
                minDistance = distance;
            }
        }
        return minDistance;
    }
}
class River {
    constructor(frequency1,frequency2,amplitude,offset,angle){
        this.frequency1 = frequency1;
        this.frequency2 = frequency2;
        this.amplitude = amplitude;
        this.offset = offset;
        this.angle = angle;
    }
    get(x,y){
        //check how close the point is to the river
        //the river's path is sin(frequency1*y)*sin(frequency2*y)*amplitude + offset, rotated by angle
        let riverY = Math.sin(this.frequency1*y)*Math.sin(this.frequency2*y)*this.amplitude + this.offset;
        let riverX = x;
        let riverX2 = riverX*Math.cos(this.angle) - riverY*Math.sin(this.angle);
        let riverY2 = riverX*Math.sin(this.angle) + riverY*Math.cos(this.angle);
        let distance = Math.sqrt((x-riverX2)*(x-riverX2) + (y-riverY2)*(y-riverY2));
        return distance;
    }
}

        






















































