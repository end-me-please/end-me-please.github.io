class Grid {
    constructor(width, height, subdivisions) {
        this.width = width;
        this.height = height;
        this.subdivisions = subdivisions;
        this.cellWidth = width / subdivisions;
        this.cellHeight = height / subdivisions;

        this.grid = [];
        this.entities = [];
        this.initGrid();
    }
    initGrid() {
        let grid = [];	
        for(let i=0; i<this.subdivisions; i++) {
            grid[i] = [];
            for(let j=0; j<this.subdivisions; j++) {
                grid[i][j] = [];
            }
        }
        this.grid = grid;
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    removeEntity(entity) {
        let index = this.entities.indexOf(entity);
        if(index > -1) {
            this.entities.splice(index, 1);
        }
    }

    updateGrid() {
        this.initGrid();
        for(let i=0; i<this.entities.length; i++) {
            let entity = this.entities[i];
            let x = Math.floor(entity.x / this.cellWidth);
            let y = Math.floor(entity.y / this.cellHeight);
            if(x >= this.subdivisions) {
                x = this.subdivisions - 1;
            }
            if(y >= this.subdivisions) {
                y = this.subdivisions - 1;
            }
            if(x < 0) {
                x = 0;
            }
            if(y < 0) {
                y = 0;
            }
            //check bounds
            this.grid[x][y].push(entity);
        }
    }
    getEntitiesInCircle(x, y, radius) {
        let entities = [];
        let x1 = Math.floor((x - radius) / this.cellWidth);
        let x2 = Math.floor((x + radius) / this.cellWidth);
        let y1 = Math.floor((y - radius) / this.cellHeight);
        let y2 = Math.floor((y + radius) / this.cellHeight);
        if(x1 < 0) {
            x1 = 0;
        }
        if(y1 < 0) {
            y1 = 0;
        }
        if(x2 >= this.subdivisions) {
            x2 = this.subdivisions - 1;
        }
        if(y2 >= this.subdivisions) {
            y2 = this.subdivisions - 1;
        }
        for(let i=x1; i<=x2; i++) {
            for(let j=y1; j<=y2; j++) {
                for(let k=0; k<this.grid[i][j].length; k++) {
                    let entity = this.grid[i][j][k];
                    if(Math.sqrt(Math.pow(entity.x - x, 2) + Math.pow(entity.y - y, 2)) < radius) {
                        entities.push(entity);
                    }
                }
            }
        }
        return entities;
    }
    debugRender(ctx) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        for(let i=0; i<this.subdivisions; i++) {
            ctx.beginPath();
            ctx.moveTo(i*this.cellWidth, 0);
            ctx.lineTo(i*this.cellWidth, this.height);
            ctx.stroke();
            ctx.closePath();
        }
        for(let i=0; i<this.subdivisions; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i*this.cellHeight);
            ctx.lineTo(this.width, i*this.cellHeight);
            ctx.stroke();
            ctx.closePath();
        }
    }
   
}
