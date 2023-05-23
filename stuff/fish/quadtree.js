class QuadTree {
     //physics system for collision detection, and scanning in a pie slice, circular colliders
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }
    clear() {
        this.points = [];
        this.divided = false;
        //delete
        this.northeast = null;
        this.northwest = null;
        this.southeast = null;
        this.southwest = null;
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }
        else {
            if (!this.divided) {
                this.subdivide();
            }
            return (this.northeast.insert(point) || this.northwest.insert(point) || this.southeast.insert(point) || this.southwest.insert(point));
        }
    }
    remove(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity) {
            let index = this.points.indexOf(point);
            if (index > -1) {
                this.points.splice(index, 1);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            if (!this.divided) {
                this.subdivide();
            }
            return (this.northeast.remove(point) || this.northwest.remove(point) || this.southeast.remove(point) || this.southwest.remove(point));
        }
    }



    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;
        let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.northeast = new QuadTree(ne, this.capacity);
        this.northwest = new QuadTree(nw, this.capacity);
        this.southeast = new QuadTree(se, this.capacity);
        this.southwest = new QuadTree(sw, this.capacity);
        this.divided = true;
    }
    query(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return found;
        }
        else {
            for (let p of this.points) {
                if (range.contains(p)) {
                    found.push(p);
                }
            }
            if (this.divided) {
                this.northwest.query(range, found);
                this.northeast.query(range, found);
                this.southwest.query(range, found);
                this.southeast.query(range, found);
            }
            return found;
        }
    }
    draw(ctx){
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(this.boundary.x-this.boundary.w,this.boundary.y-this.boundary.h,this.boundary.w*2,this.boundary.h*2);
        ctx.stroke();
        if(this.divided){
            this.northeast.draw(ctx);
            this.northwest.draw(ctx);
            this.southeast.draw(ctx);
            this.southwest.draw(ctx);
        }
    }
    update(){
        for (let p of this.points) {
            this.remove(p);
            this.insert(p);
        }

    }
}
class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w; //half width
        this.h = h; //half height
    }
    contains(point) {
        return (point.x >= this.x - this.w && point.x < this.x + this.w && point.y >= this.y - this.h && point.y < this.y + this.h);
    }
    intersects(range) {
        return !(range.x - range.w > this.x + this.w || range.x + range.w < this.x - this.w || range.y - range.h > this.y + this.h || range.y + range.h < this.y - this.h);
    }
}

//not used
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}















