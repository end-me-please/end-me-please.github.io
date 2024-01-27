class SnailGen {
    constructor(shellC1, shellC2, spiralPitch, skinC, eyeLength) {
        this.shellC1 = shellC1;
        this.shellC2 = shellC2;
        this.footColor = skinC;
        this.spiralPitch = spiralPitch;
        this.eyeLength = eyeLength;
        this.radius = 32;
    }
    draw(ctx){
        
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
        ctx.beginPath();
        ctx.moveTo(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY);
        ctx.arc(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY, radius/10, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();

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
        ctx.arc(headX+radius/3 + eyelengthX, bottomY-radius/2 - eyelengthY, radius/10, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();

    }
    
}
