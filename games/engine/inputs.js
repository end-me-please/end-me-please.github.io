class inputHandler {
    constructor(canvas){
        this.canvas = canvas;
        this.mouse = new vector(0,0);
        this.mouseDown = false;
        this.pressedKeys = {};

        this.canvas.addEventListener("mousemove",(e)=>{
            this.mouse.x = e.offsetX/32;
            this.mouse.y = e.offsetY/32;
        });
        this.canvas.addEventListener("mousedown",(e)=>{
            e.preventDefault();
            this.mouseDown = true;
        }
        );
        this.canvas.addEventListener("mouseup",(e)=>{
            this.mouseDown = false;
        }
        );
        this.canvas.addEventListener("keydown",(e)=>{
            e.preventDefault();
            this.pressedKeys[e.key] = true;
        }
        );
        this.canvas.addEventListener("keyup",(e)=>{
            this.pressedKeys[e.key] = false;
        }
        );

    }

}