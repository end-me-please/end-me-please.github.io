
class Snail extends RandomSnail {
    constructor(){
        super(Math.random()*32, Math.random()*256);
        super.radius = Math.random() * 5 + 4;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        //this.speed = Math.random() * 2 + 1;
        //this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
        this.maxSpeed = Math.random() * 3 + 3;
        this.drawX = this.x;
        this.drawY = this.y;
        this.drawAngle = this.angle;
        this.trail = [{x: this.x, y: this.y}];
        this.t = 0;
        this.health = 2;
        this.maxHealth = 2;
        this.dead=false;
        super.ready=true;
    }
    update() {
        
        this.t++;

        if(this.health <= 0){
            this.dead=true;
        }

        if(!this.dead){
        
            
        //cap speed
        let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (speed > this.maxSpeed) {
            this.vx *= this.maxSpeed / speed;
            this.vy *= this.maxSpeed / speed;
        }
        
        
        let vx = Math.cos(this.drawAngle) * this.speed;
        let vy = Math.sin(this.drawAngle) * this.speed;
        this.x += vx;
        this.y += vy;
        //lerp drawangle to angle, respecting wraparound
        this.lerpDrawAngle(this.angle, 0.1);


        }

        //wrap around the screen, and push a wrap marker to the trail
        if (this.x < 0) {
            this.x = canvas.width;

            this.drawX = this.x;
            this.drawY = this.y;
            this.trail.push({x: this.x, y: this.y, wrap: true});
        }
        if (this.x > canvas.width) {
            this.x = 0;

            this.drawX = this.x;
            this.drawY = this.y;
            this.trail.push({x: this.x, y: this.y, wrap: true});
        }
        if (this.y < 0) {
            this.y = canvas.height;

            this.drawX = this.x;
            this.drawY = this.y;
            this.trail.push({x: this.x, y: this.y, wrap: true});
        }
        if (this.y > canvas.height) {
            this.y = 0;

            this.drawX = this.x;
            this.drawY = this.y;
            this.trail.push({x: this.x, y: this.y, wrap: true});
        }



        //lerp drawX and drawY to x and y
        this.drawX += (this.x - this.drawX) * 0.1;
        this.drawY += (this.y - this.drawY) * 0.1;

        //every 5 frames, add a new point to the trail
        if (this.t % (Math.pow(document.getElementById("speed").value,2)*3) == 0) this.trail.push({x: this.x, y: this.y, wrap: false});

        //if avg frame time is higher than 15ms, remove a point from the trail
        
        if (this.trail.length > 2) this.trail.shift();



        if(cursorDown){
        //get angle to cursor
        let dx = cursorX - this.x;
        let dy = cursorY - this.y;
        if(Math.sqrt(dx*dx + dy*dy) < 350){
            if(debug==true) {
                //draw a line to the cursor in green
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x+dx, this.y+dy);
                ctx.strokeStyle = "green";
                ctx.lineWidth = 1;
                ctx.stroke();

            }
            this.vx += 1/dx * 0.01;
            this.vy += 1/dy * 0.01;
            let cursorAngle = Math.atan2(dy, dx);
            this.lerpAngle(cursorAngle, 1);
        }
        }

        
        


        //snap angle to 2PI
        if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2; 
        if (this.angle < 0) this.angle += Math.PI * 2;

//lower limit on speed
        if (speed < 0.2) {
            this.vx *= 0.2 / speed;
            this.vy *= 0.2 / speed;
        }

        //set this.cracks to maxhealth-health
        this.cracks = this.maxHealth - this.health;
        //if health is 0, die
    }
    lerpAngle(angle, amount) {
        //allow for continous rotation, temporarily modulo to 0-2PI
        let a = this.angle % (Math.PI * 2);
        let b = angle % (Math.PI * 2);
        //get the difference between a and b
        let diff = b - a;
        //if diff is greater than PI, subtract 2PI
        if (diff > Math.PI) diff -= Math.PI * 2;
        //if diff is less than -PI, add 2PI
        if (diff < -Math.PI) diff += Math.PI * 2;
        //lerp a to b
        a += diff * amount;
        //set this.angle to a
        this.angle = a;
    }
    lerpDrawAngle(angle, amount){
        //allow for continous rotation, temporarily modulo to 0-2PI
        let a = this.drawAngle % (Math.PI * 2);
        let b = angle % (Math.PI * 2);
        //get the difference between a and b
        let diff = b - a;
        //if diff is greater than PI, subtract 2PI
        if (diff > Math.PI) diff -= Math.PI * 2;
        //if diff is less than -PI, add 2PI
        if (diff < -Math.PI) diff += Math.PI * 2;
        //lerp a to b
        a += diff * amount;
        //set this.angle to a
        this.drawAngle = a;
    }

   get angle() {
    let angle = Math.atan2(this.vy, this.vx);
    return angle;
    }
    set angle(angle) {
        let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }
    get speed() {
        let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        return speed;
    }
    set speed(speed) {
        let angle = Math.atan2(this.vy, this.vx);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(Math.floor(this.drawX), Math.floor(this.drawY));
        ctx.rotate(this.drawAngle);
        super.drawCached(ctx);
        ctx.restore();

        //if within radius of wall, draw twice/slightly out of frame
        if (this.x < 2*this.radius) {
            ctx.save();
            ctx.translate(this.drawX + canvas.width, this.drawY);
            ctx.rotate(this.drawAngle);
            super.draw(ctx);
            ctx.restore();
        }
        if (this.x > canvas.width - 2*this.radius) {
            ctx.save();
            ctx.translate(this.drawX - canvas.width, this.drawY);
            ctx.rotate(this.drawAngle);
            super.draw(ctx);
            ctx.restore();
        }
        if (this.y < 2*this.radius) {
            ctx.save();
            ctx.translate(this.drawX, this.drawY + canvas.height);
            ctx.rotate(this.drawAngle);
            super.draw(ctx);
            ctx.restore();
        }
        if (this.y > canvas.height - 2*this.radius) {
            ctx.save();
            ctx.translate(this.drawX, this.drawY - canvas.height);
            ctx.rotate(this.drawAngle);
            super.draw(ctx);
            ctx.restore();
        }


    }
    drawTrail(ctx){
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            if (this.trail[i].wrap) {
                ctx.strokeStyle = this.footColor;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
            }
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.footColor;
        ctx.lineWidth = 1;
        //smudge the trail
        //ctx.shadowBlur = 6;
        ctx.globalAlpha = 0.1;
        //ctx.shadowColor = this.footColor;
        

        ctx.stroke();
    }

    collide(other){
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = Math.sqrt(dx*dx + dy*dy);


        if (distance < this.radius + other.radius) {
            this.vx *= -1;
            this.vy *= -1;

            
            //move them apart
            let angle = Math.atan2(dy, dx);
            let overlap = this.radius + other.radius - distance;
            this.x += overlap * Math.cos(angle);
            this.y += overlap * Math.sin(angle);
        }

        if(distance < this.radius*12){

            //if closer than 5, repel, if not, attract
            if (distance < 5*this.radius) {
                this.vx += 1/(dx/this.radius+this.radius) * 0.01;
                this.vy += 1/(dy/this.radius+this.radius) * 0.01;
            } else {
                this.vx -= 1/(dx/this.radius+this.radius) * 0.001;
                this.vy -= 1/(dy/this.radius+this.radius) * 0.001;
            
                
                this.lerpAngle(other.drawAngle, 1/((distance/this.radius)+this.radius));
            }
        }
     
    }


}


