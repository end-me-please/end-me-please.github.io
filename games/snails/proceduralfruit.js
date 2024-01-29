



class FruitGen {
    constructor(seed, radius){
        this.seed = seed;
        this.radius = radius;
        this.palette = ["#FF0000", "#FFA500", "#FFFF00", "#008000", "#0000FF", "#4B0082", "#EE82EE"];
        this.dots = [];
        this.stemColor = "#008000";
        this.randomise();
    }
    randomise() {
        let rng = seedRandom(this.seed);
        let colors = Math.floor(rng.next().value * 5) + 2;
        this.palette = [];
        for(let i = 0; i < colors; i++) {
            let r = Math.floor(rng.next().value * 255);
            let g = Math.floor(rng.next().value * 255);
            let b = Math.floor(rng.next().value * 255);
            this.palette[i] = "rgb(" + r + "," + g + "," + b + ")";
        }
        let numDots = Math.floor(rng.next().value * 5) + 1;
        this.dots = [];
        for(let i = 0; i < numDots; i++) {
            let color = this.palette[Math.floor(rng.next().value * colors)];
            //position in polar coordinates
            let angle = rng.next().value * 2 * Math.PI;
            let dotRadius = rng.next().value * this.radius/4;
            //make sure the dots dont extend beyond the radius of the fruit, determine polar radius randomly
            let polarRadius = rng.next().value * (this.radius - dotRadius);	
            this.dots[i] = {color: color, phi : angle, r : polarRadius, size : dotRadius};
        }
        this.stemColor = this.palette[Math.floor(rng.next().value * colors)];
    }
    draw(ctx){
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.palette[0];
        ctx.fill();
        ctx.closePath();
        for(let i = 0; i < this.dots.length; i++) {
            ctx.beginPath();
            ctx.arc(this.dots[i].r * Math.cos(this.dots[i].phi), this.dots[i].r * Math.sin(this.dots[i].phi), this.dots[i].size, 0, 2 * Math.PI);
            ctx.fillStyle = this.dots[i].color;
            ctx.fill();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, -this.radius*2);
        ctx.lineWidth = this.radius/10;
        ctx.strokeStyle = this.stemColor;
        ctx.stroke();
        ctx.closePath();
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