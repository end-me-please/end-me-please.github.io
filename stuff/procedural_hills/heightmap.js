


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

































