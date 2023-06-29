//import heightmap from './heightmap.js';
//we are in a worker
importScripts('heightmap.js');
//<script src="https://cdn.babylonjs.com/babylon.js"></script>
importScripts('https://cdn.babylonjs.com/babylon.js');


const chunkSize = 32;
const mapScale = 1;
const pathScale = 1;

let map = new Terrain(0.31)



//create a babylon scene







//on worker message
self.onmessage = function(e) {
    //receive data, contains x/y
    let data = e.data;
    let x = data.x;
    let y = data.y;
    //get map
    getMap(x, y).then((map)=>{
        //send map back to main thread
        self.postMessage({mapStr: map, x: x, y: y});
    }
    );
};



async function getMap(xoff, yoff){
    xoff = Math.abs(xoff);
    yoff = Math.abs(yoff);
    let width=chunkSize*mapScale;
    let height=chunkSize*mapScale;
    let heightmap = new ImageData(width, height);
    //fill heightmap with noise using "map" object

    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            let fx = x + xoff;
            let fy = y + yoff;
            //get noise value
            let value = map.get(fx, fy);
            //convert to 0-255
            value = Math.floor(value * 255);
            //set image data
            let cell = (x + y * width) * 4;
            heightmap.data[cell] = value;
            heightmap.data[cell+1] = value;
            heightmap.data[cell+2] = value;
            heightmap.data[cell+3] = 255;
        }
    }
    
    //create offscreen canvas
    let canv = new OffscreenCanvas(heightmap.width, heightmap.height);
    canv.width = heightmap.width;
    canv.height = heightmap.height;
    //draw heightmap to canvas
    let ctx = canv.getContext('2d');
    ctx.putImageData(heightmap, 0, 0);
    
    //OffscreenCanvas has no toDataURL method aaaaAAAAAAAAA

    let blob = await canv.convertToBlob({type: 'image/png', quality: 1});
    //read blob using FileReader
    let dataUrl = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

    return dataUrl;
}

















