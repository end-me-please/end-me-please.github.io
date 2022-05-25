class canvasRenderer{
    constructor(canvas, textures){
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.textures=textures;
    }
    render(world){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i=0; i<world.objects.length; i++){
            //draw as square
            let pos = world.objects[i].pos.clone();
            let size = world.objects[i].size.clone();
            pos.multiplyScalar(this.canvas.width/world.width);
            size.multiplyScalar(this.canvas.width/world.width);
            let angle = world.objects[i].angle;
            //solid green
            this.ctx.fillStyle = "green";
            this.ctx.save();
            this.ctx.translate(pos.x,pos.y);
            this.ctx.rotate(angle);
            this.ctx.fillRect(-size.x/2,-size.y/2,size.x,size.y);
            this.ctx.restore();
        }
    }
}