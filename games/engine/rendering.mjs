class canvasRenderer{
    constructor(canvas, textures){
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.textures=textures;
    }
    render(world){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i = 0; i<world.clusters.length; i++){
            this.renderCluster(world.clusters[i]);
        }
    }

    renderCluster(cluster){
        this.ctx.save();
        this.ctx.translate(cluster.pos.x*32,cluster.pos.y*32);
        //rotate center of mass
        let com = cluster.CenterOfMass.rotate(cluster.angle);
        this.ctx.translate(-com.x*32,-com.y*32);
        this.ctx.rotate(cluster.angle);
        //draw a red line from the center of mass to the center of the cluster
        this.ctx.strokeStyle = "red";
        this.ctx.beginPath();
        this.ctx.moveTo(0,0);
        this.ctx.lineTo(cluster.CenterOfMass.x*32,cluster.CenterOfMass.y*32);
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        //draw line starting at cluster.forceVisualPos in the direction of cluster.forceVisual
        this.ctx.strokeStyle = "blue";
        this.ctx.beginPath();
        this.ctx.moveTo(cluster.forceVisualPos.x*32,cluster.forceVisualPos.y*32);
        this.ctx.lineTo(cluster.forceVisualPos.x*32+cluster.forceVisual.x*32,cluster.forceVisualPos.y*32+cluster.forceVisual.y*32);
        this.ctx.lineWidth = 4;
        this.ctx.stroke();




        for(let i=0; i<cluster.members.length; i++){
            //draw a green circle for now
            this.ctx.beginPath();
            this.ctx.arc(cluster.members[i].pos.x*cluster.members[i].size,cluster.members[i].pos.y*cluster.members[i].size,cluster.members[i].size/2,0,2*Math.PI);
            this.ctx.fillStyle = "green";
            this.ctx.fill();
        }
        this.ctx.restore();
        for(let i=0; i<cluster.members.length; i++){
            //red hollow circle
            this.ctx.beginPath();
            //use global position
            this.ctx.arc(cluster.members[i].globalPosition().x*cluster.members[i].size,cluster.members[i].globalPosition().y*cluster.members[i].size,cluster.members[i].size/2,0,2*Math.PI);
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
        //draw blue dot at center of cluster
        this.ctx.beginPath();
        this.ctx.arc(cluster.pos.x*32,cluster.pos.y*32,4,0,2*Math.PI);
        this.ctx.fillStyle = "blue";
        this.ctx.fill();

    }
}