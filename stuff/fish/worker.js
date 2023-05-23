importScripts("fishbrainClassic.js");
importScripts("main.js")


//receive message from main thread
onmessage = function(e) {
    let totalStart = Date.now();
    let sim = Simulation.deserialize(e.data.sim);
    let generations = e.data.generations;

    let generationTicks = 4000;
    for (let i = 0; i < generations; i++) {
        let startTime = Date.now();
        let ranTicks = sim.runGeneration(generationTicks);
        let endTime = Date.now();
        console.log("generation "+sim.generation + " finished, ticks: "+ranTicks+", time: "+(endTime-startTime)+"ms");
    }
    let totalEnd = Date.now();
    console.log("total time: "+(totalEnd-totalStart)+"ms");

    postMessage({sim:sim.serialize()});

}


























