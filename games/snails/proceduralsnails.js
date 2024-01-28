class SnailGen {
    constructor(shellC1, shellC2, spiralPitch, skinC, eyeLength) {
        this.shellC1 = shellC1;
        this.shellC2 = shellC2;
        this.footColor = skinC;
        this.spiralPitch = spiralPitch;
        this.eyeLength = eyeLength;
        this.radius = 32;
        this.randomSeed = Math.random();
        this.cracks = 0;
    }
    draw(ctx){
        let rng = seedRandom(this.randomSeed);

        let color1 = this.shellC1;
        let color2 = this.shellC2;
        let footColor = this.footColor;
        let spiralPitch = this.spiralPitch;
        let eyeLength = this.eyeLength;
        
        let radius = this.radius;

        if(spiralPitch < 3) {
            spiralPitch = 3;
        }

        //draw outer shell circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        for (let i = 0; i < radius; i++) {
            let x = i * Math.cos(i/radius * spiralPitch);
            let y = i * Math.sin(i/radius * spiralPitch);
            ctx.lineTo(x, y);

        }
        ctx.strokeStyle = color2;
        ctx.lineWidth = (radius*0.5)/(spiralPitch)+2;
        ctx.stroke();
        ctx.closePath();
        
        let bottomX = -radius;
        let bottomY = radius;
        let headX = bottomX + radius*2;
        ctx.strokeStyle = footColor;
        ctx.beginPath();
        ctx.moveTo(bottomX, bottomY);
        ctx.lineTo(headX+radius/4, bottomY);
        ctx.moveTo(headX, bottomY);
        ctx.lineTo(headX+radius/3, bottomY - radius/4);
        ctx.lineWidth = radius/2.5;
        ctx.stroke();
        ctx.closePath();



        ctx.beginPath();
        ctx.moveTo(headX+radius/3.2, bottomY-radius/4);
        let eyeAngle = Math.PI/4;
        let eyelengthX = Math.cos(eyeAngle)*eyeLength;
        let eyelengthY = Math.sin(eyeAngle)*eyeLength;
        ctx.lineTo(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY);
        ctx.lineWidth = radius/6;
        ctx.stroke();
        ctx.closePath();

        if(!this.dead){
        ctx.beginPath();
        ctx.moveTo(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY);
        ctx.arc(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY, radius/10, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
        } else {
            ctx.strokeStyle = "red";
            ctx.lineWidth = radius/10;
            ctx.moveTo(headX+radius/3 + eyelengthX - radius/10, bottomY-radius/2 - eyelengthY - radius/10);
            ctx.lineTo(headX+radius/3 + eyelengthX + radius/10, bottomY-radius/2 - eyelengthY + radius/10);
            ctx.moveTo(headX+radius/3 + eyelengthX + radius/10, bottomY-radius/2 - eyelengthY - radius/10);
            ctx.lineTo(headX+radius/3 + eyelengthX - radius/10, bottomY-radius/2 - eyelengthY + radius/10);
            ctx.stroke();
            ctx.closePath();
        }

        
        ctx.beginPath();
        ctx.moveTo(headX+radius/3.7, bottomY-radius/4);
        eyeAngle = Math.PI/8;
        eyelengthX = Math.cos(eyeAngle)*eyeLength;
        eyelengthY = Math.sin(eyeAngle)*eyeLength;
        ctx.lineTo(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY);
        ctx.lineWidth = radius/6;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY);
        if(this.dead==false){
        ctx.arc(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY, radius/10, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
        } else {
            ctx.strokeStyle = "red";
            ctx.lineWidth = radius/10;
            ctx.moveTo(headX+radius/3 + eyelengthX - radius/10, bottomY-radius/2 - eyelengthY - radius/10);
            ctx.lineTo(headX+radius/3 + eyelengthX + radius/10, bottomY-radius/2 - eyelengthY + radius/10);
            ctx.moveTo(headX+radius/3 + eyelengthX + radius/10, bottomY-radius/2 - eyelengthY - radius/10);
            ctx.lineTo(headX+radius/3 + eyelengthX - radius/10, bottomY-radius/2 - eyelengthY + radius/10);
            ctx.stroke();
            ctx.closePath();
        }


        
        if(this.cracks > 0) {
            for(let i = 0; i < this.cracks*3; i++) {
                ctx.beginPath();
                //get a random angle for the crack to start on the outside of the shell
                let angle = rng.next().value * 2 * Math.PI;
                //get a random length for the crack to be
                let length = rng.next().value * radius;
                //get a second random angle for the crack to end on the inside of the shell
                let angle2 = rng.next().value * 2 * Math.PI;
                //get a second random length for the crack to be
                let length2 = rng.next().value * radius/2;
                
                //get the x and y coordinates for the start of the crack
                let x = length * Math.cos(angle);
                let y = length * Math.sin(angle);
                //get the x and y coordinates for the end of the crack
                let x2 = length2 * Math.cos(angle2);
                let y2 = length2 * Math.sin(angle2);
                //draw the crack
                ctx.moveTo(x, y);
                ctx.lineTo(x2, y2);
                



                ctx.lineWidth = radius/9;
                ctx.strokeStyle = "black";
                ctx.stroke();
                ctx.closePath();
            }

        }

        



    }
    
}

function* seedRandom(seed) {
    let seed1 = seed;
    let seed2 = seed;
    while(true) {
        seed1 = (seed1 * 9301 + 49297) % 233280;
        seed2 = (seed2 * 49297 + 233280) % 9301;
        yield (seed1 + seed2) / 233280;
    }
}